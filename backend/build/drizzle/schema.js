"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookings = exports.providerProfiles = exports.occupations = exports.services = exports.serviceTypes = exports.serviceCategories = exports.userSessions = exports.users = exports.roleEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.roleEnum = (0, pg_core_1.pgEnum)("role", ["user", "admin", "partner"]);
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    supabaseUid: (0, pg_core_1.text)('supabase_uid').unique().notNull(),
    email: (0, pg_core_1.text)('email').notNull().unique(),
    passwordHash: (0, pg_core_1.text)('password_hash'),
    fullName: (0, pg_core_1.text)('full_name').notNull(),
    role: (0, exports.roleEnum)('role').default('user'),
    isEmailVerified: (0, pg_core_1.boolean)('is_email_verified').default(false).notNull(),
    lastLogin: (0, pg_core_1.timestamp)('last_login'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
}, (table) => {
    return {
        emailIdx: (0, pg_core_1.uniqueIndex)('email_idx').on(table.email),
        supabaseUidIdx: (0, pg_core_1.uniqueIndex)('supabase_uid_idx').on(table.supabaseUid),
    };
});
exports.userSessions = (0, pg_core_1.pgTable)('user_sessions', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').references(() => exports.users.id),
    token: (0, pg_core_1.text)('token').notNull(),
    deviceInfo: (0, pg_core_1.text)('device_info'),
    ipAddress: (0, pg_core_1.text)('ip_address'),
    expiresAt: (0, pg_core_1.timestamp)('expires_at').notNull(),
    isValid: (0, pg_core_1.boolean)('is_valid').default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
});
exports.serviceCategories = (0, pg_core_1.pgTable)('service_categories', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    description: (0, pg_core_1.text)('description'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.serviceTypes = (0, pg_core_1.pgTable)('service_types', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    categoryId: (0, pg_core_1.integer)('category_id').references(() => exports.serviceCategories.id),
    name: (0, pg_core_1.text)('name').notNull(),
    description: (0, pg_core_1.text)('description'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.services = (0, pg_core_1.pgTable)('services', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    description: (0, pg_core_1.text)('description'),
    price: (0, pg_core_1.integer)('price').notNull(),
    serviceType: (0, pg_core_1.text)('service_type'),
    categoryId: (0, pg_core_1.integer)('category_id').references(() => exports.serviceCategories.id),
    serviceTypeId: (0, pg_core_1.integer)('service_type_id').references(() => exports.serviceTypes.id),
    providerId: (0, pg_core_1.integer)('provider_id').references(() => exports.users.id),
    durationMinutes: (0, pg_core_1.integer)('duration_minutes'),
    availability: (0, pg_core_1.boolean)('availability').default(true).notNull(),
    timeSlots: (0, pg_core_1.text)('time_slots'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.occupations = (0, pg_core_1.pgTable)('occupations', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    description: (0, pg_core_1.text)('description'),
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.providerProfiles = (0, pg_core_1.pgTable)('provider_profiles', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').references(() => exports.users.id).notNull().unique(),
    occupationId: (0, pg_core_1.integer)('occupation_id').references(() => exports.occupations.id),
    businessName: (0, pg_core_1.text)('business_name'),
    businessAddress: (0, pg_core_1.text)('business_address'),
    phoneNumber: (0, pg_core_1.text)('phone_number'),
    experience: (0, pg_core_1.text)('experience'),
    skills: (0, pg_core_1.text)('skills'),
    certifications: (0, pg_core_1.text)('certifications'),
    bio: (0, pg_core_1.text)('bio'),
    isVerified: (0, pg_core_1.boolean)('is_verified').default(false).notNull(),
    isActive: (0, pg_core_1.boolean)('is_active').default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
exports.bookings = (0, pg_core_1.pgTable)('bookings', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.integer)('user_id').references(() => exports.users.id).notNull(),
    serviceId: (0, pg_core_1.integer)('service_id').references(() => exports.services.id).notNull(),
    date: (0, pg_core_1.text)('date').notNull(),
    time: (0, pg_core_1.text)('time').notNull(),
    address: (0, pg_core_1.text)('address').notNull(),
    specialInstructions: (0, pg_core_1.text)('special_instructions'),
    price: (0, pg_core_1.integer)('price').notNull(),
    status: (0, pg_core_1.text)('status').default('upcoming').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
//# sourceMappingURL=schema.js.map