import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { db, usersTable, devicesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export function generateDeviceApiKey(): string {
  return crypto.randomBytes(24).toString("hex");
}

export function hashPassword(password: string): string {
  const salt = "gas-monitor-salt-v1";
  return crypto.createHmac("sha256", salt).update(password).digest("hex");
}

export function setSession(res: Response, userId: number): void {
  const payload = Buffer.from(JSON.stringify({ userId, ts: Date.now() })).toString("base64");
  res.cookie("session", payload, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export function clearSession(res: Response): void {
  res.clearCookie("session");
}

export function getSessionUserId(req: Request): number | null {
  // 1. Cookie-based session (web)
  const raw = req.cookies?.session;
  if (raw) {
    try {
      const { userId } = JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
      if (typeof userId === "number") return userId;
    } catch { /* fall through */ }
  }
  // 2. Bearer token (mobile)
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    try {
      const token = auth.slice(7);
      const { userId } = JSON.parse(Buffer.from(token, "base64").toString("utf8"));
      if (typeof userId === "number") return userId;
    } catch { /* fall through */ }
  }
  return null;
}

export function makeToken(userId: number): string {
  return Buffer.from(JSON.stringify({ userId, ts: Date.now() })).toString("base64");
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const userId = getSessionUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  (req as any).user = user;
  next();
}

// Used by hardware (ESP32) to authenticate instead of a browser session cookie.
// The device sends its API key in the "X-Device-Key" header.
export async function requireDeviceAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const apiKey = req.headers["x-device-key"];
  if (!apiKey || typeof apiKey !== "string") {
    res.status(401).json({ error: "Missing X-Device-Key header" });
    return;
  }
  const raw = Array.isArray(req.params.deviceId) ? req.params.deviceId[0] : req.params.deviceId;
  const deviceId = parseInt(raw, 10);
  const [device] = await db.select().from(devicesTable).where(eq(devicesTable.id, deviceId));
  if (!device || !device.apiKey || device.apiKey !== apiKey) {
    res.status(401).json({ error: "Invalid device credentials" });
    return;
  }
  (req as any).device = device;
  next();
}

export async function requireRole(role: "homeowner" | "supplier") {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as any).user;
    if (!user || user.role !== role) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}
