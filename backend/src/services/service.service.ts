import { db } from '../db';
import { services, serviceCategories, serviceTypes, bookings } from '../../drizzle/schema';
import { and, eq } from 'drizzle-orm';

export class ServiceService {
  static ensureTable() {
    if (!services) {
      throw new Error('Services table is not initialized. Ensure drizzle/schema exports services and server restarted.');
    }
    return services;
  }

  static async create(newService: typeof services.$inferInsert) {
    const servicesTable = this.ensureTable();
    const [created] = await db.insert(servicesTable).values(newService).returning();
    return created;
  }

  static async list(limit = 50, offset = 0, filters?: { categoryId?: number; serviceTypeId?: number }) {
    const servicesTable = this.ensureTable();
    const whereClauses = [] as any[];
    if (filters?.categoryId) whereClauses.push(eq(servicesTable.categoryId, filters.categoryId));
    if (filters?.serviceTypeId) whereClauses.push(eq(servicesTable.serviceTypeId, filters.serviceTypeId));
    const where = whereClauses.length === 0 ? undefined : (whereClauses.length === 1 ? whereClauses[0] : and(...whereClauses));
    const query = db.select().from(servicesTable).limit(limit).offset(offset);
    // drizzle allows conditionally adding where
    const all = where ? await query.where(where) : await query;
    return all;
  }

  static async getById(id: number) {
    const servicesTable = this.ensureTable();
    const rows = await db.select().from(servicesTable).where(eq(servicesTable.id, id)).limit(1);
    return rows[0] || null;
  }

  static async listByProvider(providerId: number) {
    const servicesTable = this.ensureTable();
    const rows = await db.select().from(servicesTable).where(eq(servicesTable.providerId, providerId));
    return rows;
  }

  static async update(id: number, updates: Partial<typeof services.$inferInsert>) {
    const servicesTable = this.ensureTable();
    const [updated] = await db.update(servicesTable).set(updates).where(eq(servicesTable.id, id)).returning();
    return updated;
  }

  static async delete(id: number) {
    const servicesTable = this.ensureTable();
    await db.delete(servicesTable).where(eq(servicesTable.id, id));
    return true;
  }
}
