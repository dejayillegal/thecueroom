import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: "client",              // ← your React app lives under “client/”
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src")
    }
  },
  build: {
    outDir: "../dist",         // ← everything ends up in <repo>/dist
    emptyOutDir: true
  }
});
