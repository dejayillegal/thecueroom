// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default ({ mode }) => {
  // Load all env vars (including VITE_BASE_PATH)
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.VITE_BASE_PATH || '/';

  return defineConfig({
    root: 'client',
    base,              // e.g. '/thecueroom/' in production
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'client/src'),
      },
    },
    build: {
      // 1) Output into dist/client instead of the top‐level dist/
      outDir: '../dist/client',
      emptyOutDir: true,

      // 2) Generate the SSR manifest (ssr-manifest.json)
      ssrManifest: true,

      sourcemap: true,

      // (Optional) tweak Rollup if you need a custom input:
      // rollupOptions: {
      //   input: path.resolve(__dirname, 'client/index.html'),
      // },
    },
  });
};
