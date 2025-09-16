"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const db_1 = require("../db");
const schema_1 = require("../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
async function main() {
    const rows = await db_1.db.query.users.findMany({ where: (0, drizzle_orm_1.isNull)(schema_1.users.supabaseUid) });
    if (rows.length === 0) {
        console.log('No users with NULL supabase_uid to backfill.');
        return;
    }
    for (const u of rows) {
        const placeholder = `legacy-${u.id}`;
        await db_1.db.execute((0, drizzle_orm_1.sql) `UPDATE users SET supabase_uid = ${placeholder} WHERE id = ${u.id}`);
        console.log(`Backfilled user ${u.id} -> ${placeholder}`);
    }
    console.log('Backfill complete.');
}
main().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
});
//# sourceMappingURL=backfill-supabase-uid.js.map