import { db, usersTable, emergencyContactsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

// Sends email via Brevo's HTTP API (https://api.brevo.com) instead of raw
// SMTP. Some networks block outbound SMTP ports (465/587) entirely, which a
// plain nodemailer/SMTP setup can't work around - going over normal HTTPS
// (the same kind of connection every other API call in this app already
// uses) sidesteps that problem.
//
// Setup (free, no card required):
//   1. Sign up at https://www.brevo.com
//   2. Settings > SMTP & API > API Keys > Generate a new API key
//   3. Set these two environment variables on the backend:
//        BREVO_API_KEY   - the API key from step 2
//        EMAIL_FROM      - the email address alerts should be sent from
//                          (Brevo lets you send from your own address once
//                          you verify it under Senders, Domains & Dedicated IPs)
async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    console.warn("BREVO_API_KEY / EMAIL_FROM not set - email alerts are disabled.");
    return;
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        sender: { email: from, name: "Smart Gas Monitor" },
        to: [{ email: to }],
        subject,
        textContent: text,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`Failed to send email to ${to}: Brevo returned ${res.status} - ${body}`);
    }
  } catch (err) {
    // A bad address or transient network failure shouldn't crash the
    // request that triggered it (e.g. storing a sensor reading) - log and
    // move on.
    console.error(`Failed to send email to ${to}:`, err);
  }
}

// Emails the homeowner's own account address plus every emergency contact
// they've added, since a leak matters to everyone in the household, not just
// whoever happens to have the app open.
export async function sendLeakEmailAlert(homeownerId: number, subject: string, message: string): Promise<void> {
  const [homeowner] = await db.select().from(usersTable).where(eq(usersTable.id, homeownerId));
  if (!homeowner) return;

  const contacts = await db.select().from(emergencyContactsTable).where(eq(emergencyContactsTable.homeownerId, homeownerId));

  const recipients = [homeowner.email, ...contacts.map((c) => c.email)];
  await Promise.all(recipients.map((to) => sendEmail(to, subject, message)));
}
