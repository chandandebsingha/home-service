"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../db");
const schema_1 = require("../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const supabase_service_1 = require("../services/supabase.service");
async function main() {
    const email = process.env.ADMIN_EMAIL || 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const fullName = process.env.ADMIN_NAME || 'Administrator';
    const existing = await db_1.db.query.users.findFirst({ where: (0, drizzle_orm_1.eq)(schema_1.users.email, email) });
    if (existing) {
        console.log('Admin user already exists:', email);
        process.exit(0);
        return;
    }
    const adminUser = await supabase_service_1.SupabaseService.adminCreateUser(email, password, { fullName });
    if (!adminUser?.id)
        throw new Error('Failed to create Supabase admin user');
    const passwordHash = await bcrypt_1.default.hash(password, 12);
    const newUser = {
        email,
        passwordHash,
        fullName,
        isEmailVerified: true,
        role: 'admin',
        supabaseUid: adminUser.id,
    };
    const [created] = await db_1.db.insert(schema_1.users).values(newUser).returning();
    console.log('Admin user created:', created.email);
}
main().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=seed-admin.js.map