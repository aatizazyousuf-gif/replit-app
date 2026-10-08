import { pgTable, text, serial, integer, boolean, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const devicesTable = pgTable("devices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  deviceSerial: text("device_serial").notNull(),
  name: text("name").notNull(),
  status: text("status", { enum: ["online", "offline", "calibrating"] }).notNull().default("offline"),
  wifiNetwork: text("wifi_network"),
  apiKey: text("api_key"),
  // Whether this device has a real MPXV7002DP differential pressure sensor
  // wired up. When false the app shows no pressure reading (never a fake
  // 0). This is a differential pressure (about +-2 kPa), not a tank level.
  hasPressureSensor: boolean("has_pressure_sensor").notNull().default(false),
  // ── Tank weight (manual entry now, load cell later) ────────────────
  // Net LPG capacity of the cylinder in kg (e.g. 11.8 for a domestic one).
  tankCapacityKg: real("tank_capacity_kg"),
  // Current weight of the GAS in the tank in kg (not the gross weight).
  // Entered by hand in the app today; a load cell (HX711) will overwrite
  // it automatically later - see gasWeightSource.
  gasWeightKg: real("gas_weight_kg"),
  gasWeightSource: text("gas_weight_source", { enum: ["manual", "load_cell"] }).notNull().default("manual"),
  gasWeightUpdatedAt: timestamp("gas_weight_updated_at", { withTimezone: true }),
  // A "low level" alert fires when gas left drops below this percentage.
  lowLevelThresholdPercent: real("low_level_threshold_percent").notNull().default(20),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDeviceSchema = createInsertSchema(devicesTable).omit({ id: true, createdAt: true });
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Device = typeof devicesTable.$inferSelect;
