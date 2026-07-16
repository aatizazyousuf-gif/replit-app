import { pgTable, text, serial, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const refillOrdersTable = pgTable("refill_orders", {
  id: serial("id").primaryKey(),
  homeownerId: integer("homeowner_id").notNull(),
  supplierId: integer("supplier_id"),
  status: text("status", { enum: ["pending", "dispatched", "en_route", "delivered", "cancelled"] }).notNull().default("pending"),
  deliveryType: text("delivery_type", { enum: ["standard", "express", "emergency"] }).notNull(),
  volumeGallons: real("volume_gallons").notNull(),
  totalPrice: real("total_price").notNull(),
  deliveryFee: real("delivery_fee").notNull().default(0),
  notes: text("notes"),
  estimatedArrival: text("estimated_arrival"),
  driverName: text("driver_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertRefillOrderSchema = createInsertSchema(refillOrdersTable).omit({ id: true, createdAt: true });
export type InsertRefillOrder = z.infer<typeof insertRefillOrderSchema>;
export type RefillOrder = typeof refillOrdersTable.$inferSelect;
