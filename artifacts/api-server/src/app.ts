import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as pinoHttpModule from "pino-http";
import type { Options as PinoHttpOptions, HttpLogger } from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

// pino-http is a CommonJS package with no "exports" map. Different build
// tools resolve its default export differently - esbuild (used for the
// Render/laptop build) and Vercel's build pipeline disagreed on which part
// of the module the actual function is, which broke both a default import
// and a named import in different ways. Rather than guess again, this
// checks every shape the export could realistically take and uses
// whichever one is actually callable, so it works the same regardless of
// which tool bundled it.
const pinoHttpCandidates = [
  (pinoHttpModule as unknown as { pinoHttp?: unknown }).pinoHttp,
  (pinoHttpModule as unknown as { default?: unknown }).default,
  pinoHttpModule,
];
const pinoHttp = pinoHttpCandidates.find((candidate) => typeof candidate === "function") as
  | ((opts: PinoHttpOptions) => HttpLogger)
  | undefined;

if (!pinoHttp) {
  throw new Error("Could not resolve pino-http's function export - check the pino-http version/shape.");
}

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
