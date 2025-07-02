#!/bin/bash

echo "🔧 Building TheCueRoom for development..."

# Clean previous builds
echo "1. Cleaning previous builds..."
rm -rf dist

# Build frontend
echo "2. Building frontend..."
npm run build

echo "✅ Build completed successfully!"
echo "📁 Output directory: ./dist/public"