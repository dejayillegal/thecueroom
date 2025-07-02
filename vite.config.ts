import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Make sure this matches your structure!
export default defineConfig({
  root: "client",
  plugins: [react()],
  resolve: {
  alias: {
      "@": path.resolve(__dirname, "client/src")
    }
  },
  build: {
    outDir: "../dist", // output dist at project root
    emptyOutDir: true
  }
});
