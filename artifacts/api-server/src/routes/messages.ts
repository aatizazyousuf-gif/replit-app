import { Router } from "express";
import { eq, or, and, desc, sql } from "drizzle-orm";
import { db, messagesTable, usersTable } from "@workspace/db";
import { SendMessageBody } from "@workspace/api-zod";
import { requireAuth } from "../lib/auth";

const router = Router();

router.get("/messages", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const withUserId = parseInt(String(req.query.withUserId), 10);
  if (isNaN(withUserId)) { res.status(400).json({ error: "withUserId required" }); return; }

  const msgs = await db.select({
    id: messagesTable.id,
    senderId: messagesTable.senderId,
    receiverId: messagesTable.receiverId,
    content: messagesTable.content,
    sentAt: messagesTable.sentAt,
    senderName: usersTable.name,
  })
    .from(messagesTable)
    .innerJoin(usersTable, eq(messagesTable.senderId, usersTable.id))
    .where(
      or(
        and(eq(messagesTable.senderId, user.id), eq(messagesTable.receiverId, withUserId)),
        and(eq(messagesTable.senderId, withUserId), eq(messagesTable.receiverId, user.id))
      )
    )
    .orderBy(messagesTable.sentAt);

  res.json(msgs);
});

router.post("/messages", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;
  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [msg] = await db.insert(messagesTable).values({
    senderId: user.id,
    receiverId: parsed.data.receiverId,
    content: parsed.data.content,
  }).returning();

  res.status(201).json({ ...msg, senderName: user.name });
});

router.get("/messages/conversations", requireAuth, async (req, res): Promise<void> => {
  const user = (req as any).user;

  // Get all unique conversation partners
  const rows = await db.select({
    partnerId: sql<number>`CASE WHEN ${messagesTable.senderId} = ${user.id} THEN ${messagesTable.receiverId} ELSE ${messagesTable.senderId} END`,
    content: messagesTable.content,
    sentAt: messagesTable.sentAt,
  })
    .from(messagesTable)
    .where(or(eq(messagesTable.senderId, user.id), eq(messagesTable.receiverId, user.id)))
    .orderBy(desc(messagesTable.sentAt));

  // Deduplicate by partner
  const seen = new Set<number>();
  const conversations: Array<{ partnerId: number; lastMessage: string; lastMessageAt: Date }> = [];
  for (const row of rows) {
    if (!seen.has(row.partnerId)) {
      seen.add(row.partnerId);
      conversations.push({ partnerId: row.partnerId, lastMessage: row.content, lastMessageAt: row.sentAt });
    }
  }

  // Fetch partner user info
  const result = await Promise.all(conversations.map(async (c) => {
    const [partner] = await db.select().from(usersTable).where(eq(usersTable.id, c.partnerId));
    return {
      userId: c.partnerId,
      userName: partner?.name ?? "Unknown",
      userRole: partner?.role ?? "homeowner",
      lastMessage: c.lastMessage,
      lastMessageAt: c.lastMessageAt,
      unreadCount: 0,
    };
  }));

  res.json(result);
});

export default router;
