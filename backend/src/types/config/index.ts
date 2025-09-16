import * as dotenv from 'dotenv';

dotenv.config();

// Required environment variables
const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'DATABASE_URL'
];

// Validate required environment variables
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const config = {
  // Supabase
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY!,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  
  // Database
  databaseUrl: process.env.DATABASE_URL!,
  
  // JWT
  jwtSecret: process.env.JWT_SECRET!,
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '1h',
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // App
  appName: process.env.APP_NAME || 'Home Service App',
};