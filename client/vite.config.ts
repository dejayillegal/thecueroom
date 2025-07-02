import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  root: ".",
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  plugins: [react(), /* optionally tsconfig paths here */],
  css: {
    postcss: path.resolve(__dirname, "postcss.config.js"),
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
