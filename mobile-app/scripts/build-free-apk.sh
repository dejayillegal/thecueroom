#!/bin/bash

# TheCueRoom Mobile App - Free APK Builder
# Creates Android APK using Expo's free build service

echo "🔧 Building TheCueRoom Android APK (Free)"
echo "==========================================="

# Check if we're in the mobile-app directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the mobile-app directory"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Install EAS CLI globally if not present
if ! command -v eas &> /dev/null; then
    echo "🔧 Installing Expo EAS CLI..."
    npm install -g @expo/eas-cli
fi

# Create app icon assets
echo "🎨 Creating app assets..."
node scripts/create-assets.js

# Login to Expo (free account)
echo "🔐 Logging into Expo..."
echo "Create a free account at https://expo.dev if you don't have one"
eas login

# Configure EAS Build
if [ ! -f "eas.json" ]; then
    echo "⚙️ Configuring EAS Build..."
    eas build:configure
fi

# Update project ID in app.json
echo "🔧 Setting up project configuration..."
PROJECT_ID=$(eas project:info --non-interactive | grep "Project ID" | cut -d: -f2 | xargs)
if [ ! -z "$PROJECT_ID" ]; then
    # Update app.json with real project ID
    sed -i.bak "s/your-project-id/$PROJECT_ID/g" app.json
    echo "✅ Project ID updated: $PROJECT_ID"
fi

# Build APK for Android (FREE)
echo "🏗️ Building Android APK..."
echo "This uses Expo's free build service (limited builds per month)"
echo "Build will be queued and processed on Expo's servers"

# Build preview APK (optimized for testing)
eas build --platform android --profile preview --non-interactive

echo ""
echo "✅ APK Build Process Started!"
echo ""
echo "📱 What happens next:"
echo "1. Build is queued on Expo's free servers"
echo "2. You'll get an email when build completes (~10-15 minutes)"
echo "3. Download APK from the link in email or expo.dev dashboard"
echo "4. Install APK on Android device or emulator"
echo ""
echo "🔗 Monitor build progress:"
echo "https://expo.dev/accounts/[your-username]/projects/thecueroom-mobile/builds"
echo ""
echo "📲 Free APK Features:"
echo "- Full TheCueRoom functionality"
echo "- Works on any Android device"
echo "- No Google Play Store approval needed"
echo "- Direct installation from APK file"
echo ""
echo "⚠️ Free Build Limits:"
echo "- Limited builds per month"
echo "- Build queue may have delays"
echo "- Upgrade to paid plan for unlimited builds"
echo ""
echo "🎉 TheCueRoom mobile app will be ready soon!"