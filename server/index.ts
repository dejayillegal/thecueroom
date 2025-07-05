// server/index.ts

import http from "http";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// ─── 1) CORS ─────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL?.split(",") || "*",
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true
}));
app.options("*", cors());

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
      let line = `${req.method} ${req.path} ${res.statusCode} in ${Date.now()-start}ms`;
      if (capturedJson) {
        line += ` :: ${JSON.stringify(capturedJson)}`;
      }
      log(line.length > 120 ? line.slice(0,119) + "…" : line);
    }
  });

  next();
});


(async () => {
  // ─── 4) Mount all of your API + WS routes ───────────────────────────────────
  const server: http.Server = await registerRoutes(app);

  // ─── 5) Error handler (after routes!) ─────────────────────────────────────
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ message: err.message || "Internal Server Error" });
    // re-throw if you want your process to crash on uncaught exceptions
    throw err;
  });

  // ─── 6) Vite dev or static serve ────────────────────────────────────────────
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ─── 7) Finally, listen ────────────────────────────────────────────────────
  const port = Number(process.env.PORT) || 5050;
  const host = "0.0.0.0";
  
  server.listen(port, host, () => {
    log(`✅ Server is running at http://${host}:${port}`);
  });
})();
