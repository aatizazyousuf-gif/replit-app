import { Router } from "express";
import { eq, and, isNull, isNotNull } from "drizzle-orm";
import { db, alertsTable } from "@workspace/db";
import { requireAuth } from "../lib/auth";

const router = Router();

router.get("/alerts", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const resolvedParam = req.query.resolved;

  let query = db.select().from(alertsTable).where(eq(alertsTable.userId, user.id));

  if (resolvedParam === "true") {
    const alerts = await db.select().from(alertsTable).where(
      and(eq(alertsTable.userId, user.id), isNotNull(alertsTable.resolvedAt))
    );
    res.json(alerts);
    return;
  } else if (resolvedParam === "false") {
    const alerts = await db.select().from(alertsTable).where(
      and(eq(alertsTable.userId, user.id), isNull(alertsTable.resolvedAt))
    );
    res.json(alerts);
    return;
  }

  const alerts = await query;
  res.json(alerts);
});

router.patch("/alerts/:id/resolve", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const id = parseInt(raw, 10);
  const [alert] = await db.update(alertsTable)
    .set({ resolvedAt: new Date() })
    .where(and(eq(alertsTable.id, id), eq(alertsTable.userId, user.id)))
    .returning();
  if (!alert) { res.status(404).json({ error: "Not found" }); return; }
  res.json(alert);
});

export default router;
