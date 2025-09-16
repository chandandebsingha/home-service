import { defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env' });

// Check if DATABASE_URL is provided
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is required');
  console.error('Please create a .env file with your database connection string');
  console.error('Example: DATABASE_URL=postgresql://username:password@localhost:5432/database_name');
  process.exit(1);
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './drizzle/schema.ts', 
  out: './drizzle/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});