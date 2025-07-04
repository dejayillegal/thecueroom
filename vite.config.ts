// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: '/thecueroom/',    // ← add this line
  root: "client",
  envDir: path.resolve(__dirname),
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
    },
  },
  build: {
    outDir: "../dist/client",   // <— note ../dist/client
    emptyOutDir: true,
  },
});
