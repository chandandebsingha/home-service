import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from '../types/config';
import * as schema from '../../drizzle/schema';

// Create the connection
const client = postgres(config.databaseUrl);
export const db = drizzle(client, { schema });
