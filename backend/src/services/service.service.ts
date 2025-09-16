import { db } from '../db';
import * as schema from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

export class ServiceService {
  static ensureTable() {
    if (!(schema as any).services) {
      throw new Error('Services table is not initialized. Ensure drizzle/schema exports services and server restarted.');
    }
    return (schema as any).services as typeof schema.services;
  }

  static async create(newService: typeof schema.services.$inferInsert) {
    const services = this.ensureTable();
    const [created] = await db.insert(services).values(newService).returning();
    return created;
  }

  static async list(limit = 50, offset = 0) {
    const services = this.ensureTable();
    const all = await db.select().from(services).limit(limit).offset(offset);
    return all;
  }

  static async getById(id: number) {
    const services = this.ensureTable();
    const rows = await db.select().from(services).where(eq(services.id, id)).limit(1);
    return rows[0] || null;
  }
}
