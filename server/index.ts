// server/index.ts

import http from "http";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// ─── 1) CORS ─────────────────────────────────────────────────────────────────
const clientOrigin = process.env.CLIENT_URL || "https://dejayillegal.github.io";

const corsOptions = {
  origin: clientOrigin,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true as const,
};

// 1a) Preflight: respond to OPTIONS on any /api/* route
app.options("/api/*", cors(corsOptions));

// 1b) Simple & actual CORS requests on /api
app.use("/api", cors(corsOptions));

// ─── 2) Body parsers ─────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── 3) Logging middleware ───────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  let capturedJson: any;
  const originalJson = res.json;
  res.json = (body: any, ...args: any[]) => {
    capturedJson = body;
    return originalJson.call(res, body, ...args);
  };

  res.on("finish", () => {
    if (req.path.startsWith("/api")) {
      let line = `${req.method} ${req.path} ${res.statusCode} in ${Date.now() - start}ms`;
      if (capturedJson) {
        line += ` :: ${JSON.stringify(capturedJson)}`;
      }
      log(line.length > 120 ? line.slice(0, 119) + "…" : line);
    }
  });

  next();
});

(async () => {
   // ─── 4) Health check endpoint for Render ────────────────────────────────────
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ─── 5) Mount all of your API + WS routes under /api ────────────────────────

  const server: http.Server = await registerRoutes(app);

  // ─── 6) Error handler (after routes!) ─────────────────────────────────────
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ message: err.message || "Internal Server Error" });
    // No re-throw here, so your process stays alive on errors
  });

  // ─── 7) Vite dev or static serve ────────────────────────────────────────────
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ─── 8) Finally, listen ────────────────────────────────────────────────────
  const port = Number(process.env.PORT) || 5050;
  const host = "0.0.0.0";

  server.listen(port, host, () => {
    log(`✅ Server is running at http://${host}:${port}`);
  });
})();
