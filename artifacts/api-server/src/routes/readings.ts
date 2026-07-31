import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, sensorReadingsTable, devicesTable, alertsTable, supplierCustomersTable } from "@workspace/db";
import { CreateReadingBody } from "@workspace/api-zod";
import { requireAuth, requireDeviceAuth } from "../lib/auth";
import { sendPushToUser } from "../lib/push";
import { sendLeakEmailAlert } from "../lib/email";

const router = Router();

router.get("/devices/:deviceId/readings", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.deviceId) ? req.params.deviceId[0] : req.params.deviceId;
  const deviceId = parseInt(raw, 10);
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

  const [reading] = await db.insert(sensorReadingsTable).values({
    deviceId,
    gasLevelPercent: parsed.data.gasLevelPercent,
    pressurePa: parsed.data.pressurePa,
    gasDetected: parsed.data.gasDetected,
  }).returning();

  // Auto-create alert if gas detected or level critical
  const [device] = await db.select().from(devicesTable).where(eq(devicesTable.id, deviceId));
  if (device) {
    let alertType: "gas_leak" | "low_level" | null = null;
    let alertMessage = "";
    if (parsed.data.gasDetected) {
      alertType = "gas_leak";
      alertMessage = "Gas detected by MQ-2 sensor. Check immediately.";
    } else if (parsed.data.gasLevelPercent < 20) {
      alertType = "low_level";
      alertMessage = `Gas level critically low at ${parsed.data.gasLevelPercent.toFixed(1)}%.`;
    }

    if (alertType) {
      await db.insert(alertsTable).values({
        deviceId,
        userId: device.userId,
        type: alertType,
        message: alertMessage,
        severity: "critical",
      });

      const pushTitle = alertType === "gas_leak" ? "\u26a0\ufe0f Gas Leak Detected" : "\u26a0\ufe0f Gas Level Critically Low";

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
  const [reading] = await db.select().from(sensorReadingsTable)
    .where(eq(sensorReadingsTable.deviceId, deviceId))
    .orderBy(desc(sensorReadingsTable.createdAt))
    .limit(1);
  if (!reading) { res.status(404).json({ error: "No readings" }); return; }
  res.json(reading);
});

export default router;
