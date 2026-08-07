# Smart Gas Monitor

An IoT LPG/gas cylinder monitoring system: an ESP32 device with an MQ-2 gas sensor (and optionally an MPXV7004DP pressure sensor) reports readings to a backend, which alerts homeowners of leaks and low tank levels and connects them to suppliers for refill orders.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `firmware/esp32-gas-monitor/` — Arduino firmware for the ESP32 device
- `artifacts/api-server/` — Express backend (routes in `src/routes/`)
- `artifacts/gas-monitor/` — React + Vite + Capacitor mobile/web app
- `lib/db/src/schema/` — Drizzle schema, source of truth for the DB shape
- `lib/api-spec/openapi.yaml` — source of truth for the API contract; run
  `pnpm --filter @workspace/api-spec run codegen` after editing it to
  regenerate `lib/api-zod` and `lib/api-client-react`
- `lib/auth.ts` — password hashing / session helpers used by the API server

## Architecture decisions

- **Leak detection and tank level are two separate signals from two
  separate sensors, and the schema/API keep them separate:**
  - `leakLevelPercent` — MQ-2 gas sensor, 0-100% relative to its clean-air
    baseline (not calibrated ppm). Tells you whether gas is present in the
    air right now. Always present on every reading.
  - `gasLevelPercent` — MPXV7004DP pressure sensor. The tank's actual fill
    %. **Nullable** - only populated when a device's `hasPressureSensor`
    flag is true and the firmware actually sends it. Never defaulted to
    `0`; the UI shows an explicit "sensor not connected" state instead of
    a guessed number.
  - This split exists because an earlier version conflated the two under
    one `gasLevelPercent` field fed only by the MQ-2, so the "Gas Level"
    gauge and the "tank running low" alert were both silently driven by
    ambient air readings instead of real tank capacity. The firmware also
    sent a hardcoded `pressurePa: 0` even with no pressure sensor
    attached, which the docs/presentation described as if it were live
    data.
  - Once the MPXV7004DP is physically wired up: set
    `PRESSURE_SENSOR_CONNECTED = true` in the firmware, fill in the TODO
    pin/calibration constants there, and set `hasPressureSensor: true` on
    the device (Setup Wizard toggle, or `PATCH /devices/:id`).
- Sessions and password hashing (`lib/auth.ts`) are intentionally minimal
  placeholders, not production-grade - see Gotchas below before a public
  deploy or a security-focused review.

## Product

- **Homeowners**: monitor a gas sensor in real time, get push/email alerts
  on a leak or (once the pressure sensor is connected) a low tank, order
  refills from a linked supplier, add emergency contacts, and message
  their supplier.
- **Suppliers**: see linked customers and their tank levels (when
  available), manage inventory, dispatch drivers, and track revenue.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Sessions/tokens (`lib/auth.ts`) are unsigned base64 JSON, and passwords
  are hashed with a single hardcoded global salt - both need hardening
  (signed sessions, per-user salted hashing) before this goes anywhere
  someone else's data would be at risk.
- After editing `lib/api-spec/openapi.yaml`, always run
  `pnpm --filter @workspace/api-spec run codegen` before touching
  frontend or backend code that uses the changed types - the generated
  files in `lib/api-zod` / `lib/api-client-react` are not hand-edited.
- `gasLevelPercent` on a `SensorReading` can be `null` - always check
  `device.hasPressureSensor` (or the null itself) before displaying it as
  a real tank level.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
