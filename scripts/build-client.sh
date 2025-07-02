#!/usr/bin/env bash
set -e

echo "1️⃣  Cleaning root dist/"
rm -rf dist
mkdir -p dist/public

echo "2️⃣  Installing client dependencies (npm install)"
pushd client > /dev/null
npm install          # <-- changed from `npm ci`
echo "   ✓ Dependencies installed"

echo "3️⃣  Building client"
npm run build
popd > /dev/null
echo "   ✓ Client build completed"

echo "4️⃣  Copying built files"
cp -R client/dist/* dist/public/
echo "   ✓ Files copied"

echo "✅ Done. dist/public is ready for deployment."
