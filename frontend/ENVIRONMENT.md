# Environment Configuration Guide

## Simple Setup with One .env File

The app uses a single `.env` file to store the API URL. This file is excluded from version control for security.

## Configuration

Edit the `.env` file and uncomment the appropriate line based on your build target:

### For Development (local testing)
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

### For Preview Builds (testing on devices)
```env
# Find your local IP: ipconfig (Windows) or ifconfig (Mac/Linux)
EXPO_PUBLIC_API_BASE_URL=http://YOUR_LOCAL_IP:3001/api
```

### For Production Builds
```env
EXPO_PUBLIC_API_BASE_URL=https://home-service-0f1r.onrender.com/api
```

## Build Commands

```bash
# Preview build (for testing)
npm run build:preview

# Production build (AAB for Play Store)
npm run build:production

# Production APK
npm run build:production-apk
```

## Quick Setup

1. Open `.env` file
2. Uncomment the line you need
3. Comment out other lines
4. Build your app

That's it! 🚀