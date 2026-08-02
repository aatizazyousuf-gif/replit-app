import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

// FIREBASE_SERVICE_ACCOUNT_JSON should contain the *entire contents* of the
// service account JSON key downloaded from Firebase Console
// (Project Settings > Service Accounts > Generate new private key),
// as a single-line environment variable value.
function ensureInitialized(): boolean {
  if (getApps().length > 0) return true;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    console.warn("FIREBASE_SERVICE_ACCOUNT_JSON not set - push notifications are disabled.");
    return false;
  }
  try {
    const serviceAccount = JSON.parse(raw);
    initializeApp({ credential: cert(serviceAccount) });
    return true;
  } catch (err) {
    console.error("Failed to initialize Firebase Admin SDK:", err);
    return false;
  }
}

export async function sendPushToUser(
  userId: number,
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<void> {
  if (!ensureInitialized()) return;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user?.pushToken) return;

  try {
    await getMessaging().send({
      token: user.pushToken,
      notification: { title, body },
      data,
      android: { priority: "high" },
    });
  } catch (err) {
    // A bad/expired token shouldn't crash the request that triggered the
    // notification (e.g. a sensor reading being stored) - log and move on.
    console.error(`Failed to send push notification to user ${userId}:`, err);
  }
}
