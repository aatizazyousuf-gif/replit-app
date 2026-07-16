import { Router } from "express";
import { eq, and, desc, gte } from "drizzle-orm";
import { db, supplierCustomersTable, usersTable, devicesTable, sensorReadingsTable, inventoryTable, dispatchesTable, refillOrdersTable } from "@workspace/db";
import { LinkCustomerBody, CreateInventoryItemBody, UpdateInventoryItemBody, CreateDispatchBody, UpdateDispatchBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router = Router();

// ── Customers ─────────────────────────────────────────────────────────

router.get("/supplier/customers", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  if (user.role !== "supplier") { res.status(403).json({ error: "Forbidden" }); return; }

  const links = await db.select().from(supplierCustomersTable).where(eq(supplierCustomersTable.supplierId, user.id));

  const customers = await Promise.all(links.map(async (link) => {
    const [homeowner] = await db.select().from(usersTable).where(eq(usersTable.id, link.homeownerId));
    const devices = await db.select().from(devicesTable).where(eq(devicesTable.userId, link.homeownerId));
    let gasLevelPercent: number | null = null;
    if (devices.length > 0) {
      const [latestReading] = await db.select().from(sensorReadingsTable)
        .where(eq(sensorReadingsTable.deviceId, devices[0].id))
        .orderBy(desc(sensorReadingsTable.createdAt))
        .limit(1);
      gasLevelPercent = latestReading?.gasLevelPercent ?? null;
    }
    return {
      id: link.id,
      supplierId: link.supplierId,
      homeownerId: link.homeownerId,
      homeownerName: homeowner?.name ?? "Unknown",
      homeownerEmail: homeowner?.email ?? "",
      gasLevelPercent,
      deviceCount: devices.length,
      linkedAt: link.linkedAt,
    };
  }));

  res.json(customers);
});

router.post("/supplier/customers", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  if (user.role !== "supplier") { res.status(403).json({ error: "Forbidden" }); return; }

  const parsed = LinkCustomerBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [homeowner] = await db.select().from(usersTable).where(eq(usersTable.email, parsed.data.homeownerEmail));
  if (!homeowner || homeowner.role !== "homeowner") {
    res.status(404).json({ error: "Homeowner not found" });
    return;
  }

  const [existing] = await db.select().from(supplierCustomersTable).where(
    and(eq(supplierCustomersTable.supplierId, user.id), eq(supplierCustomersTable.homeownerId, homeowner.id))
  );
  if (existing) { res.status(400).json({ error: "Already linked" }); return; }

  const [link] = await db.insert(supplierCustomersTable).values({
    supplierId: user.id,
    homeownerId: homeowner.id,
  }).returning();

  res.status(201).json({
    id: link.id,
    supplierId: link.supplierId,
    homeownerId: link.homeownerId,
    homeownerName: homeowner.name,
    homeownerEmail: homeowner.email,
    gasLevelPercent: null,
    deviceCount: 0,
    linkedAt: link.linkedAt,
  });
});

router.delete("/supplier/customers/:id", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  if (user.role !== "supplier") { res.status(403).json({ error: "Forbidden" }); return; }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  await db.delete(supplierCustomersTable).where(and(eq(supplierCustomersTable.id, id), eq(supplierCustomersTable.supplierId, user.id)));
  res.status(204).send();
});

// ── Inventory ─────────────────────────────────────────────────────────

router.get("/supplier/inventory", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  if (user.role !== "supplier") { res.status(403).json({ error: "Forbidden" }); return; }
  const items = await db.select().from(inventoryTable).where(eq(inventoryTable.supplierId, user.id));
  res.json(items);
});

router.post("/supplier/inventory", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  if (user.role !== "supplier") { res.status(403).json({ error: "Forbidden" }); return; }
  const parsed = CreateInventoryItemBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [item] = await db.insert(inventoryTable).values({
    supplierId: user.id,
    cylinderType: parsed.data.cylinderType,
    quantityAvailable: parsed.data.quantityAvailable,
    pricePerUnit: parsed.data.pricePerUnit ?? 0,
  }).returning();
  res.status(201).json(item);
});

router.patch("/supplier/inventory/:id", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  if (user.role !== "supplier") { res.status(403).json({ error: "Forbidden" }); return; }
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const parsed = UpdateInventoryItemBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.quantityAvailable !== undefined) updates.quantityAvailable = parsed.data.quantityAvailable;
  if (parsed.data.pricePerUnit !== undefined) updates.pricePerUnit = parsed.data.pricePerUnit;
  const [item] = await db.update(inventoryTable).set(updates).where(and(eq(inventoryTable.id, id), eq(inventoryTable.supplierId, user.id))).returning();
  if (!item) { res.status(404).json({ error: "Not found" }); return; }
  res.json(item);
});

// ── Dispatches ────────────────────────────────────────────────────────

