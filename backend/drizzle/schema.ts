import { pgTable, serial, text, timestamp, boolean, integer, uniqueIndex, pgEnum } from 'drizzle-orm/pg-core';
export const roleEnum = pgEnum("role", ["user", "admin"]);
// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  supabaseUid: text('supabase_uid').unique().notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  fullName: text('full_name').notNull(),
  role: roleEnum('role').default('user'),
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

// Service categories
export const serviceCategories = pgTable('service_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Service types (sub-categories) under a category
export const serviceTypes = pgTable('service_types', {
  id: serial('id').primaryKey(),
  categoryId: integer('category_id').references(() => serviceCategories.id),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: integer('price').notNull(),
  // legacy free-text service type for backward compatibility
  serviceType: text('service_type'),
  // new relational fields
  categoryId: integer('category_id').references(() => serviceCategories.id),
  serviceTypeId: integer('service_type_id').references(() => serviceTypes.id),
  durationMinutes: integer('duration_minutes'),
  availability: boolean('availability').default(true).notNull(),
  timeSlots: text('time_slots'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  serviceId: integer('service_id').references(() => services.id).notNull(),
  date: text('date').notNull(),
  time: text('time').notNull(),
  address: text('address').notNull(),
  specialInstructions: text('special_instructions'),
  price: integer('price').notNull(),
  status: text('status').default('upcoming').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;
export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type NewServiceCategory = typeof serviceCategories.$inferInsert;
export type ServiceType = typeof serviceTypes.$inferSelect;
export type NewServiceType = typeof serviceTypes.$inferInsert;