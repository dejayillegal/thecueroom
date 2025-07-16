// scripts/install-esbuild-binaries.js
import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";

// List out every nested esbuild folder that needs its own binary install.
const targets = [
  "node_modules/@vercel/node/node_modules/esbuild",
  "node_modules/drizzle-kit/node_modules/esbuild",
  "node_modules/@esbuild-kit/core-utils/node_modules/esbuild",
  "node_modules/vite/node_modules/esbuild",
  "node_modules/esbuild"
];

for (const rel of targets) {
  const dir = path.resolve(process.cwd(), rel);
  if (fs.existsSync(dir)) {
    console.log(`⏬ Installing esbuild binary in ${rel}`);
    const result = spawnSync("node", ["install.js"], { cwd: dir, stdio: "inherit" });
    if (result.status !== 0) {
      console.error(`❌ Failed to install binary for ${rel}`);
      process.exit(result.status);
    }
  }
}
