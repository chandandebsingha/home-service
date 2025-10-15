"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderController = void 0;
const service_service_1 = require("../services/service.service");
const booking_service_1 = require("../services/booking.service");
class ProviderController {
    static async getMyServices(req, res) {
        try {
            const user = req.user;
            const services = await service_service_1.ServiceService.listByProvider(user.userId);
            res.status(200).json({ success: true, data: services });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Failed to fetch services' });
        }
    }
    static async createService(req, res) {
        try {
            const user = req.user;
            const body = req.body;
            const created = await service_service_1.ServiceService.create({
                name: body.name,
                description: body.description,
                price: body.price,
                serviceType: body.serviceType,
                categoryId: body.categoryId,
                serviceTypeId: body.serviceTypeId,
                durationMinutes: body.durationMinutes,
                availability: body.availability ?? true,
                timeSlots: body.timeSlots,
                providerId: user.userId,
            });
            res.status(201).json({ success: true, data: created });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Failed to create service' });
        }
    }
    static async updateService(req, res) {
        try {
            const user = req.user;
            const serviceId = parseInt(req.params.id, 10);
            const body = req.body;
            if (Number.isNaN(serviceId)) {
                res.status(400).json({ success: false, error: 'Invalid service ID' });
                return;
            }
            const service = await service_service_1.ServiceService.getById(serviceId);
            if (!service || service.providerId !== user.userId) {
                res.status(404).json({ success: false, error: 'Service not found or not owned by you' });
                return;
            }
            const updated = await service_service_1.ServiceService.update(serviceId, {
                name: body.name,
                description: body.description,
                price: body.price,
                serviceType: body.serviceType,
                categoryId: body.categoryId,
                serviceTypeId: body.serviceTypeId,
                durationMinutes: body.durationMinutes,
                availability: body.availability,
                timeSlots: body.timeSlots,
            });
            res.status(200).json({ success: true, data: updated });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Failed to update service' });
        }
    }
    static async deleteService(req, res) {
        try {
            const user = req.user;
            const serviceId = parseInt(req.params.id, 10);
            if (Number.isNaN(serviceId)) {
                res.status(400).json({ success: false, error: 'Invalid service ID' });
                return;
            }
            const service = await service_service_1.ServiceService.getById(serviceId);
            if (!service || service.providerId !== user.userId) {
                res.status(404).json({ success: false, error: 'Service not found or not owned by you' });
                return;
            }
            await service_service_1.ServiceService.delete(serviceId);
            res.status(200).json({ success: true, message: 'Service deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Failed to delete service' });
        }
    }
    static async getMyBookings(req, res) {
        try {
            const user = req.user;
            const bookings = await booking_service_1.BookingService.listByProvider(user.userId);
            res.status(200).json({ success: true, data: bookings });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Failed to fetch bookings' });
        }
    }
    static async updateBookingStatus(req, res) {
        try {
            const user = req.user;
            const bookingId = parseInt(req.params.id, 10);
            const { status } = req.body;
            if (Number.isNaN(bookingId)) {
                res.status(400).json({ success: false, error: 'Invalid booking ID' });
                return;
            }
            if (!['upcoming', 'completed', 'cancelled'].includes(status)) {
                res.status(400).json({ success: false, error: 'Invalid status. Must be upcoming, completed, or cancelled' });
                return;
            }
            const booking = await booking_service_1.BookingService.getById(bookingId);
            if (!booking) {
                res.status(404).json({ success: false, error: 'Booking not found' });
                return;
            }
            const service = await service_service_1.ServiceService.getById(booking.serviceId);
            if (!service || service.providerId !== user.userId) {
                res.status(403).json({ success: false, error: 'You can only update bookings for your own services' });
                return;
            }
            const updated = await booking_service_1.BookingService.updateStatus(bookingId, status);
            res.status(200).json({ success: true, data: updated });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Failed to update booking status' });
        }
    }
}
exports.ProviderController = ProviderController;
//# sourceMappingURL=provider.controller.js.map