#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🔧 Quick Build for TheCueRoom...\n');

try {
  // Clean and build
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  
  console.log('Building production version...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  console.log('Building server...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { stdio: 'inherit' });
  
  console.log('✅ Build completed successfully!');
  console.log('📁 Frontend: dist');
  console.log('📁 Backend: ./dist/index.js');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}