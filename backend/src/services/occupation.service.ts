import { db } from '../db';
import { occupations } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

export class OccupationService {
  private static ensureTable() {
    if (!occupations) {
      throw new Error('Occupations table is not initialized. Rebuild the backend so build/drizzle/schema.js includes occupations.');
    }
    return occupations;
  }

  static async create(newOccupation: typeof occupations.$inferInsert) {
    const tbl = this.ensureTable();
    const [created] = await db.insert(tbl).values(newOccupation).returning();
    return created;
  }

  static async list() {
    const tbl = this.ensureTable();
    const all = await db.select().from(tbl).where(eq(tbl.isActive, true));
    return all;
  }

  static async getById(id: number) {
    const tbl = this.ensureTable();
    const rows = await db.select().from(tbl).where(eq(tbl.id, id)).limit(1);
    return rows[0] || null;
  }

  static async update(id: number, updates: Partial<typeof occupations.$inferInsert>) {
    const tbl = this.ensureTable();
    const [updated] = await db.update(tbl).set(updates).where(eq(tbl.id, id)).returning();
    return updated;
  }

  static async delete(id: number) {
    const tbl = this.ensureTable();
    await db.delete(tbl).where(eq(tbl.id, id));
    return true;
  }
}
