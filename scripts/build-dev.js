#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔧 Building TheCueRoom for GitHub Pages Development...\n');

// Step 1: Clean previous builds
console.log('1. Cleaning previous builds...');
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}

// Step 2: Set environment for GitHub Pages subdirectory
const repoName = process.env.GITHUB_REPOSITORY ? 
  process.env.GITHUB_REPOSITORY.split('/')[1] : 
  'thecueroom';

process.env.VITE_BASE_PATH = `/${repoName}/`;

console.log(`2. Building for GitHub Pages path: ${process.env.VITE_BASE_PATH}`);

// Step 3: Build with development config
console.log('3. Building frontend...');
try {
  execSync('vite build --config vite.config.dev.ts --mode development', { stdio: 'inherit' });
  console.log('✅ Frontend build completed');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 4: Create 404.html for SPA routing on GitHub Pages
console.log('4. Setting up SPA routing...');
const indexPath = 'dist/public/index.html';
const notFoundPath = 'dist/public/404.html';

if (fs.existsSync(indexPath)) {
  fs.copyFileSync(indexPath, notFoundPath);
  console.log('   ✓ Created 404.html for SPA routing');
}

// Step 5: Create .nojekyll file
fs.writeFileSync('dist/public/.nojekyll', '');
console.log('   ✓ Created .nojekyll file');

// Step 6: Update base href in HTML files
console.log('5. Updating base paths...');
const htmlFiles = ['dist/public/index.html', 'dist/public/404.html'];
htmlFiles.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace('<head>', `<head>\n    <base href="${process.env.VITE_BASE_PATH}">`);
    fs.writeFileSync(file, content);
  }
});
console.log('   ✓ Updated HTML base paths');

// Step 7: Create deployment info
console.log('6. Creating deployment info...');
const deploymentInfo = {
  buildTime: new Date().toISOString(),
  version: '2.0.0-dev',
  environment: 'development',
  hosting: 'GitHub Pages',
  basePath: process.env.VITE_BASE_PATH,
  repository: repoName
};

fs.writeFileSync('dist/public/deployment-info.json', JSON.stringify(deploymentInfo, null, 2));

console.log('\n✅ Development build completed successfully!');
console.log(`📁 Output: ./dist/public`);
console.log(`🌐 Will be available at: https://[username].github.io/${repoName}/`);
console.log('🔧 Ready for GitHub Pages development deployment\n');