import { Router } from "express";
import { eq, and, isNull, desc } from "drizzle-orm";
import { db, devicesTable, sensorReadingsTable, alertsTable, refillOrdersTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";

const router = Router();

router.get("/homeowner/summary", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  if (user.role !== "homeowner") { res.status(403).json({ error: "Forbidden" }); return; }

  const [device] = await db.select().from(devicesTable).where(eq(devicesTable.userId, user.id));

  let gasLevelPercent: number | null = null;
  let pressurePa: number | null = null;
  let gasDetected: boolean | null = null;
  let estimatedDaysLeft: number | null = null;

  if (device) {
    const [latest] = await db.select().from(sensorReadingsTable)
      .where(eq(sensorReadingsTable.deviceId, device.id))
      .orderBy(desc(sensorReadingsTable.createdAt))
      .limit(1);
    if (latest) {
      gasLevelPercent = latest.gasLevelPercent;
      pressurePa = latest.pressurePa;
      gasDetected = latest.gasDetected;
      // Estimate: assume 1% usage per day
      estimatedDaysLeft = latest.gasLevelPercent > 0 ? Math.floor(latest.gasLevelPercent / 1.2) : 0;
    }
  }

  const activeAlertsList = await db.select().from(alertsTable).where(
    and(eq(alertsTable.userId, user.id), isNull(alertsTable.resolvedAt))
  );

  const [activeOrder] = await db.select().from(refillOrdersTable).where(
    and(eq(refillOrdersTable.homeownerId, user.id))
  ).orderBy(desc(refillOrdersTable.createdAt)).limit(1);

  const activeOrderResult = activeOrder && ["pending", "dispatched", "en_route"].includes(activeOrder.status)
    ? activeOrder
    : null;

  res.json({
    gasLevelPercent,
    pressurePa,
    gasDetected,
    activeAlerts: activeAlertsList.length,
    activeOrder: activeOrderResult,
    device: device ?? null,
    estimatedDaysLeft,
  });
});

router.get("/homeowner/analytics/usage", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  if (user.role !== "homeowner") { res.status(403).json({ error: "Forbidden" }); return; }

  const [device] = await db.select().from(devicesTable).where(eq(devicesTable.userId, user.id));

  if (!device) {
    // Return empty data with sensible labels
    const result = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { label: d.toLocaleDateString("default", { weekday: "short" }), avgLevel: 0, minLevel: 0, maxLevel: 0 };
    });
    res.json(result);
    return;
  }

  const readings = await db.select().from(sensorReadingsTable)
    .where(eq(sensorReadingsTable.deviceId, device.id))
    .orderBy(desc(sensorReadingsTable.createdAt))
    .limit(168); // last 7 days of hourly readings

  // Group by day
  const days: Record<string, number[]> = {};
  for (const r of readings) {
    const key = new Date(r.createdAt).toLocaleDateString("default", { weekday: "short" });
    if (!days[key]) days[key] = [];
    days[key].push(r.gasLevelPercent);
  }

  // Ensure last 7 days present
  const result = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString("default", { weekday: "short" });
    const vals = days[label] ?? [];
    return {
      label,
      avgLevel: vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0,
      minLevel: vals.length ? Math.min(...vals) : 0,
      maxLevel: vals.length ? Math.max(...vals) : 0,
    };
  });

  res.json(result);
});

export default router;
