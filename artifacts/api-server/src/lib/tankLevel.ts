import { and, eq, isNull } from "drizzle-orm";
import { db, devicesTable, alertsTable, supplierCustomersTable } from "@workspace/db";
import type { Device } from "@workspace/db";
import { sendPushToUser } from "./push";
import { sendLeakEmailAlert } from "./email";

/**
 * Tank level from GAS WEIGHT.
 *
 * Today the gas weight is typed in by the user (source = "manual").
 * Later a load cell (HX711) on the ESP32 will send it automatically
 * (source = "load_cell"). Both paths end up in applyGasWeight() below,
 * so the percentage and the low-level alert work the same either way.
 */

export function computeTankPercent(
  device: Pick<Device, "tankCapacityKg" | "gasWeightKg">,
): number | null {
  const { tankCapacityKg, gasWeightKg } = device;
  if (tankCapacityKg == null || gasWeightKg == null || tankCapacityKg <= 0) return null;
  const pct = (gasWeightKg / tankCapacityKg) * 100;
  return Math.max(0, Math.min(100, pct));
}

export function isTankLow(
  device: Pick<Device, "tankCapacityKg" | "gasWeightKg" | "lowLevelThresholdPercent">,
): boolean {
  const pct = computeTankPercent(device);
  return pct != null && pct < device.lowLevelThresholdPercent;
}

/** Raise a low-level alert (once), or clear it when the tank is OK again. */
export async function evaluateLowLevel(device: Device): Promise<void> {
  const pct = computeTankPercent(device);
  if (pct == null) return;

  const openAlerts = await db
    .select()
    .from(alertsTable)
    .where(
      and(
        eq(alertsTable.deviceId, device.id),
        eq(alertsTable.type, "low_level"),
        isNull(alertsTable.resolvedAt),
      ),
    );

  // Tank is fine (e.g. it was refilled): close any open low-level alerts.
  if (pct >= device.lowLevelThresholdPercent) {
    if (openAlerts.length > 0) {
      await db
        .update(alertsTable)
        .set({ resolvedAt: new Date() })
        .where(
          and(
            eq(alertsTable.deviceId, device.id),
            eq(alertsTable.type, "low_level"),
            isNull(alertsTable.resolvedAt),
          ),
        );
    }
    return;
  }

  // Already alerted and not resolved yet - don't spam.
  if (openAlerts.length > 0) return;

  const kg = device.gasWeightKg ?? 0;
  const message = `Gas is running low: ${kg.toFixed(1)} kg left (${pct.toFixed(0)}%).`;
  const title = "\u26a0\ufe0f Tank Level Low";

  await db.insert(alertsTable).values({
    deviceId: device.id,
    userId: device.userId,
    type: "low_level",
    message,
    severity: "critical",
  });
  await sendPushToUser(device.userId, title, message, {
    type: "low_level",
    deviceId: String(device.id),
  });
  await sendLeakEmailAlert(device.userId, title, message);

  // Let the linked supplier know too, so they can plan a delivery.
  const [link] = await db
    .select()
    .from(supplierCustomersTable)
    .where(eq(supplierCustomersTable.homeownerId, device.userId));
  if (link) {
    await db.insert(alertsTable).values({
      deviceId: device.id,
      userId: link.supplierId,
      type: "low_level",
      message: `Customer alert - ${message}`,
      severity: "critical",
    });
    await sendPushToUser(link.supplierId, title + " (Customer)", `One of your linked customers: ${message}`, {
      type: "low_level",
      deviceId: String(device.id),
    });
  }
}

export interface GasWeightUpdate {
  gasWeightKg: number;
  source: "manual" | "load_cell";
  tankCapacityKg?: number;
  lowLevelThresholdPercent?: number;
}

/** Single entry point: save a new gas weight, then check the alert rules. */
export async function applyGasWeight(deviceId: number, update: GasWeightUpdate): Promise<Device | null> {
  const values: Partial<typeof devicesTable.$inferInsert> = {
    gasWeightKg: update.gasWeightKg,
    gasWeightSource: update.source,
    gasWeightUpdatedAt: new Date(),
  };
  if (update.tankCapacityKg !== undefined) values.tankCapacityKg = update.tankCapacityKg;
  if (update.lowLevelThresholdPercent !== undefined) {
    values.lowLevelThresholdPercent = update.lowLevelThresholdPercent;
  }

  const [device] = await db
    .update(devicesTable)
    .set(values)
    .where(eq(devicesTable.id, deviceId))
    .returning();
  if (!device) return null;

  await evaluateLowLevel(device);
  return device;
}
