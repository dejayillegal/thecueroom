#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building TheCueRoom for Production Deployment...\n');

// Step 1: Clean previous builds
console.log('1. Cleaning previous builds...');
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}

// Step 2: Build frontend
console.log('2. Building frontend with Vite...');
execSync('vite build', { stdio: 'inherit' });

// Step 3: Build server for Vercel
console.log('3. Building server for Vercel deployment...');
execSync('esbuild server/vercel-adapter.ts --bundle --platform=node --target=node18 --outfile=dist/server.js --external:pg-native --external:@neondatabase/serverless', { stdio: 'inherit' });

// Step 4: Copy necessary files
console.log('4. Copying deployment files...');
const filesToCopy = [
  'vercel.json',
  'CNAME',
  '.env.production',
  'package.json',
  'package-lock.json'
];

filesToCopy.forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join('dist', file));
    console.log(`   ✓ Copied ${file}`);
  }
});

// Step 5: Create GitHub Pages specific files
console.log('5. Setting up GitHub Pages deployment...');
if (!fs.existsSync('dist/')) {
  fs.mkdirSync('dist/', { recursive: true });
}

// Copy CNAME to public directory for GitHub Pages
fs.copyFileSync('CNAME', 'dist/CNAME');

// Step 6: Create deployment package
console.log('6. Creating deployment package...');
const deploymentInfo = {
  buildTime: new Date().toISOString(),
  version: '2.0.0',
  platform: 'GitHub Pages + Vercel',
  domain: 'thecueroom.xyz',
  features: [
    'Complete authentication system',
    'Content management and moderation',
    'Real-time community features',
    'Admin dashboard',
    'Email verification',
    'Mobile responsive design'
  ]
};

fs.writeFileSync('dist/deployment-info.json', JSON.stringify(deploymentInfo, null, 2));

console.log('\n✅ Production build completed successfully!');
console.log('\nDeployment Options:');
console.log('📁 Frontend: dist (GitHub Pages)');
console.log('⚡ API: ./dist/server.js (Vercel Functions)');
console.log('🌐 Domain: thecueroom.xyz');
console.log('\nNext steps:');
console.log('1. Upload to GitHub repository');
console.log('2. Enable GitHub Pages');
console.log('3. Deploy API to Vercel');
console.log('4. Configure DNS at Hostinger\n');