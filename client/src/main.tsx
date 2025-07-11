// Allow HMR to function normally - DOMException errors are non-critical

// client/src/main.tsx
import { createRoot } from "react-dom/client";
import { Router } from "wouter";
import App from "./App";
import "./index.css";

const container = document.getElementById("root");
if (!container) throw new Error("Failed to find the root element");

const root = createRoot(container);

// Vite injects the build-time base public path here.
// In dev this is "/", in prod on GitHub Pages it's "/thecueroom/".
const base = import.meta.env.BASE_URL || "/";

root.render(
  <Router base={base}>
    <App />
  </Router>
);
