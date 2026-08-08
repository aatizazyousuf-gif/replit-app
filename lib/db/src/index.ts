import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Uses Neon's HTTP driver instead of a raw TCP (node-postgres) connection.
// Two reasons:
//   1. Serverless platforms (Vercel, etc.) run each request as a short-lived
//      function invocation - a persistent TCP connection pool doesn't
//      survive between invocations and can exhaust Neon's connection limit
//      under load. Every query here is instead a single HTTPS request,
//      which has no connection to hold open between requests.
//   2. Same reason email alerts go through Brevo's HTTPS API instead of
//      raw SMTP (see lib/email.ts in api-server): plain HTTPS on port 443
//      gets through network restrictions that block arbitrary raw socket
//      connections, which matters if this ever runs somewhere with an
//      outbound firewall.
const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });

export * from "./schema";
