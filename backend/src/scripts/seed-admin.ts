import 'dotenv/config';
import bcrypt from 'bcrypt';
import { db } from '../db';
import { users, type NewUser } from '../../build/drizzle/schema';
import { eq } from 'drizzle-orm';
import { SupabaseService } from '../services/supabase.service';

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123456';
  const fullName = process.env.ADMIN_NAME || 'Administrator';

  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) {
    console.log('Admin user already exists:', email);
    process.exit(0);
    return;
  }

  const adminUser = await SupabaseService.adminCreateUser(email, password, { fullName });
  if (!adminUser?.id) throw new Error('Failed to create Supabase admin user');

  const passwordHash = await bcrypt.hash(password, 12);
  const newUser: NewUser = {
    email,
    passwordHash,
    fullName,
    isEmailVerified: true,
    role: 'admin' as any,
    supabaseUid: adminUser.id,
  };

  const [created] = await db.insert(users).values(newUser).returning();
  console.log('Admin user created:', created.email);
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
