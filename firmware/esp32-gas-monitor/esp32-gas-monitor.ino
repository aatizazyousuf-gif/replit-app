/*
  Smart Gas Monitor - ESP32 firmware

  Reads an MQ-2 gas (leak) sensor and an MPXV7002DP differential pressure
  sensor (pressure drop across an orifice plate), and periodically sends
  both to your Smart Gas Monitor backend over WiFi.

  SETUP:
  1. Fill in the CONFIG section below with your WiFi credentials and
     the DEVICE_ID / DEVICE_API_KEY shown to you on the app's
     "Device Credentials" screen (Setup Wizard, final step).
  2. Wire the MQ-2 sensor's analog output (A0) to GPIO34 on the ESP32,
     VCC to 5V (or 3.3V depending on your module), and GND to GND.
     WARNING: on a 5V MQ-2 module, A0 can rise above 3.3V in gas, which
     can damage the ESP32 pin. Put a 10k + 20k voltage divider on A0 (same
     as the pressure sensor) or confirm your module's A0 stays below 3.3V.
     If you add a divider, re-tune MQ2_BASELINE and MQ2_ALERT_THRESHOLD.
  3. Wire the MPXV7002DP as shown in PRESSURE SENSOR WIRING below.
  4. In the Arduino IDE: Tools > Board > select your ESP32 board.
     No extra libraries need installing - WiFi.h and HTTPClient.h
     ship with the ESP32 board package.
  5. Upload, then open the Serial Monitor (115200 baud) to watch it run.

  NOTE ON THE TWO SIGNALS THIS DEVICE REPORTS:
  These are two different things, from two different sensors - don't mix
  them up in the app UI or in your report:
    - "Leak level" (leakLevelPercent, below) comes from the MQ-2. It's a
      simplified 0-100% scale based on the raw analog reading relative to
      the sensor's clean-air baseline - it is NOT a calibrated ppm
      (parts-per-million) value. Getting true ppm out of an MQ-2 requires
      burning it in for 24-48 hours, measuring its clean-air resistance
      (R0), and applying the Rs/R0 curve from its datasheet. This is a
      reasonable starting point for "is something clearly wrong" alerts,
      not for precise concentration measurement. It tells you whether gas
      is present in the air right now - it says nothing about how full
      the cylinder is.
    - "Gas level" / tank level (shown in the app) comes from the gas
      WEIGHT: typed in by the user on the app's "Gas Weight" screen, or
      sent automatically by a load cell later (see LOAD CELL below).
    - "Pressure" (pressurePa) comes from the MPXV7002DP differential
      pressure sensor. It reads only about +-2 kPa, so it measures a small
      pressure DIFFERENCE (for example across an orifice in the gas line,
      to estimate flow). Never connect it directly to the cylinder or the
      regulator output. It is NOT a tank level - cylinder pressure does
      not tell you how full an LPG cylinder is.

  PRESSURE SENSOR WIRING (MPXV7002DP breakout board):
    +5V    -> ESP32 VIN (5V)
    GND    -> ESP32 GND
    ANALOG -> 10k resistor -> GPIO35, and from GPIO35 two 10k resistors in
              series (20k total) to GND. This divider scales 0.5-4.5V
              down to 0.33-3.0V so the ESP32 pin is safe.
  Keep BOTH sensor ports open to air while the ESP32 starts: it measures
  the zero point at boot.

  ORIFICE PLATE PLUMBING (pressure drop):
    The sensor has two ports and reports the DIFFERENCE between them.
    Connect the port that gives a POSITIVE reading when you blow into it to
    the tap BEFORE the orifice plate (upstream), and the other port to the
    tap AFTER the plate (downstream). Gas flowing through the orifice then
    shows as a positive pressure drop in the app. If you get negative
    numbers while gas flows, swap the two tubes or set PRESSURE_REVERSED to
    true below. One sensor cannot report the "before" and "after"
    pressures separately - only their difference.
*/

#include <WiFi.h>
#include <HTTPClient.h>

// ===================== CONFIG - fill these in =====================
const char* WIFI_SSID     = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// The base URL of your backend (no trailing slash), e.g.:
// "https://obligations-pond-pays-fuji.trycloudflare.com"
// Update this and re-upload whenever your tunnel URL changes.
const char* SERVER_URL = "https://YOUR-BACKEND-URL-HERE";

// From the app's Setup Wizard "Device Credentials" screen
const int   DEVICE_ID      = 0;               // e.g. 1
const char* DEVICE_API_KEY = "YOUR_DEVICE_API_KEY_HERE";