router.get("/supplier/dispatches", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  if (user.role !== "supplier") { res.status(403).json({ error: "Forbidden" }); return; }
  const dispatches = await db.select().from(dispatchesTable).where(eq(dispatchesTable.supplierId, user.id)).orderBy(desc(dispatchesTable.createdAt));

  const result = await Promise.all(dispatches.map(async (d) => {
    const [order] = await db.select().from(refillOrdersTable).where(eq(refillOrdersTable.id, d.orderId));
    const [homeowner] = order ? await db.select().from(usersTable).where(eq(usersTable.id, order.homeownerId)) : [null];
    return {
      ...d,
      customerName: homeowner?.name ?? null,
      address: homeowner?.email ?? null, // address not in schema, use email as identifier
    };
  }));

  res.json(result);
});

router.post("/supplier/dispatches", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  if (user.role !== "supplier") { res.status(403).json({ error: "Forbidden" }); return; }
  const parsed = CreateDispatchBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [dispatch] = await db.insert(dispatchesTable).values({
    supplierId: user.id,
    orderId: parsed.data.orderId,
    driverName: parsed.data.driverName ?? null,
    truckNumber: parsed.data.truckNumber ?? null,
    notes: parsed.data.notes ?? null,
    status: "pending",
  }).returning();

  // Update the order status to dispatched
  await db.update(refillOrdersTable).set({ status: "dispatched", supplierId: user.id }).where(eq(refillOrdersTable.id, parsed.data.orderId));

  res.status(201).json({ ...dispatch, customerName: null, address: null });
});

router.patch("/supplier/dispatches/:id", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  if (user.role !== "supplier") { res.status(403).json({ error: "Forbidden" }); return; }
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const parsed = UpdateDispatchBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const updates: Record<string, unknown> = {};
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;
  if (parsed.data.driverName !== undefined) updates.driverName = parsed.data.driverName;
  if (parsed.data.truckNumber !== undefined) updates.truckNumber = parsed.data.truckNumber;
  if (parsed.data.notes !== undefined) updates.notes = parsed.data.notes;
  const [dispatch] = await db.update(dispatchesTable).set(updates).where(and(eq(dispatchesTable.id, id), eq(dispatchesTable.supplierId, user.id))).returning();
  if (!dispatch) { res.status(404).json({ error: "Not found" }); return; }

  // Sync order status
  if (parsed.data.status === "en_route") {
    await db.update(refillOrdersTable).set({ status: "en_route" }).where(eq(refillOrdersTable.id, dispatch.orderId));
  } else if (parsed.data.status === "delivered") {
    await db.update(refillOrdersTable).set({ status: "delivered" }).where(eq(refillOrdersTable.id, dispatch.orderId));
  }

  res.json({ ...dispatch, customerName: null, address: null });
});

// ── Summary ───────────────────────────────────────────────────────────

router.get("/supplier/summary", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  if (user.role !== "supplier") { res.status(403).json({ error: "Forbidden" }); return; }

  const links = await db.select().from(supplierCustomersTable).where(eq(supplierCustomersTable.supplierId, user.id));
  const totalCustomers = links.length;

  const activeDispatches = await db.select().from(dispatchesTable).where(
    and(eq(dispatchesTable.supplierId, user.id), eq(dispatchesTable.status, "en_route"))
  );

  const pendingOrders = await db.select().from(refillOrdersTable).where(
    and(eq(refillOrdersTable.supplierId, user.id), eq(refillOrdersTable.status, "pending"))
  );

  // Monthly revenue: sum of delivered orders this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);
  const deliveredOrders = await db.select().from(refillOrdersTable).where(
    and(eq(refillOrdersTable.supplierId, user.id), eq(refillOrdersTable.status, "delivered"), gte(refillOrdersTable.createdAt, startOfMonth))
  );
  const monthlyRevenue = deliveredOrders.reduce((sum, o) => sum + o.totalPrice, 0);

  const recentOrders = await db.select().from(refillOrdersTable)
    .where(eq(refillOrdersTable.supplierId, user.id))
    .orderBy(desc(refillOrdersTable.createdAt))
    .limit(5);

  res.json({
    activeDispatches: activeDispatches.length,
    pendingOrders: pendingOrders.length,
    totalCustomers,
    monthlyRevenue,
    recentOrders,
  });
});

// ── Revenue Analytics ─────────────────────────────────────────────────

router.get("/supplier/analytics/revenue", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  if (user.role !== "supplier") { res.status(403).json({ error: "Forbidden" }); return; }

  const orders = await db.select().from(refillOrdersTable).where(
    and(eq(refillOrdersTable.supplierId, user.id), eq(refillOrdersTable.status, "delivered"))
  );

  // Group by month (last 6 months)
  const months: Record<string, { revenue: number; orders: number }> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
    months[key] = { revenue: 0, orders: 0 };
  }
  for (const order of orders) {
    const d = new Date(order.createdAt);
    const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
    if (months[key]) {
      months[key].revenue += order.totalPrice;
      months[key].orders += 1;
    }
  }

  res.json(Object.entries(months).map(([label, v]) => ({ label, ...v })));
});

export default router;
