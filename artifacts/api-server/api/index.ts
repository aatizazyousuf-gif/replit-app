// Vercel serverless entry point.
//
// This does NOT run app.listen() - Vercel calls this file's default export
// directly as the request handler for every request that matches the
// rewrite rule in vercel.json (see that file: every path is rewritten to
// this single function, so Express's own router below still sees the full
// original URL and handles /api/* routing exactly like it does when run as
// a normal long-lived server via src/index.ts).
//
// src/index.ts (app.listen on a PORT) is still what Render/a VPS/your own
// laptop use - this file is Vercel-specific and unused anywhere else.
import app from "../src/app";

export default app;