// How often to send a reading (milliseconds)
const unsigned long SEND_INTERVAL_MS = 3000; // 3 seconds (use 30000 for 30 s)

// MQ-2 analog input pin (ADC1 pins only: 32-39 - avoids WiFi/ADC2 conflicts)
const int MQ2_PIN = 34;

// Raw ADC reading (0-4095) considered "clean air" baseline for your sensor
// and room. Watch the Serial Monitor for a minute in clean air after the
// sensor has warmed up (give it a few minutes when first powered), note
// the typical value it settles at, and put that here.
const int MQ2_BASELINE = 400;

// Raw ADC reading above which you consider gas actively "detected"
// (i.e. worth an alert, not just background drift). Tune this by testing
// with a small amount of butane/lighter gas near the sensor and seeing
// what value it jumps to.
const int MQ2_ALERT_THRESHOLD = 3300;

// MPXV7002DP pressure sensor. Set to false if it is not wired up - the
// firmware then sends no pressure data at all (never a fake number).
const bool PRESSURE_SENSOR_CONNECTED = true;
const int   PRESSURE_PIN = 35;      // ADC1 pin, see wiring in the header
const float PRESSURE_SUPPLY_V = 5.0; // sensor supply (ESP32 VIN, about 4.7-5.0 V)
const float PRESSURE_DIVIDER  = 1.5; // undo the 10k/20k divider (x 1.5)
const bool  PRESSURE_REVERSED = false; // true = flip the sign (tubes plugged the other way round)

float pressureZeroMv = 0;            // pin millivolts at zero pressure (set at boot)

// ---------------------- LOAD CELL (future) ----------------------
// Until a load cell is wired up, the gas weight is typed in by the user in
// the app ("Gas Weight" screen) and this firmware sends no weight.
// When you add a load cell + HX711 amplifier:
//   1. Install the "HX711" library by Rob Tillaart or bogde
//      (Sketch > Include Library > Manage Libraries).
//   2. Wire HX711: DT -> GPIO16, SCK -> GPIO17, VCC -> 3.3V, GND -> GND.
//   3. Change LOAD_CELL_ENABLED below from 0 to 1.
//   4. Calibrate LOAD_CELL_SCALE with a known weight, and set
//      EMPTY_CYLINDER_KG to the cylinder's empty weight (the "TW" number
//      stamped on the cylinder collar).
// The backend then replaces the manual weight with this one automatically
// and runs the same low-level alert.
#define LOAD_CELL_ENABLED 0
#if LOAD_CELL_ENABLED
  #include <HX711.h>
  const int   HX711_DOUT_PIN    = 16;
  const int   HX711_SCK_PIN     = 17;
  const float LOAD_CELL_SCALE   = 1.0;  // TODO: raw units per kg, from calibration
  const float EMPTY_CYLINDER_KG = 0.0;  // TODO: empty cylinder weight (TW)
  HX711 scale;
#endif
// =====================================================================

unsigned long lastSendTime = 0;

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Connected! IP address: ");
  Serial.println(WiFi.localIP());
}

// Average several ADC readings (in millivolts) to reduce noise.
float readPressureMv(int samples) {
  long sum = 0;
  for (int i = 0; i < samples; i++) {
    sum += analogReadMilliVolts(PRESSURE_PIN);
    delay(2);
  }
  return sum / (float)samples;
}

// Differential pressure in Pascals (positive/negative depending on which
// port has the higher pressure). MPXV7002DP: Vout = Vs * (0.2 * kPa + 0.5),
// so the output changes by 0.2 * Vs volts per kPa.
float readPressurePa() {
  float mv = readPressureMv(20);
  float deltaV = (mv - pressureZeroMv) * PRESSURE_DIVIDER / 1000.0;
  float kPa = deltaV / (0.2 * PRESSURE_SUPPLY_V);
  float pa = kPa * 1000.0;
  return PRESSURE_REVERSED ? -pa : pa;
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  pinMode(MQ2_PIN, INPUT);
  if (PRESSURE_SENSOR_CONNECTED) {
    analogSetPinAttenuation(PRESSURE_PIN, ADC_11db);
    Serial.println("Measuring pressure sensor zero point - keep both ports open to air...");
    delay(1500);
    pressureZeroMv = readPressureMv(300);
    Serial.print("Pressure zero point (mV at pin): ");
    Serial.println(pressureZeroMv);
  }
#if LOAD_CELL_ENABLED
  scale.begin(HX711_DOUT_PIN, HX711_SCK_PIN);
  scale.set_scale(LOAD_CELL_SCALE);
#endif
  connectWiFi();
  Serial.println("Warming up MQ-2 sensor (recommended: a few minutes before readings are meaningful)...");
}

