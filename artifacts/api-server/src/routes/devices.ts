import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, devicesTable } from "@workspace/db";
import { CreateDeviceBody, UpdateDeviceBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router = Router();

router.get("/devices", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const devices = await db.select().from(devicesTable).where(eq(devicesTable.userId, user.id));
  res.json(devices);
});

router.post("/devices", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const parsed = CreateDeviceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [device] = await db.insert(devicesTable).values({
    userId: user.id,
    deviceSerial: parsed.data.deviceSerial,
    name: parsed.data.name,
    wifiNetwork: parsed.data.wifiNetwork ?? null,
    status: "calibrating",
  }).returning();
  res.status(201).json(device);
});

router.get("/devices/:id", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [device] = await db.select().from(devicesTable).where(and(eq(devicesTable.id, id), eq(devicesTable.userId, user.id)));
  if (!device) { res.status(404).json({ error: "Not found" }); return; }
  res.json(device);
});

router.patch("/devices/:id", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const parsed = UpdateDeviceBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.status !== undefined) updates.status = parsed.data.status;
  if (parsed.data.wifiNetwork !== undefined) updates.wifiNetwork = parsed.data.wifiNetwork;
  const [device] = await db.update(devicesTable).set(updates).where(and(eq(devicesTable.id, id), eq(devicesTable.userId, user.id))).returning();
  if (!device) { res.status(404).json({ error: "Not found" }); return; }
  res.json(device);
});

router.delete("/devices/:id", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  await db.delete(devicesTable).where(and(eq(devicesTable.id, id), eq(devicesTable.userId, user.id)));
  res.status(204).send();
});

export default router;
