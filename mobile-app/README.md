# TheCueRoom Mobile App

**React Native mobile application for India's underground techno and house music community**

## Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- Expo Go app on your phone

### Installation
```bash
cd mobile-app
npm install
```

### Development
```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run in web browser
npm run web
```

### Testing on Device
1. Install Expo Go app from App Store/Play Store
2. Scan QR code from terminal
3. App loads directly on your device

## Features

### Authentication
- **Login/Register**: Secure authentication with backend API
- **Password Reset**: Email-based password recovery
- **Profile Management**: Edit profile information
- **Session Storage**: Secure token storage with Expo SecureStore

### Main Features
- **Home Feed**: Community posts and interactions
- **Gigs**: Event listings and RSVP functionality
- **Memes**: AI-powered meme generator with community gallery
- **News**: Underground music news aggregation
- **Profile**: User settings and account management

### Technical Features
- **Dark/Light Theme**: System-aware theming
- **Offline Support**: Cached data and offline functionality
- **Push Notifications**: Event reminders and community updates
- **Camera Integration**: Profile pictures and content creation
- **Deep Linking**: Direct links to specific content

## App Structure

### Navigation
```
RootNavigator
├── AuthNavigator (logged out)
│   ├── LoginScreen
│   ├── RegisterScreen
│   └── ForgotPasswordScreen
└── MainNavigator (logged in)
    ├── HomeScreen (Tab)
    ├── GigsScreen (Tab)
    ├── MemesScreen (Tab)
    ├── NewsScreen (Tab)
    └── ProfileScreen (Tab)
```

### State Management
- **React Query**: Server state and caching
- **Context API**: Authentication and theme state
- **Secure Store**: Token and sensitive data storage
- **Zustand**: Local application state (if needed)

## API Integration

### Backend Connection
- **Production**: `https://thecueroom.xyz/api`
- **Development**: `http://localhost:5000/api`
- **Authentication**: Bearer token with automatic refresh
- **Error Handling**: Comprehensive error boundaries

### Endpoints Used
- `POST /api/login` - User authentication
- `POST /api/register` - Account creation
- `GET /api/user` - User profile data
- `GET /api/posts` - Community feed
- `GET /api/gigs` - Event listings
- `POST /api/memes/generate` - AI meme generation
- `GET /api/news` - Music news aggregation

## Development Setup

### Environment Configuration
Create `.env` in mobile-app directory:
```env
EXPO_PUBLIC_API_URL=https://thecueroom.xyz/api
EXPO_PUBLIC_WEB_URL=https://thecueroom.xyz
```

### Local Development
```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
EXPO_PUBLIC_WEB_URL=http://localhost:5000
```

### Building for Production

#### iOS App Store
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios
```

#### Google Play Store
```bash
# Build for Android
eas build --platform android

# Submit to store
eas submit --platform android
```

### App Store Submission

#### iOS Requirements
- Apple Developer Account ($99/year)
- App Store screenshots (multiple sizes)
- App description and metadata
- Privacy policy URL
- Age rating questionnaire

#### Android Requirements
- Google Play Developer Account ($25 one-time)
- App bundle (.aab file)
- Store listing details
- Content rating questionnaire
- Privacy policy

## Design System

### Theme Colors
```javascript
darkColors = {
  primary: '#ff6b35',
  background: '#000000',
  surface: '#1a1a1a',
  text: '#ffffff',
  textSecondary: '#cccccc',
  border: '#333333',
  error: '#ff4444',
  success: '#00ff88',
  warning: '#ffaa00',
}
```

### Typography
- **Headers**: Bold, prominent sizing
- **Body**: Clean, readable fonts
- **Labels**: Uppercase, spaced for clarity
- **Buttons**: Bold, contrasting colors

### Layout
- **Spacing**: 16px base unit system
- **Border Radius**: 8px for cards, 20px for buttons
- **Shadows**: Subtle depth for cards
- **Icons**: Ionicons for consistency

## Performance

### Optimization
- **Lazy Loading**: Screens and heavy components
- **Image Caching**: Automatic image optimization
- **Bundle Splitting**: Code splitting for faster loads
- **Memory Management**: Proper cleanup and disposal

### Metrics
- **App Size**: <50MB for optimal download
- **Startup Time**: <3 seconds cold start
- **Navigation**: <500ms between screens
- **API Calls**: <2 seconds response time

## Testing

### Unit Tests
```bash
npm test
```

### E2E Testing
```bash
# Install Detox
npm install -g detox-cli

# Run E2E tests
detox test
```

### Manual Testing Checklist
- [ ] Login/logout flow
- [ ] Navigation between tabs
- [ ] Theme switching
- [ ] Offline functionality
- [ ] Push notifications
- [ ] Deep linking
- [ ] Camera integration

## Deployment

### Beta Testing
- **TestFlight** (iOS): Internal and external testing
- **Internal App Sharing** (Android): Quick distribution
- **Expo Updates**: Over-the-air updates for JS changes

### Production Release
1. Update version in `app.json`
2. Build production bundle
3. Submit to app stores
4. Monitor crash reports
5. Update as needed

## Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear cache
expo r -c

# Reset node modules
rm -rf node_modules
npm install
```

#### Simulator Issues
```bash
# Reset iOS simulator
xcrun simctl erase all

# Restart Android emulator
adb reboot
```

#### Network Issues
- Check API endpoint configuration
- Verify network permissions
- Test on different networks

### Support
- GitHub Issues for bug reports
- Discord community for questions
- Email support for urgent issues

---

**Ready to build! The mobile app provides full TheCueRoom functionality on iOS and Android with native performance and offline capabilities.**