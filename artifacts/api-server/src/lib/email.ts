import nodemailer, { type Transporter } from "nodemailer";
import { db, usersTable, emergencyContactsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

// Sends email via Gmail SMTP using an App Password (not your normal Gmail
// password - generate one at https://myaccount.google.com/apppasswords).
// Set these two environment variables on the backend:
//   EMAIL_USER            - the Gmail address sending the alerts
//   EMAIL_APP_PASSWORD    - the 16-character app password
let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (transporter) return transporter;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.warn("EMAIL_USER / EMAIL_APP_PASSWORD not set - email alerts are disabled.");
    return null;
  }
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
  return transporter;
}

async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  const t = getTransporter();
  if (!t) return;
  try {
    await t.sendMail({
      from: `"Smart Gas Monitor" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
  } catch (err) {
    // A bad address or transient SMTP failure shouldn't crash the request
    // that triggered it (e.g. storing a sensor reading) - log and move on.
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
