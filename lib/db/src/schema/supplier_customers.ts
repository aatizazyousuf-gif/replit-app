import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const supplierCustomersTable = pgTable("supplier_customers", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").notNull(),
  homeownerId: integer("homeowner_id").notNull(),
  linkedAt: timestamp("linked_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSupplierCustomerSchema = createInsertSchema(supplierCustomersTable).omit({ id: true, linkedAt: true });
export type InsertSupplierCustomer = z.infer<typeof insertSupplierCustomerSchema>;
export type SupplierCustomer = typeof supplierCustomersTable.$inferSelect;
