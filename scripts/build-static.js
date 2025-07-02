#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building TheCueRoom Static Assets...\n');

// Step 1: Clean previous builds
console.log('1. Cleaning previous builds...');
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}

// Step 2: Build frontend only
console.log('2. Building frontend with Vite...');
try {
  execSync('vite build --mode production', { stdio: 'inherit' });
  console.log('✅ Frontend build completed');
} catch (error) {
  console.error('❌ Frontend build failed:', error.message);
  process.exit(1);
}

// Step 3: Copy CNAME to dist
console.log('3. Setting up GitHub Pages deployment...');
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist/', { recursive: true });
}

// Copy CNAME for GitHub Pages
if (fs.existsSync('public/CNAME')) {
  fs.copyFileSync('public/CNAME', 'dist/CNAME');
  console.log('   ✓ Copied CNAME for GitHub Pages');
}

// Step 4: Create deployment info
console.log('4. Creating deployment info...');
const deploymentInfo = {
  buildTime: new Date().toISOString(),
  version: '2.0.0',
  platform: 'GitHub Pages',
  domain: 'thecueroom.xyz',
  buildType: 'static'
};

fs.writeFileSync('dist/deployment-info.json', JSON.stringify(deploymentInfo, null, 2));

console.log('\n✅ Static build completed successfully!');
console.log('📁 Output: dist');
console.log('🌐 Ready for GitHub Pages deployment\n');