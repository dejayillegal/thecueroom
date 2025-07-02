# TheCueRoom - Free Android APK Creation Guide

**Create your Android APK completely free using Expo's build service**

## Quick Start (10 minutes)

### Step 1: Setup
```bash
cd mobile-app
npm install
npm install -g @expo/eas-cli
```

### Step 2: Create Free Expo Account
1. Visit https://expo.dev
2. Sign up for free account (no credit card required)
3. Login via terminal: `eas login`

### Step 3: Build APK
```bash
chmod +x scripts/build-free-apk.sh
./scripts/build-free-apk.sh
```

### Step 4: Download & Install
1. Check email for build completion (10-15 minutes)
2. Download APK from link provided
3. Install on Android device

## Free Build Service Details

### Expo EAS Build (Free Tier)
- **Cost**: Completely free
- **Builds per month**: Limited but sufficient for personal use
- **Build time**: 10-15 minutes
- **File size**: Optimized APK (~30-50MB)
- **Requirements**: Free Expo account only

### What You Get
- **Full-featured APK**: Complete TheCueRoom app
- **Professional quality**: Production-ready Android app
- **Direct installation**: No Google Play Store needed
- **Automatic updates**: OTA updates for app changes
- **All features working**: Authentication, content, real-time features

## Build Process Explained

### 1. Assets Creation
```bash
node scripts/create-assets.js
```
- Creates app icons from your existing logo
- Generates splash screen
- Optimizes for Android requirements

### 2. Configuration
```bash
eas build:configure
```
- Sets up build profiles (development/preview/production)
- Configures Android-specific settings
- Creates EAS project

### 3. Cloud Build
```bash
eas build --platform android --profile preview
```
- Uploads code to Expo's build servers
- Compiles native Android app
- Generates signed APK file

### 4. Distribution
- Download link sent via email
- Direct APK installation on devices
- No app store approval required

## Manual Build Steps

### Prerequisites
```bash
# Install Node.js 18+
# Install Expo CLI
npm install -g @expo/eas-cli

# Navigate to mobile app
cd mobile-app
npm install
```

### Account Setup
```bash
# Create free account at expo.dev
# Login via CLI
eas login
```

### Build Configuration
```bash
# Configure EAS Build
eas build:configure

# Choose Android platform
# Select managed workflow
# Use default configuration
```

### Create Assets
```bash
# Generate app assets
node scripts/create-assets.js

# Verify assets created in mobile-app/assets/
ls -la assets/
```

### Start Build
```bash
# Build preview APK (free tier)
eas build --platform android --profile preview

# Monitor progress
eas build:list
```

### Download Results
1. Wait for email notification
2. Visit build URL from email
3. Download APK file
4. Transfer to Android device

## APK Installation

### Enable Unknown Sources
1. Android Settings → Security
2. Enable "Unknown Sources" or "Install unknown apps"
3. Allow installation from file manager

### Install APK
1. Transfer APK to Android device
2. Open file manager
3. Tap APK file
4. Follow installation prompts
5. Launch TheCueRoom app

### Testing
- Test login/registration
- Verify all features working
- Check network connectivity
- Test offline functionality

## Alternative Free Methods

### 1. GitHub Actions (Free)
```yaml
# .github/workflows/build-android.yml
name: Build Android APK
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx eas build --platform android --non-interactive
```

### 2. Local Build (Advanced)
```bash
# Requires Android Studio setup
npx create-expo-app --template
expo run:android
```

### 3. Online Build Services
- **AppCenter**: Microsoft's free build service
- **Bitrise**: Free tier available
- **CircleCI**: 2,500 free credits monthly

## Troubleshooting

### Build Fails
```bash
# Check build logs
eas build:list
eas build:view [build-id]

# Common fixes
rm -rf node_modules
npm install
expo doctor
```

### Installation Issues
- Enable Developer Options on Android
- Allow installation from unknown sources
- Check APK file integrity
- Try different file manager

### App Crashes
- Check device compatibility (Android 6.0+)
- Ensure sufficient storage space
- Clear app cache if reinstalling
- Check network permissions

## Production Considerations

### App Signing
- Expo handles signing automatically
- APK signed with Expo's certificate
- For Play Store: Generate upload key

### Updates
```bash
# Push over-the-air updates (free)
eas update --branch production --message "Bug fixes"
```

### Monitoring
- Check crash reports in Expo dashboard
- Monitor app performance
- Track user analytics

## Cost Breakdown

### Free Components
- **Expo EAS Build**: Free tier with monthly limits
- **App assets**: Generated from existing logos
- **Development tools**: All free and open source
- **Distribution**: Direct APK, no fees
- **Updates**: Over-the-air updates included

### Optional Paid Upgrades
- **Unlimited builds**: $29/month for Expo Pro
- **Google Play Store**: $25 one-time developer fee
- **App Store**: $99/year for iOS

## Next Steps

### Immediate
1. Build and test APK
2. Share with beta testers
3. Gather feedback
4. Iterate and improve

### Future Options
1. **Google Play Store**: $25 to publish officially
2. **Advanced features**: Push notifications, analytics
3. **iOS version**: Build for iPhone/iPad
4. **Custom domain**: branded download page

---

**Your Android APK will be ready in 15 minutes with zero cost using Expo's free build service.**