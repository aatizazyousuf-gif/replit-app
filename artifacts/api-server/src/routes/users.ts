import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { RegisterPushTokenBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router = Router();

// Called by the client after it obtains an FCM registration token, so the
// backend knows where to deliver push notifications for this account.
router.post("/users/push-token", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const parsed = RegisterPushTokenBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  await db.update(usersTable).set({ pushToken: parsed.data.token }).where(eq(usersTable.id, user.id));
  res.status(204).send();
});

export default router;
