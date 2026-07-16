import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { hashPassword, setSession, clearSession, getSessionUserId, requireAuth, makeToken } from "../lib/auth";

const router = Router();

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, email, password, role } = parsed.data;
  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) {
    res.status(400).json({ error: "Email already registered" });
    return;
  }
  const passwordHash = hashPassword(password);
  const [user] = await db.insert(usersTable).values({ name, email, passwordHash, role }).returning();
  setSession(res, user.id);
  res.status(201).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt }, token: makeToken(user.id) });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  setSession(res, user.id);
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt }, token: makeToken(user.id) });
});

router.post("/auth/logout", (req, res): void => {
  clearSession(res);
  res.json({ ok: true });
});

router.get("/auth/me", requireAuth, (req, res): void => {
  const user = (req as any).user;
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt });
});

export default router;
