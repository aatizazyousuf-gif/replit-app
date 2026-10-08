import { Router } from "express";
import { eq, and, isNull, desc, inArray } from "drizzle-orm";
import { db, devicesTable, sensorReadingsTable, alertsTable, refillOrdersTable, supplierCustomersTable, usersTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";
import { computeTankPercent, isTankLow } from "../lib/tankLevel";

const router = Router();

// If the newest sensor reading is older than this, the device counts as offline.
const STALE_READING_MS = 2 * 60 * 1000;

// A homeowner can end up with several device rows (for example every time the
// Setup Wizard is run). The ESP32 sends to just one of them, so show the device
// that most recently sent a reading; if none has sent anything yet, show the
// newest one.
async function pickActiveDevice(userId: number) {
  const devices = await db.select().from(devicesTable)
    .where(eq(devicesTable.userId, userId))
    .orderBy(desc(devicesTable.id));
  if (devices.length === 0) return { device: undefined, latest: undefined };

  const [newest] = await db.select().from(sensorReadingsTable)
    .where(inArray(sensorReadingsTable.deviceId, devices.map((d) => d.id)))
    .orderBy(desc(sensorReadingsTable.createdAt))
    .limit(1);

  const device = newest ? (devices.find((d) => d.id === newest.deviceId) ?? devices[0]) : devices[0];
  return { device, latest: newest };
}

router.get("/homeowner/supplier", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  if (user.role !== "homeowner") { res.status(403).json({ error: "Forbidden" }); return; }

  const [link] = await db.select().from(supplierCustomersTable).where(eq(supplierCustomersTable.homeownerId, user.id));
  if (!link) { res.json(null); return; }

  const [supplier] = await db.select().from(usersTable).where(eq(usersTable.id, link.supplierId));
  if (!supplier) { res.json(null); return; }

  res.json({ id: supplier.id, name: supplier.name, email: supplier.email });
});

router.get("/homeowner/summary", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  if (user.role !== "homeowner") { res.status(403).json({ error: "Forbidden" }); return; }

  const { device, latest } = await pickActiveDevice(user.id);

  let leakLevelPercent: number | null = null;
  let gasLevelPercent: number | null = null; // real tank fill %, pressure sensor only
  let pressurePa: number | null = null;
  let gasDetected: boolean | null = null;
  let estimatedDaysLeft: number | null = null;
  let isTankLowNow = false;
  let deviceOffline = false;

  if (device) {
    // Tank level from the gas WEIGHT (typed in by the user now, sent by a
    // load cell later). null until a weight and capacity have been set.
    const weightPercent = computeTankPercent(device);
    if (weightPercent != null) {
      gasLevelPercent = weightPercent;
      isTankLowNow = isTankLow(device);
      // Rough estimate: assume 1.2% tank usage per day.
      estimatedDaysLeft = weightPercent > 0 ? Math.floor(weightPercent / 1.2) : 0;
    }

    // A reading older than this means the ESP32 is offline. Don't show an
    // old leak state as if it were live.
    const deviceIsLive = !!latest && Date.now() - new Date(latest.createdAt).getTime() < STALE_READING_MS;
    deviceOffline = !deviceIsLive;
    if (latest && deviceIsLive) {
      leakLevelPercent = latest.leakLevelPercent;
      gasDetected = latest.gasDetected;
      // Differential pressure from the MPXV7002DP (null when the device has
      // no pressure sensor and so never sends one). This is NOT the tank
      // level - that comes from the gas weight above.
      pressurePa = latest.pressurePa;
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
    leakLevelPercent,
    gasLevelPercent,
    pressurePa,
    gasDetected,
    activeAlerts: activeAlertsList.length,
    activeOrder: activeOrderResult,
    device: device ? { ...device, status: deviceOffline ? "offline" : device.status } : null,
    estimatedDaysLeft,
    isTankLow: isTankLowNow,
  });
});

router.get("/homeowner/analytics/usage", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  if (user.role !== "homeowner") { res.status(403).json({ error: "Forbidden" }); return; }

  const { device } = await pickActiveDevice(user.id);

  if (!device) {
    // No device at all - genuinely no data, not a flat 0% week.
    res.json([]);
    return;
  }

  const readings = await db.select().from(sensorReadingsTable)
    .where(eq(sensorReadingsTable.deviceId, device.id))
    .orderBy(desc(sensorReadingsTable.createdAt))
    .limit(168); // last 7 days of hourly readings

  // "Usage" means tank depletion, which only the pressure sensor can tell
  // us - the MQ-2 leak sensor has nothing to say about how full the tank
  // is. Readings without a real gasLevelPercent (no pressure sensor yet)
  // are skipped, same as the "no device" case above.
  const days: Record<string, number[]> = {};
  for (const r of readings) {
    if (r.gasLevelPercent == null) continue;
    const key = new Date(r.createdAt).toLocaleDateString("default", { weekday: "short" });
    if (!days[key]) days[key] = [];
    days[key].push(r.gasLevelPercent);
  }

  // Only include days where we actually have real tank-level readings -
  // no pressure sensor means no data, not a flat 0% line that looks like
  // real (very bad) data.
  const result = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString("default", { weekday: "short" });
    const vals = days[label] ?? [];
    if (!vals.length) return null;
    return {
      label,
      avgLevel: vals.reduce((a, b) => a + b, 0) / vals.length,
      minLevel: Math.min(...vals),
      maxLevel: Math.max(...vals),
    };
  }).filter((r): r is NonNullable<typeof r> => r !== null);

  res.json(result);
});

export default router;
