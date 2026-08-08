# Deploying the backend (no Replit needed) + building the APK

This repo has one GitHub Actions workflow:

- `.github/workflows/build-apk.yml` — builds `artifacts/gas-monitor` (the web
  app) and packages it into an Android `.apk` via Capacitor.

The backend (`artifacts/api-server`) is deployed separately via **Vercel**,
which deploys automatically from GitHub on every push — no workflow file
needed for that part.

> **Note:** Render was tried first and documented here originally, but it
> now asks for a card even on its free tier, so this guide uses Vercel
> instead — genuinely free forever for a personal/non-commercial project
> like this one, no card required. It also doesn't sleep after inactivity
> the way Render's free tier does, which matters for a leak-alert system.

---

## 1. Create a free Postgres database (Neon)

Already done if you followed along — your Neon connection string is what you
used for the `pnpm --filter @workspace/db run push` command.

The backend talks to Neon over its HTTP driver (`@neondatabase/serverless`),
not a raw TCP connection — this is what makes it work well as a serverless
function (see the comment in `lib/db/src/index.ts` for why). You don't need
to do anything differently here; the same `DATABASE_URL` connection string
works with both.

## 2. Deploy the backend on Vercel

1. Go to https://vercel.com and sign up (GitHub login, no card required).
2. Click **Add New... → Project**, import your GitHub repo.
3. On the configure screen:
   - **Root Directory**: `artifacts/api-server` (click "Edit" next to Root
     Directory and select this folder — Vercel will still detect the pnpm
     workspace and install the whole monorepo correctly)
   - **Framework Preset**: Other
   - Leave build/output settings at their defaults — `vercel.json` and
     `api/index.ts` in this folder tell Vercel everything else it needs.
4. Under **Environment Variables**, add:
   | Name | Value |
   |---|---|
   | `DATABASE_URL` | your Neon connection string |
   | `BREVO_API_KEY` | from Brevo, if you want email alerts |
   | `EMAIL_FROM` | the sender address you verified in Brevo |
   | `FIREBASE_SERVICE_ACCOUNT_JSON` | the full Firebase service account JSON, pasted as one line — use this one (not `FIREBASE_SERVICE_ACCOUNT_PATH`) on Vercel, since there's no persistent filesystem to point a file path at |
5. Click **Deploy**.
6. Copy the resulting URL, e.g. `https://gas-monitor-api.vercel.app`.

Every future push to `main` that touches `artifacts/api-server` redeploys it
automatically, same as before.

### If you ever move back to a traditional always-on host (Render, a VPS, etc.)

`src/index.ts` (the `app.listen(PORT)` entry point) is still there and still
works unchanged — that's what a normal host runs. `api/index.ts` and
`vercel.json` are Vercel-specific and are simply unused elsewhere.

## 3. Point the APK at your backend

In your GitHub repo: **Settings > Secrets and variables > Actions > Variables**,
add:
| Name | Value |
|---|---|
| `API_BASE_URL` | your Vercel URL from step 2 |

Then re-run the "Build Android APK" workflow (Actions tab > select it >
Run workflow). Download the `.apk` from that run's artifacts.

---

### Notes / gotchas

- If you change the DB schema later, re-run the `pnpm --filter @workspace/db
  run push` command against the same `DATABASE_URL`.
- The backend accepts requests from any origin (`cors({ origin: true,
  credentials: true })`), so both the web app and the APK can call it as-is.
- Vercel's Hobby (free) plan is scoped to personal/non-commercial projects —
  fine for an FYP, but re-check Vercel's terms before using this setup for
  anything that starts making money.
