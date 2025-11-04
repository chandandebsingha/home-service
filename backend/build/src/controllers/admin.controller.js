"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const db_1 = require("../db");
class AdminController {
    static async stats(req, res) {
        try {
            const [usersCountRow] = await db_1.db.execute(`SELECT COUNT(*)::int as count FROM users`);
            const [servicesCountRow] = await db_1.db.execute(`SELECT COUNT(*)::int as count FROM services`);
            const [bookingsCountRow] = await db_1.db.execute(`SELECT COUNT(*)::int as count FROM bookings`);
            const recentBookings = await db_1.db.execute(`SELECT id, date, time, price, created_at as "createdAt" FROM bookings ORDER BY created_at DESC LIMIT 5`);
            const recentServices = await db_1.db.execute(`SELECT id, name, price, service_type as "serviceType", created_at as "createdAt" FROM services ORDER BY created_at DESC LIMIT 5`);
            res.json({
                success: true,
                data: {
                    counts: {
                        users: usersCountRow?.count ?? 0,
                        services: servicesCountRow?.count ?? 0,
                        bookings: bookingsCountRow?.count ?? 0,
                    },
                    recent: {
                        bookings: recentBookings,
                        services: recentServices,
                    },
                },
            });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Failed to load stats' });
        }
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=admin.controller.js.map