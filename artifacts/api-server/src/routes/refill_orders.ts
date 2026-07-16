import { Router } from "express";
import { eq, or } from "drizzle-orm";
import { db, refillOrdersTable } from "@workspace/db";
import { CreateRefillOrderBody, UpdateRefillOrderBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const DELIVERY_FEES: Record<string, number> = {
  standard: 0,
  express: 15,
  emergency: 45,
};
const PRICE_PER_GALLON = 2.80;

const router = Router();

router.get("/refill-orders", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const orders = user.role === "supplier"
    ? await db.select().from(refillOrdersTable).where(eq(refillOrdersTable.supplierId, user.id))
    : await db.select().from(refillOrdersTable).where(eq(refillOrdersTable.homeownerId, user.id));
  res.json(orders);
});

router.post("/refill-orders", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const parsed = CreateRefillOrderBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const deliveryFee = DELIVERY_FEES[parsed.data.deliveryType] ?? 0;
  const basePrice = parsed.data.volumeGallons * PRICE_PER_GALLON;
  const totalPrice = basePrice + deliveryFee + 5; // $5 safety inspection fee

  const [order] = await db.insert(refillOrdersTable).values({
    homeownerId: user.id,
    supplierId: parsed.data.supplierId ?? null,
    deliveryType: parsed.data.deliveryType,
    volumeGallons: parsed.data.volumeGallons,
    totalPrice,
    deliveryFee,
    notes: parsed.data.notes ?? null,
    status: "pending",
  }).returning();

  res.status(201).json(order);
});

router.get("/refill-orders/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [order] = await db.select().from(refillOrdersTable).where(eq(refillOrdersTable.id, id));
  if (!order) { res.status(404).json({ error: "Not found" }); return; }
  res.json(order);
});

router.patch("/refill-orders/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const parsed = UpdateRefillOrderBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const updates: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;
  if (parsed.data.supplierId !== undefined) updates.supplierId = parsed.data.supplierId;
  if (parsed.data.estimatedArrival !== undefined) updates.estimatedArrival = parsed.data.estimatedArrival;
  if (parsed.data.driverName !== undefined) updates.driverName = parsed.data.driverName;

  const [order] = await db.update(refillOrdersTable).set(updates).where(eq(refillOrdersTable.id, id)).returning();
  if (!order) { res.status(404).json({ error: "Not found" }); return; }
  res.json(order);
});

export default router;
