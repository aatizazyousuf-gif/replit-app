import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, sensorReadingsTable, devicesTable, alertsTable } from "@workspace/db";
import { CreateReadingBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

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

router.post("/devices/:deviceId/readings", requireAuth, async (req, res): Promise<void> => {
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
    if (parsed.data.gasDetected) {
      await db.insert(alertsTable).values({
        deviceId,
        userId: device.userId,
        type: "gas_leak",
        message: "Gas detected by MQ-2 sensor. Check immediately.",
        severity: "critical",
      });
    } else if (parsed.data.gasLevelPercent < 20) {
      await db.insert(alertsTable).values({
        deviceId,
        userId: device.userId,
        type: "low_level",
        message: `Gas level critically low at ${parsed.data.gasLevelPercent.toFixed(1)}%.`,
        severity: "critical",
      });
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
