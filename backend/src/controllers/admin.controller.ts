import { Request, Response } from 'express';
import { db } from '../db';
import * as schema from '../../drizzle/schema';
import { desc } from 'drizzle-orm';

export class AdminController {
  static async stats(req: Request, res: Response): Promise<void> {
    try {
      const [usersCountRow] = await db.execute<{ count: number }>(`SELECT COUNT(*)::int as count FROM users` as any);
      const [servicesCountRow] = await db.execute<{ count: number }>(`SELECT COUNT(*)::int as count FROM services` as any);
      const [bookingsCountRow] = await db.execute<{ count: number }>(`SELECT COUNT(*)::int as count FROM bookings` as any);

      const recentBookings = await db.select().from(schema.bookings).orderBy(desc(schema.bookings.createdAt)).limit(5);
      const recentServices = await db.select().from(schema.services).orderBy(desc(schema.services.createdAt)).limit(5);

      res.json({
        success: true,
        data: {
          counts: {
            users: (usersCountRow as any)?.count ?? 0,
            services: (servicesCountRow as any)?.count ?? 0,
            bookings: (bookingsCountRow as any)?.count ?? 0,
          },
          recent: {
            bookings: recentBookings,
            services: recentServices,
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to load stats' });
    }
  }
}
