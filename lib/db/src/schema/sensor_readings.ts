import { pgTable, serial, integer, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sensorReadingsTable = pgTable("sensor_readings", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").notNull(),
  // MQ-2 gas sensor reading, scaled 0-100 relative to its clean-air
  // baseline. This is a LEAK signal (is there gas in the air right now),
  // not a tank fill level - see gasLevelPercent below for that.
  leakLevelPercent: real("leak_level_percent").notNull(),
  // Tank fill %, calculated by the backend from the gas weight (manual
  // entry or load cell). Null when no tank weight is known - never a
  // fabricated placeholder.
  gasLevelPercent: real("gas_level_percent"),
  // Differential pressure in Pascals from the MPXV7002DP. Null when the
  // device has no pressure sensor.
  pressurePa: real("pressure_pa"),
  gasDetected: boolean("gas_detected").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSensorReadingSchema = createInsertSchema(sensorReadingsTable).omit({ id: true, createdAt: true });
export type InsertSensorReading = z.infer<typeof insertSensorReadingSchema>;
export type SensorReading = typeof sensorReadingsTable.$inferSelect;
