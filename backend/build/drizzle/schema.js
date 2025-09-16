"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.services = exports.userSessions = exports.users = exports.roleEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.roleEnum = (0, pg_core_1.pgEnum)("role", ["user", "admin"]);
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
exports.services = (0, pg_core_1.pgTable)('services', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull(),
    description: (0, pg_core_1.text)('description'),
    price: (0, pg_core_1.integer)('price').notNull(),
    serviceType: (0, pg_core_1.text)('service_type'),
    durationMinutes: (0, pg_core_1.integer)('duration_minutes'),
    availability: (0, pg_core_1.boolean)('availability').default(true).notNull(),
    timeSlots: (0, pg_core_1.text)('time_slots'),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
});
//# sourceMappingURL=schema.js.map