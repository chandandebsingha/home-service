"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingController = void 0;
const booking_service_1 = require("../services/booking.service");
class BookingController {
    static async create(req, res) {
        try {
            const user = req.user;
            const body = req.body;
            if (!Number.isFinite(Number(body.serviceId))) {
                res.status(400).json({ success: false, error: 'Invalid serviceId' });
                return;
            }
            const exists = await booking_service_1.BookingService.ensureServiceExists(Number(body.serviceId));
            if (!exists) {
                res.status(404).json({ success: false, error: 'Service not found' });
                return;
            }
            const created = await booking_service_1.BookingService.create({
                userId: user.userId,
                serviceId: Number(body.serviceId),
                date: String(body.date || ''),
                time: String(body.time || ''),
                address: String(body.address || ''),
                specialInstructions: body.specialInstructions ? String(body.specialInstructions) : null,
                price: Number(body.price || 0),
                status: 'upcoming',
            });
            res.status(201).json({ success: true, data: created });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Failed to create booking' });
        }
    }
    static async listMine(req, res) {
        try {
            const user = req.user;
            const rows = await booking_service_1.BookingService.listByUser(user.userId);
            res.status(200).json({ success: true, data: rows });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Failed to fetch bookings' });
        }
    }
}
exports.BookingController = BookingController;
//# sourceMappingURL=booking.controller.js.map