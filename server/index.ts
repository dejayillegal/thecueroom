// server/index.ts

import path from 'path';
import moduleAlias from 'module-alias';
import http from 'http';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import 'module-alias/register'; // after aliases are set
import { registerRoutes } from './routes.js';
import { setupVite, serveStatic, log } from './vite.js';

// ─── 0) Register @shared alias so that require('@shared/...') resolves to dist/shared/… ───
moduleAlias.addAlias(
  '@shared',
  path.resolve(__dirname, '../shared')
);

const app = express();

// ─── 1) CORS ────────────────────────────────────────────────────────────────────────────
// Strictly match your GitHub Pages origin here
const clientOrigin = process.env.CLIENT_URL || 'https://dejayillegal.github.io';

// Allow multiple frontend origins (GitHub Pages & custom domains)
const allowedOrigins = [
  clientOrigin,
  'https://dejayillegal.github.io',
  'https://thecueroom.xyz',
  'https://www.thecueroom.xyz',
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const normalized = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(normalized)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Preflight for ALL routes
app.options('*', cors(corsOptions));
// Actual CORS for ALL routes
app.use(cors(corsOptions));

// ─── 2) Body parsers ───────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ─── 3) Logging middleware ─────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  let capturedJson: any;
  const originalJson = res.json;
  res.json = (body: any, ...args: any[]) => {
    capturedJson = body;
    return originalJson.call(res, body, ...args);
  };

  res.on('finish', () => {
    if (req.path.startsWith('/api')) {
      let line = `${req.method} ${req.path} ${res.statusCode} in ${Date.now() - start}ms`;
      if (capturedJson) {
        line += ` :: ${JSON.stringify(capturedJson)}`;
      }
      log(line.length > 120 ? line.slice(0, 119) + '…' : line);
    }
  });

  next();
});

(async () => {
  // ─── 4) Health check endpoint ─────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ─── 5) Mount API + WS routes under /api ──────────────────────────────────────────────
  const server: http.Server = await registerRoutes(app);

  // ─── 6) Error handler (after routes) ─────────────────────────────────────────────────
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ message: err.message || 'Internal Server Error' });
  });

  // ─── 7) Vite dev or static serve ──────────────────────────────────────────────────────
  if (app.get('env') === 'development') {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ─── 8) Listen ────────────────────────────────────────────────────────────────────────
  const port = Number(process.env.PORT) || 5050;
  const host = '0.0.0.0';

  server.listen(port, host, () => {
    log(`✅ Server is running at http://${host}:${port}`);
  });
})();
