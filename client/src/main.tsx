// Allow HMR to function normally - DOMException errors are non-critical

// client/src/main.tsx
import { createRoot } from "react-dom/client";
import { Router } from "wouter";
import { getRouterBase, getBasePath } from "./lib/router-config";
import App from "./App";
import "./index.css";

const container = document.getElementById("root");
if (!container) throw new Error("Failed to find the root element");

const root = createRoot(container);

// Determine base path without trailing slash for wouter routing
const base = getRouterBase();

// If redirected from 404.html, restore the original path
const savedPath = sessionStorage.getItem('redirect-path');
if (savedPath) {
  sessionStorage.removeItem('redirect-path');
  const basePath = getBasePath().replace(/\/$/, '');
  history.replaceState(null, '', basePath + savedPath);
}

root.render(
  <Router base={base}>
    <App />
  </Router>
);
