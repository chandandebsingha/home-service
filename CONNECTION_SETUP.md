# Frontend-Backend Connection Setup

This document explains how the frontend and backend are connected and how to run the complete application.

## Architecture Overview

The application consists of:
- **Backend**: Express.js API server with Supabase authentication
- **Frontend**: React Native/Expo mobile app
- **Database**: PostgreSQL with Drizzle ORM

## Connection Details

### Backend API
- **Port**: 3001
- **Base URL**: `http://localhost:3001/api`
- **Authentication**: JWT tokens with Supabase integration
- **CORS**: Configured to allow frontend connections

### Frontend Configuration
- **API Service**: Centralized API communication layer
- **Authentication Context**: Global state management for user auth
- **Environment Config**: Configurable API endpoints

## Key Features Implemented

### 1. API Service Layer (`frontend/src/services/api.ts`)
- Centralized HTTP client
- Type-safe API calls
- Error handling
- Authentication token management

### 2. Authentication Context (`frontend/src/contexts/AuthContext.tsx`)
- Global authentication state
- Login/logout functionality
- Token persistence with AsyncStorage
- Automatic token validation

### 3. Authentication Screens
- **Login Screen** (`frontend/app/auth/login.tsx`)
- **Registration Screen** (`frontend/app/auth/register.tsx`)
- Form validation and error handling

### 4. Protected Routes
- Authentication checks before accessing services
- Automatic redirect to login for unauthenticated users
- User profile display with real data

## Running the Application

### Option 1: Use the provided scripts

**Windows:**
```bash
start-dev.bat
```

**Linux/Mac:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

### Option 2: Manual setup

**1. Start the Backend:**
```bash
cd backend
npm install
npm run dev
```

**2. Start the Frontend:**
```bash
cd frontend
npm install
npm start
```

## Testing the Connection

### 1. Health Check
The backend provides a health check endpoint at `http://localhost:3001/` that returns:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### 3. Frontend Testing
The frontend includes connection testing utilities in `frontend/src/utils/testConnection.ts`:
```typescript
import { runConnectionTests } from '../src/utils/testConnection';
runConnectionTests();
```

## Environment Configuration

### Backend Environment Variables
Create a `.env` file in the `backend` directory:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
DATABASE_URL=your_database_url
PORT=3001
NODE_ENV=development
```

### Frontend Configuration
The frontend uses environment-based configuration in `frontend/src/config/environment.ts`:
```typescript
export const ENV = {
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3001/api',
  NODE_ENV: process.env.NODE_ENV || 'development',
  // ... other config
};
```

## CORS Configuration

The backend is configured to allow requests from:
- `http://localhost:8081` (Expo development server)
- `http://localhost:19006` (Expo web)
- `exp://localhost:19000` (Expo development client)
- `exp://192.168.1.100:19000` (Expo on local network)

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure the backend is running on port 3001
   - Check that the frontend is using the correct API URL
   - Verify CORS configuration in `backend/src/app.ts`

2. **Authentication Issues**
   - Verify Supabase configuration
   - Check JWT secret is set correctly
   - Ensure database is properly configured

3. **Connection Refused**
   - Make sure backend is running before starting frontend
   - Check if port 3001 is available
   - Verify firewall settings

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will provide detailed logs for both frontend and backend.

## Next Steps

1. **Database Setup**: Ensure your PostgreSQL database is running and migrations are applied
2. **Supabase Configuration**: Set up your Supabase project and configure the environment variables
3. **Testing**: Use the provided test utilities to verify the connection
4. **Development**: Start building additional features using the established patterns

## File Structure

```
home-service/
├── backend/
│   ├── src/
│   │   ├── app.ts                 # Express app with CORS config
│   │   ├── routes/auth.routes.ts  # Authentication endpoints
│   │   └── services/              # Business logic
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── config/                # API and environment config
│   │   ├── contexts/              # React contexts (Auth)
│   │   ├── services/              # API service layer
│   │   └── utils/                 # Utility functions
│   ├── app/
│   │   ├── auth/                  # Authentication screens
│   │   └── (tabs)/                # Main app screens
│   └── package.json
├── start-dev.bat                  # Windows startup script
├── start-dev.sh                   # Linux/Mac startup script
└── CONNECTION_SETUP.md            # This file
```

The connection is now fully established and ready for development!
