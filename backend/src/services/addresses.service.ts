import { db } from "../db";
import * as schema from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export class AddressesService {
  static async create(payload: Partial<typeof schema.address.$inferInsert>) {
    const [created] = await db
      .insert(schema.address)
      .values(payload as any)
      .returning();
    return created;
  }

  static async listByUser(userId: number) {
    const rows = await db
      .select()
      .from(schema.address)
      .where(eq(schema.address.userId, userId))
      .orderBy(desc(schema.address.createdAt));
    return rows;
  }

  static async unsetDefaultForUser(userId: number) {
    await db
      .update(schema.address)
      .set({ isDefault: false })
      .where(eq(schema.address.userId, userId));
  }

  static async getById(id: number) {
    const rows = await db
      .select()
      .from(schema.address)
      .where(eq(schema.address.id, id))
      .limit(1);
    return rows[0] || null;
  }

  static async update(
    id: number,
    payload: Partial<typeof schema.address.$inferInsert>
  ) {
    const [updated] = await db
      .update(schema.address)
      .set(payload as any)
      .where(eq(schema.address.id, id))
      .returning();
    return updated;
  }

  static async remove(id: number) {
    const [deleted] = await db
      .delete(schema.address)
      .where(eq(schema.address.id, id))
      .returning();
    return deleted;
  }
}
