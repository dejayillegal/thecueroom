#!/bin/bash

# Quick APK Builder for TheCueRoom Mobile
# One-command APK creation using Expo's free tier

echo "📱 TheCueRoom - Quick APK Builder"
echo "================================"

# Check if in mobile-app directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run from mobile-app directory"
    exit 1
fi

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Create assets
echo "Creating app assets..."
node scripts/create-assets.js

# Add build script to package.json if not exists
if ! grep -q "build:apk" package.json; then
    echo "Adding build scripts..."
    sed -i.bak 's/"scripts": {/"scripts": {\n    "build:apk": "eas build --platform android --profile preview",\n    "setup": "npm install \&\& eas login \&\& eas build:configure",/' package.json
fi

echo ""
echo "🚀 Ready to build APK!"
echo ""
echo "Next steps:"
echo "1. Create free Expo account: https://expo.dev"
echo "2. Run: npm run setup"
echo "3. Run: npm run build:apk"
echo ""
echo "Build will complete in ~15 minutes"
echo "APK download link sent to your email"