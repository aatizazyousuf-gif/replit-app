/*
  Smart Gas Monitor - ESP32 firmware

  Reads an MQ-2 gas sensor and periodically sends readings to your
  Smart Gas Monitor backend over WiFi.

  SETUP:
  1. Fill in the CONFIG section below with your WiFi credentials and
     the DEVICE_ID / DEVICE_API_KEY shown to you on the app's
     "Device Credentials" screen (Setup Wizard, final step).
  2. Wire the MQ-2 sensor's analog output (A0) to GPIO34 on the ESP32,
     VCC to 5V (or 3.3V depending on your module), and GND to GND.
  3. In the Arduino IDE: Tools > Board > select your ESP32 board.
     No extra libraries need installing - WiFi.h and HTTPClient.h
     ship with the ESP32 board package.
  4. Upload, then open the Serial Monitor (115200 baud) to watch it run.

  NOTE ON ACCURACY:
  This firmware reports a simplified 0-100% "gas level" based on the raw
  analog reading relative to the sensor's clean-air baseline - it is NOT
  a calibrated ppm (parts-per-million) value. Getting true ppm out of an
  MQ-2 requires burning it in for 24-48 hours, measuring its clean-air
  resistance (R0), and applying the Rs/R0 curve from its datasheet. This
  is a reasonable starting point for "is something clearly wrong" alerts,
  not for precise concentration measurement.

  NOTE ON PRESSURE:
  You mentioned you don't have the MPXV7004DP pressure sensor yet, so
  this firmware sends a placeholder pressurePa of 0. Search for
  "TODO: pressure sensor" below once you add it.
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
const unsigned long SEND_INTERVAL_MS = 3000; // 30 seconds

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
// ====================================================================

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

void setup() {
  Serial.begin(115200);
  delay(1000);
  pinMode(MQ2_PIN, INPUT);
  connectWiFi();
  Serial.println("Warming up MQ-2 sensor (recommended: a few minutes before readings are meaningful)...");
}

void sendReading(float gasLevelPercent, bool gasDetected, float pressurePa) {
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
  body += "\"gasLevelPercent\":" + String(gasLevelPercent, 2) + ",";
  body += "\"pressurePa\":" + String(pressurePa, 2) + ",";
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
  // the note at the top of this file).
  float gasLevelPercent = ((float)(raw - MQ2_BASELINE) / (4095 - MQ2_BASELINE)) * 100.0;
  if (gasLevelPercent < 0) gasLevelPercent = 0;
  if (gasLevelPercent > 100) gasLevelPercent = 100;

  bool gasDetected = raw >= MQ2_ALERT_THRESHOLD;

  // TODO: pressure sensor - once you wire up the MPXV7004DP, read its
  // analog output here and convert to pascals per its datasheet, instead
  // of sending this placeholder 0.
  float pressurePa = 0;

  sendReading(gasLevelPercent, gasDetected, pressurePa);
}
