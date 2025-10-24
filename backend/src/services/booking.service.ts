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

  static async listByProvider(providerId: number) {
    // Get bookings for services owned by the provider
    const rows = await db
      .select({
        id: schema.bookings.id,
        userId: schema.bookings.userId,
        serviceId: schema.bookings.serviceId,
        date: schema.bookings.date,
        time: schema.bookings.time,
        address: schema.bookings.address,
        specialInstructions: schema.bookings.specialInstructions,
        price: schema.bookings.price,
        status: schema.bookings.status,
        createdAt: schema.bookings.createdAt,
      })
      .from(schema.bookings)
      .innerJoin(schema.services, eq(schema.bookings.serviceId, schema.services.id))
      .where(eq(schema.services.providerId, providerId))
      .orderBy(desc(schema.bookings.createdAt));
    return rows;
  }

  static async getById(id: number) {
    const rows = await db.select().from(schema.bookings).where(eq(schema.bookings.id, id)).limit(1);
    return rows[0] || null;
  }

  static async updateStatus(id: number, status: string) {
    const [updated] = await db
      .update(schema.bookings)
      .set({ status })
      .where(eq(schema.bookings.id, id))
      .returning();
    return updated;
  }
}
