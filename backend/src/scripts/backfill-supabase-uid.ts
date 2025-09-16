import 'dotenv/config';
import { db } from '../db';
import { users } from '../../drizzle/schema';
import { isNull, sql } from 'drizzle-orm';

async function main() {
  const rows = await db.query.users.findMany({ where: isNull(users.supabaseUid) });
  if (rows.length === 0) {
    console.log('No users with NULL supabase_uid to backfill.');
    return;
  }

  for (const u of rows) {
    const placeholder = `legacy-${u.id}`;
    await db.execute(sql`UPDATE users SET supabase_uid = ${placeholder} WHERE id = ${u.id}`);
    console.log(`Backfilled user ${u.id} -> ${placeholder}`);
  }

  console.log('Backfill complete.');
}

main().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
