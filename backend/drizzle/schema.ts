import { pgTable, serial, text, timestamp, boolean, integer, uniqueIndex } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  supabaseUid: text('supabase_uid').unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  fullName: text('full_name').notNull(),
  role: text('role').default('user').notNull(),
  isEmailVerified: boolean('is_email_verified').default(false).notNull(),
  lastLogin: timestamp('last_login'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    emailIdx: uniqueIndex('email_idx').on(table.email),
    supabaseUidIdx: uniqueIndex('supabase_uid_idx').on(table.supabaseUid),
  };
});

// User sessions table
export const userSessions = pgTable('user_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  token: text('token').notNull(),
  deviceInfo: text('device_info'),
  ipAddress: text('ip_address'),
  expiresAt: timestamp('expires_at').notNull(),
  isValid: boolean('is_valid').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;