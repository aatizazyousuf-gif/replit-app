# Deploying the backend (no Replit needed) + building the APK

This repo now has two GitHub Actions workflows:

- `.github/workflows/deploy-backend.yml` — builds `artifacts/api-server` into a
  Docker image and deploys it to **Google Cloud Run**.
- `.github/workflows/build-apk.yml` — builds `artifacts/gas-monitor` (the web
  app) and packages it into an Android `.apk` via Capacitor.

Do the steps below once. After that, every push to `main` redeploys the
backend and rebuilds the APK automatically.

---

## 1. Create a free Postgres database (Neon)

1. Go to https://neon.tech and sign up (free tier is enough for this app).
2. Create a new project. Neon gives you a connection string that looks like:
   ```
   postgresql://user:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Copy that whole string — you'll need it twice below.

## 2. Load the database schema (one-time)

From any machine with Node + pnpm (your Replit shell works fine for this one
command, or your own computer):

```bash
cd Smart-Gas-Monitor
pnpm install
DATABASE_URL="paste-your-neon-connection-string" pnpm --filter @workspace/db run push
```

This creates all the tables (`users`, `devices`, `alerts`, etc.) in your new
database. You only need to do this once, and again later if the schema
changes.

## 3. Create a Google Cloud project + service account

1. Go to https://console.cloud.google.com and create a new project (or reuse
   one). Note the **Project ID** (not the display name).
2. Enable these two APIs for the project:
   - Cloud Run API
   - Artifact Registry API
3. Create a service account (IAM & Admin > Service Accounts) with these roles:
   - `Cloud Run Admin`
   - `Artifact Registry Writer`
   - `Service Account User`
4. Create a JSON key for that service account and download it.

## 4. Add secrets to your GitHub repo

In your GitHub repo: **Settings > Secrets and variables > Actions**

Add these **secrets**:
| Name | Value |
|---|---|
| `GCP_PROJECT_ID` | your GCP project ID |
| `GCP_SA_KEY` | paste the entire contents of the JSON key file |
| `DATABASE_URL` | your Neon connection string from step 1 |

(Optional) Add these **variables** if you want non-default names/regions:
| Name | Default if unset |
|---|---|
| `GCP_REGION` | `us-central1` |
| `CLOUD_RUN_SERVICE` | `gas-monitor-api` |
| `AR_REPO` | `gas-monitor` |

## 5. Deploy

Push to `main`, or go to the **Actions** tab and manually run
"Deploy Backend to Cloud Run". When it finishes, the last step
("Show deployed URL") prints your live backend URL, e.g.:

```
https://gas-monitor-api-abcd1234-uc.a.run.app
```

Copy that URL.

## 6. Point the APK at your backend

Add one more repo **variable**:
| Name | Value |
|---|---|
| `API_BASE_URL` | the Cloud Run URL from step 5 |

Then re-run (or push to trigger) the "Build Android APK" workflow. The app
will now be able to reach your backend for login, dashboard data, chat, etc.
Download the `.apk` from that workflow run's artifacts.

---

### Notes / gotchas

- Cloud Run scales to zero when idle — the first request after inactivity can
  take a few seconds while it cold-starts. That's normal and free-tier
  expected behavior.
- If you change the DB schema later, re-run the `pnpm --filter @workspace/db
  run push` command from step 2 against the same `DATABASE_URL`.
- The backend accepts requests from any origin (`cors({ origin: true,
  credentials: true })`), so both the web app and the APK can call it as-is.
