import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import fs from "fs";

// Two ways to provide the Firebase service account credential - use
// whichever is easier for you:
//
//   FIREBASE_SERVICE_ACCOUNT_PATH  (recommended) - the full file path to the
//     service account JSON key you downloaded from Firebase Console. This
//     avoids ever having to paste the JSON into a terminal command, which is
//     easy to get subtly corrupted with very long values.
//
//   FIREBASE_SERVICE_ACCOUNT_JSON  - the entire JSON contents pasted
//     directly as a single-line environment variable value. Only use this
//     if FIREBASE_SERVICE_ACCOUNT_PATH isn't practical for some reason.
function ensureInitialized(): boolean {
  if (getApps().length > 0) return true;

  const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (!path && !raw) {
    console.warn("Neither FIREBASE_SERVICE_ACCOUNT_PATH nor FIREBASE_SERVICE_ACCOUNT_JSON is set - push notifications are disabled.");
    return false;
  }

  try {
    const serviceAccount = path
      ? JSON.parse(fs.readFileSync(path, "utf8"))
      : JSON.parse(raw!);
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
