import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, emergencyContactsTable } from "@workspace/db";
import { CreateEmergencyContactBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router = Router();

router.get("/homeowner/emergency-contacts", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  if (user.role !== "homeowner") { res.status(403).json({ error: "Forbidden" }); return; }

  const contacts = await db.select().from(emergencyContactsTable).where(eq(emergencyContactsTable.homeownerId, user.id));
  res.json(contacts);
});

router.post("/homeowner/emergency-contacts", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  if (user.role !== "homeowner") { res.status(403).json({ error: "Forbidden" }); return; }

  const parsed = CreateEmergencyContactBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [contact] = await db.insert(emergencyContactsTable).values({
    homeownerId: user.id,
    name: parsed.data.name,
    email: parsed.data.email,
  }).returning();

  res.status(201).json(contact);
});

router.delete("/homeowner/emergency-contacts/:id", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  if (user.role !== "homeowner") { res.status(403).json({ error: "Forbidden" }); return; }

  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);

  await db.delete(emergencyContactsTable).where(
    and(eq(emergencyContactsTable.id, id), eq(emergencyContactsTable.homeownerId, user.id))
  );
  res.status(204).send();
});

export default router;
