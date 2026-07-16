# Deploying the backend (no Replit needed) + building the APK

This repo has one GitHub Actions workflow:

- `.github/workflows/build-apk.yml` — builds `artifacts/gas-monitor` (the web
  app) and packages it into an Android `.apk` via Capacitor.

The backend (`artifacts/api-server`) is deployed separately via **Render**,
which deploys automatically from GitHub on every push — no workflow file
needed for that part.

---

## 1. Create a free Postgres database (Neon)

Already done if you followed along — your Neon connection string is what you
used for the `pnpm --filter @workspace/db run push` command.

## 2. Deploy the backend on Render

1. Go to https://render.com and sign up (GitHub login, no card required).
2. Click **New +** → **Web Service**, connect your GitHub repo.
3. On the setup form:
   - **Language/Environment**: `Docker`
   - **Root Directory**: leave blank
   - **Dockerfile Path**: `artifacts/api-server/Dockerfile`
   - **Docker Build Context Directory**: `.`
   - **Instance Type**: `Free`
4. Under **Environment Variables**, add `DATABASE_URL` = your Neon connection
   string.
5. Click **Create Web Service**. Render builds and deploys automatically.
6. Copy the resulting URL, e.g. `https://gas-monitor-api.onrender.com`.

Note: the free tier sleeps after 15 minutes of inactivity; the first request
after a quiet period takes 30-60 seconds to wake back up. Every future push
to `main` that touches `artifacts/api-server` redeploys it automatically.

## 3. Point the APK at your backend

In your GitHub repo: **Settings > Secrets and variables > Actions > Variables**,
add:
| Name | Value |
|---|---|
| `API_BASE_URL` | your Render URL from step 2 |

Then re-run the "Build Android APK" workflow (Actions tab > select it >
Run workflow). Download the `.apk` from that run's artifacts.

---

### Notes / gotchas

- If you change the DB schema later, re-run the `pnpm --filter @workspace/db
  run push` command against the same `DATABASE_URL`.
- The backend accepts requests from any origin (`cors({ origin: true,
  credentials: true })`), so both the web app and the APK can call it as-is.
