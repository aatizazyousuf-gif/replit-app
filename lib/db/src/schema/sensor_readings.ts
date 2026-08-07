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
  // Real tank fill %, derived from the MPXV7004DP pressure sensor. Null
  // until a device actually has that sensor wired up (hasPressureSensor on
  // the device row) - never a fabricated placeholder.
  gasLevelPercent: real("gas_level_percent"),
  // Raw pressure reading in Pascals. Null for the same reason as above.
  pressurePa: real("pressure_pa"),
  gasDetected: boolean("gas_detected").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSensorReadingSchema = createInsertSchema(sensorReadingsTable).omit({ id: true, createdAt: true });
export type InsertSensorReading = z.infer<typeof insertSensorReadingSchema>;
export type SensorReading = typeof sensorReadingsTable.$inferSelect;