// Gas weight in kg from the load cell. Returns false when no load cell is
// enabled (or it isn't ready), in which case no weight is sent and the app's
// manually entered weight is used instead.
bool readGasWeightKg(float &gasWeightKg) {
#if LOAD_CELL_ENABLED
  if (!scale.is_ready()) return false;
  float grossKg = scale.get_units(10);          // cylinder + gas
  if (isnan(grossKg)) return false;             // a bad reading would break the JSON
  gasWeightKg = grossKg - EMPTY_CYLINDER_KG;    // gas only
  if (gasWeightKg < 0) gasWeightKg = 0;
  return true;
#else
  (void)gasWeightKg;
  return false;
#endif
}

// hasPressureData is false when PRESSURE_SENSOR_CONNECTED is false - then
// pressurePa is left out of the JSON entirely instead of being sent as 0, so
// the backend records "no pressure data" rather than a fake reading. The same
// goes for gasWeightKg (load cell). The tank level itself is never sent from
// here: the backend calculates it from the gas weight.
void sendReading(float leakLevelPercent, bool gasDetected, bool hasPressureData, float pressurePa, bool hasWeightData, float gasWeightKg) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi disconnected, attempting to reconnect...");
    connectWiFi();
  }

  HTTPClient http;
  String url = String(SERVER_URL) + "/api/devices/" + String(DEVICE_ID) + "/readings";
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-Device-Key", DEVICE_API_KEY);

  String body = "{";
  body += "\"leakLevelPercent\":" + String(leakLevelPercent, 2) + ",";
  if (hasPressureData) {
    body += "\"pressurePa\":" + String(pressurePa, 2) + ",";
  }
  if (hasWeightData) {
    body += "\"gasWeightKg\":" + String(gasWeightKg, 3) + ",";
  }
  body += "\"gasDetected\":" + String(gasDetected ? "true" : "false");
  body += "}";

  Serial.print("POST ");
  Serial.println(url);
  Serial.print("Body: ");
  Serial.println(body);

  int statusCode = http.POST(body);

  if (statusCode > 0) {
    Serial.print("Response code: ");
    Serial.println(statusCode);
    Serial.println(http.getString());
  } else {
    Serial.print("Request failed: ");
    Serial.println(http.errorToString(statusCode));
  }

  http.end();
}

void loop() {
  unsigned long now = millis();
  if (now - lastSendTime < SEND_INTERVAL_MS && lastSendTime != 0) {
    return;
  }
  lastSendTime = now;

  int raw = analogRead(MQ2_PIN);
  Serial.print("MQ-2 raw ADC reading: ");
  Serial.println(raw);

  // Simplified 0-100% scale relative to baseline (NOT calibrated ppm - see
  // the note at the top of this file). This is the LEAK signal, not a
  // tank level.
  float leakLevelPercent = ((float)(raw - MQ2_BASELINE) / (4095 - MQ2_BASELINE)) * 100.0;
  if (leakLevelPercent < 0) leakLevelPercent = 0;
  if (leakLevelPercent > 100) leakLevelPercent = 100;

  bool gasDetected = raw >= MQ2_ALERT_THRESHOLD;

  float pressurePa = 0;
  bool hasPressureData = false;

  if (PRESSURE_SENSOR_CONNECTED) {
    pressurePa = readPressurePa();
    hasPressureData = !isnan(pressurePa);
    Serial.print("Pressure drop across orifice (before - after): ");
    Serial.print(pressurePa, 1);
    Serial.println(" Pa");
  } else {
    Serial.println("Pressure sensor not connected - not sending pressure data.");
  }

  // Load cell (optional): sends the gas weight so the app can keep the tank
  // level and low-level alert up to date automatically.
  float gasWeightKg = 0;
  bool hasWeightData = readGasWeightKg(gasWeightKg);
  if (hasWeightData) {
    Serial.print("Gas weight (load cell): ");
    Serial.print(gasWeightKg, 3);
    Serial.println(" kg");
  }

  sendReading(leakLevelPercent, gasDetected, hasPressureData, pressurePa, hasWeightData, gasWeightKg);
}
