import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
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
  // Whether this device has a real MPXV7004DP pressure sensor wired up.
  // Until it does, tank-level readings are unavailable (never faked as 0%
  // or any other number) - the UI shows an honest "not connected" state
  // instead. Flip this on once the hardware is actually there.
  hasPressureSensor: boolean("has_pressure_sensor").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDeviceSchema = createInsertSchema(devicesTable).omit({ id: true, createdAt: true });
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type Device = typeof devicesTable.$inferSelect;
