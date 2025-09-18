import { Request, Response } from 'express';
import { db } from '../db';
// import * as schema from '../../drizzle/schema';
// import { desc } from 'drizzle-orm';

export class AdminController {
  static async stats(req: Request, res: Response): Promise<void> {
    try {
      const [usersCountRow] = await db.execute<{ count: number }>(`SELECT COUNT(*)::int as count FROM users` as any);
      const [servicesCountRow] = await db.execute<{ count: number }>(`SELECT COUNT(*)::int as count FROM services` as any);
      const [bookingsCountRow] = await db.execute<{ count: number }>(`SELECT COUNT(*)::int as count FROM bookings` as any);

      // Use raw SQL to avoid issues with drizzle table symbols in some runtimes
      const recentBookings = await db.execute<any>(
        `SELECT id, date, time, price, created_at as "createdAt" FROM bookings ORDER BY created_at DESC LIMIT 5` as any
      );
      const recentServices = await db.execute<any>(
        `SELECT id, name, price, service_type as "serviceType", created_at as "createdAt" FROM services ORDER BY created_at DESC LIMIT 5` as any
      );

      res.json({
        success: true,
        data: {
          counts: {
            users: (usersCountRow as any)?.count ?? 0,
            services: (servicesCountRow as any)?.count ?? 0,
            bookings: (bookingsCountRow as any)?.count ?? 0,
          },
          recent: {
            bookings: recentBookings as any,
            services: recentServices as any,
          },
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Failed to load stats' });
    }
  }
}
