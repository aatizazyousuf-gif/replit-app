import { Router } from "express";
import { eq, desc, and, isNull, gte } from "drizzle-orm";
import { db, sensorReadingsTable, devicesTable, alertsTable, supplierCustomersTable } from "@workspace/db";
import { computeTankPercent } from "../lib/tankLevel";
import { CreateReadingBody } from "@workspace/api-zod";
import { requireAuth, requireDeviceAuth } from "../lib/auth";
import { sendPushToUser } from "../lib/push";
import { sendLeakEmailAlert } from "../lib/email";
import { applyGasWeight } from "../lib/tankLevel";

const router = Router();

// Only the device's owner may read its data. (Any supplier can link any
// homeowner by email, so "linked supplier" is not a safe reason to allow it.)
async function canAccessDevice(user: { id: number }, deviceId: number): Promise<boolean> {
  if (!Number.isInteger(deviceId)) return false;
  const [device] = await db.select().from(devicesTable).where(eq(devicesTable.id, deviceId));
  return !!device && device.userId === user.id;
}

// The ESP32 sends a reading every few seconds. Without this, a gas leak
// would create an alert + push + email on EVERY reading. Only alert again
// if there is no unresolved alert of the same type from the last 10 minutes.
const ALERT_COOLDOWN_MS = 10 * 60 * 1000;

router.get("/devices/:deviceId/readings", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.deviceId) ? req.params.deviceId[0] : req.params.deviceId;
  const deviceId = parseInt(raw, 10);
  if (!(await canAccessDevice((req as any).user, deviceId))) { res.status(404).json({ error: "Not found" }); return; }
  const readings = await db.select().from(sensorReadingsTable)
    .where(eq(sensorReadingsTable.deviceId, deviceId))
    .orderBy(desc(sensorReadingsTable.createdAt))
    .limit(24);
  res.json(readings);
});

// This endpoint is called by the ESP32 firmware itself, authenticated with its
// own API key (X-Device-Key header) rather than a user's browser session.
router.post("/devices/:deviceId/readings", requireDeviceAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.deviceId) ? req.params.deviceId[0] : req.params.deviceId;
  const deviceId = parseInt(raw, 10);
  const parsed = CreateReadingBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  // LOAD CELL (future): when the ESP32 has an HX711 load cell it sends the
  // gas weight with each reading. It replaces the manually entered weight
  // and goes through the same percentage + low-level alert logic. The
  // percentage is also saved with the reading so Analytics has history.
  let loadCellPercent: number | null = null;
  if (parsed.data.gasWeightKg != null) {
    const updated = await applyGasWeight(deviceId, { gasWeightKg: Math.max(0, parsed.data.gasWeightKg), source: "load_cell" });
    if (updated) loadCellPercent = computeTankPercent(updated);
  }

  const [reading] = await db.insert(sensorReadingsTable).values({
    deviceId,
    leakLevelPercent: parsed.data.leakLevelPercent,
    // Only trust tank-level/pressure data if this device actually has the
    // sensor - otherwise store null rather than a firmware placeholder.
    gasLevelPercent: parsed.data.gasLevelPercent ?? loadCellPercent,
    pressurePa: parsed.data.pressurePa ?? null,
    gasDetected: parsed.data.gasDetected,
  }).returning();

  // Auto-create alert if gas detected or tank critically low
  const [device] = await db.select().from(devicesTable).where(eq(devicesTable.id, deviceId));
  if (device) {
    let alertType: "gas_leak" | "low_level" | null = null;
    let alertMessage = "";
    if (parsed.data.gasDetected) {
      alertType = "gas_leak";
      alertMessage = "Gas detected by MQ-2 sensor. Check immediately.";
    } else if (device.hasPressureSensor && parsed.data.gasLevelPercent != null && parsed.data.gasLevelPercent < 20) {
      // Only fire a "tank running low" alert when we have a real pressure
      // reading to base it on - never derive it from the air-leak sensor.
      alertType = "low_level";
      alertMessage = `Tank level critically low at ${parsed.data.gasLevelPercent.toFixed(1)}%.`;
    }

    if (alertType) {
      const recent = await db.select().from(alertsTable).where(
        and(
          eq(alertsTable.deviceId, deviceId),
          eq(alertsTable.userId, device.userId),
          eq(alertsTable.type, alertType),
          isNull(alertsTable.resolvedAt),
          gte(alertsTable.createdAt, new Date(Date.now() - ALERT_COOLDOWN_MS)),
        ),
      );
      if (recent.length > 0) alertType = null;
    }

    if (alertType) {
      await db.insert(alertsTable).values({
        deviceId,
        userId: device.userId,
        type: alertType,
        message: alertMessage,
        severity: "critical",
      });

      const pushTitle = alertType === "gas_leak" ? "\u26a0\ufe0f Gas Leak Detected" : "\u26a0\ufe0f Tank Level Critically Low";

      // Notify the homeowner who owns the device: push + email (to the
      // account holder and every emergency contact they've added).
      await sendPushToUser(device.userId, pushTitle, alertMessage, {
        type: alertType,
        deviceId: String(deviceId),
      });
      await sendLeakEmailAlert(device.userId, pushTitle, alertMessage);

      // A leak or critical shortage also matters to the linked supplier -
      // they may need to prioritize a delivery, so alert them too.
      const [link] = await db.select().from(supplierCustomersTable).where(eq(supplierCustomersTable.homeownerId, device.userId));
      if (link) {
        await db.insert(alertsTable).values({
          deviceId,
          userId: link.supplierId,
          type: alertType,
          message: `Customer alert - ${alertMessage}`,
          severity: "critical",
        });
        await sendPushToUser(link.supplierId, pushTitle + " (Customer)", `One of your linked customers: ${alertMessage}`, {
          type: alertType,
          deviceId: String(deviceId),
        });
      }
    }

    // Update device status to online
    await db.update(devicesTable).set({ status: "online" }).where(eq(devicesTable.id, deviceId));
  }

  res.status(201).json(reading);
});

router.get("/devices/:deviceId/readings/latest", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.deviceId) ? req.params.deviceId[0] : req.params.deviceId;
  const deviceId = parseInt(raw, 10);
  if (!(await canAccessDevice((req as any).user, deviceId))) { res.status(404).json({ error: "Not found" }); return; }
  const [reading] = await db.select().from(sensorReadingsTable)
    .where(eq(sensorReadingsTable.deviceId, deviceId))
    .orderBy(desc(sensorReadingsTable.createdAt))
    .limit(1);
  if (!reading) { res.status(404).json({ error: "No readings" }); return; }
  res.json(reading);
});

export default router;
