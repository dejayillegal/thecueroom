// server/index.ts

import http from "http";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";              // ← import it
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// allow your GitHub Pages origin (or * for everything):
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// ─── 2) Body parsers ─────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 2) CORS — allow our GitHub Pages origin (and adjust if you add others)
app.use(cors({
  origin: process.env.CLIENT_URL?.split(",") || [] ,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  credentials: true
}));
 
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
