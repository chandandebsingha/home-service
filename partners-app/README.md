# Partners App

A React Native mobile application built with Expo for service providers to manage their services and accept bookings from customers.

## Overview

The Partners App is designed for service providers (partners) who want to:
- List and manage their services
- Accept or reject incoming booking requests
- Track their business performance
- Manage their profile and availability

## Features

### Dashboard
- Business overview with key metrics
- Quick access to common actions
- Recent bookings summary
- Monthly earnings tracking

### Services Management
- Add new services with detailed information
- Edit existing services
- Toggle service availability (active/inactive)
- Delete services
- View service performance

### Booking Management
- View incoming booking requests
- Accept or reject bookings
- Track booking status (pending, confirmed, in-progress, completed)
- Mark bookings as complete
- View customer details and special requests

### Profile Management
- Update partner profile information
- Manage business settings
- View account statistics

## App Structure

```
app/
├── (tabs)/
│   ├── index.tsx          # Dashboard
│   ├── services.tsx       # Services management
│   ├── bookings.tsx       # Incoming bookings
│   └── profile.tsx        # Partner profile
├── provider/
│   └── add-service.tsx    # Add/edit service form
├── auth/
│   ├── login.tsx          # Partner login
│   └── register.tsx       # Partner registration
└── _layout.tsx            # Main app layout
```

## Key Differences from Customer App

1. **Dashboard Focus**: Business metrics and performance tracking
2. **Service Management**: Full CRUD operations for services
3. **Booking Actions**: Accept/reject/complete booking requests
4. **Business Analytics**: Revenue tracking and service performance
5. **Provider-Centric UI**: Optimized for service provider workflows

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Run on your preferred platform:
   ```bash
   npm run android  # Android
   npm run ios      # iOS
   npm run web      # Web
   ```

## Configuration

The app uses the same backend API as the customer app but with different endpoints and permissions for service providers.

## Authentication

Partners need to register and login with their business credentials. The app supports:
- Email/password authentication
- Profile management
- Role-based access control

## API Integration

The app integrates with the backend API for:
- Service CRUD operations
- Booking management
- User authentication
- Business analytics

## Development

This app is built with:
- React Native with Expo
- TypeScript
- Expo Router for navigation
- React Context for state management
- Material Icons for UI elements

## Deployment

The app can be deployed using:
- Expo Application Services (EAS)
- App Store (iOS)
- Google Play Store (Android)
- Web deployment

## Support

For technical support or questions about the Partners App, please contact the development team.