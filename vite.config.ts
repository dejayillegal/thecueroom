import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Root is 'client', output to '../dist' (root/dist)
export default defineConfig({
  root: "client",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src")
    }
  },
  build: {
    outDir: '../dist',  // ← this makes dist/ at project root!
    emptyOutDir: true
  }
});
