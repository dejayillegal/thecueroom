// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default ({ mode }) => {
  // load all env vars (including VITE_BASE_PATH)
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.VITE_BASE_PATH || '/';

  return defineConfig({
    root: 'client',
    base,  // e.g. '/thecueroom/' in production
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'client/src'),
      },
    },
    build: {
      outDir: '../dist',
      emptyOutDir: true,
    },
  });
};
