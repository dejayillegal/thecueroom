// server/index.ts

import http from "http";
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";             // ← new
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// ─── 1) CORS ───────────────────────────────────────────────────────────────────
// allow your GH-Pages origin (or use cors() to allow * for testing)
app.use(cors({
  origin: "https://dejayillegal.github.io",
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  credentials: true,             // if you need cookies or auth headers
}));

// ─── 2) Body parsers ─────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── 3) Logging middleware ───────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

// ─── 4) Register your API routes ──────────────────────────────────────────────
(async () => {
  const server1 = await registerRoutes(app);

  // error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Vite or static depending on env
  if (app.get("env") === "development") {
    await setupVite(app, server1);
  } else {
    serveStatic(app);
  }

  // ─── 5) Launch ──────────────────────────────────────────────────────────────
  const port = Number(process.env.PORT) || 5050;
  const host = "0.0.0.0";
  const server = http.createServer(app);
  server.listen(port, host, () => {
    log(`✅ Server is running at http://${host}:${port}`);
  });
})();
