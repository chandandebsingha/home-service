import { db } from '../db';
import * as schema from '../../drizzle/schema';
import { eq, desc } from 'drizzle-orm';

export class BookingService {
  static async ensureServiceExists(serviceId: number) {
    const rows = await db.select().from(schema.services).where(eq(schema.services.id, serviceId)).limit(1);
    return !!rows[0];
  }

  static async create(payload: schema.NewBooking) {
    const [created] = await db.insert(schema.bookings).values(payload).returning();
    return created;
  }

  static async listByUser(userId: number) {
    const rows = await db.select().from(schema.bookings).where(eq(schema.bookings.userId, userId)).orderBy(desc(schema.bookings.createdAt));
    return rows;
  }
}
