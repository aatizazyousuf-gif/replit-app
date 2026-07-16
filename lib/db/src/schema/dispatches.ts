import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dispatchesTable = pgTable("dispatches", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").notNull(),
  orderId: integer("order_id").notNull(),
  driverName: text("driver_name"),
  truckNumber: text("truck_number"),
  status: text("status", { enum: ["pending", "en_route", "delivered", "cancelled"] }).notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDispatchSchema = createInsertSchema(dispatchesTable).omit({ id: true, createdAt: true });
export type InsertDispatch = z.infer<typeof insertDispatchSchema>;
export type Dispatch = typeof dispatchesTable.$inferSelect;
