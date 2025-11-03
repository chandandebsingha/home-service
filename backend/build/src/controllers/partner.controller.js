"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartnerController = void 0;
const booking_service_1 = require("../services/booking.service");
const service_service_1 = require("../services/service.service");
const db_1 = require("../db");
const schema_1 = require("../../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const email_verification_service_1 = require("../services/email-verification.service");
class PartnerController {
    static async getBookings(req, res) {
        try {
            const user = req.user;
            if (!user || user.role !== "partner") {
                res
                    .status(403)
                    .json({ success: false, error: "Partner privileges required" });
                return;
            }
            const bookings = await booking_service_1.BookingService.listByProvider(user.userId);
            res.status(200).json({ success: true, data: bookings });
        }
        catch (error) {
            const message = error instanceof Error
                ? error.message
                : "Failed to fetch partner bookings";
            res.status(500).json({ success: false, error: message });
        }
    }
    static async updateBookingStatus(req, res) {
        try {
            const user = req.user;
            if (!user || user.role !== "partner") {
                res
                    .status(403)
                    .json({ success: false, error: "Partner privileges required" });
                return;
            }
            const bookingId = parseInt(req.params.id, 10);
            const { status } = req.body;
            if (Number.isNaN(bookingId)) {
                res.status(400).json({ success: false, error: "Invalid booking ID" });
                return;
            }
            if (!["upcoming", "completed", "cancelled"].includes(String(status))) {
                res.status(400).json({
                    success: false,
                    error: "Invalid status. Must be upcoming, completed, or cancelled",
                });
                return;
            }
            const booking = await booking_service_1.BookingService.getById(bookingId);
            if (!booking) {
                res.status(404).json({ success: false, error: "Booking not found" });
                return;
            }
            const service = await service_service_1.ServiceService.getById(booking.serviceId);
            if (!service || service.providerId !== user.userId) {
                res.status(403).json({
                    success: false,
                    error: "You can only update bookings for your own services",
                });
                return;
            }
            const updated = await booking_service_1.BookingService.updateStatus(bookingId, String(status));
            res.status(200).json({ success: true, data: updated });
        }
        catch (error) {
            const message = error instanceof Error
                ? error.message
                : "Failed to update booking status";
            res.status(500).json({ success: false, error: message });
        }
    }
    static async requestCompletionOtp(req, res) {
        try {
            const user = req.user;
            if (!user || user.role !== "partner") {
                res
                    .status(403)
                    .json({ success: false, error: "Partner privileges required" });
                return;
            }
            const bookingId = parseInt(req.params.id, 10);
            if (Number.isNaN(bookingId)) {
                res.status(400).json({ success: false, error: "Invalid booking ID" });
                return;
            }
            const booking = await booking_service_1.BookingService.getById(bookingId);
            if (!booking) {
                res.status(404).json({ success: false, error: "Booking not found" });
                return;
            }
            const service = await service_service_1.ServiceService.getById(booking.serviceId);
            if (!service || service.providerId !== user.userId) {
                res
                    .status(403)
                    .json({
                    success: false,
                    error: "You can only operate on your own bookings",
                });
                return;
            }
            const targetUser = await db_1.db.query.users.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.users.id, booking.userId),
            });
            if (!targetUser) {
                res.status(404).json({ success: false, error: "Customer not found" });
                return;
            }
            await email_verification_service_1.EmailVerificationService.createAndSend(targetUser);
            res.status(200).json({ success: true, message: "OTP sent" });
        }
        catch (error) {
            const message = error instanceof Error
                ? error.message
                : "Failed to initiate completion OTP";
            res.status(500).json({ success: false, error: message });
        }
    }
    static async verifyCompletionOtp(req, res) {
        try {
            const user = req.user;
            if (!user || user.role !== "partner") {
                res
                    .status(403)
                    .json({ success: false, error: "Partner privileges required" });
                return;
            }
            const bookingId = parseInt(req.params.id, 10);
            const { otp } = req.body;
            if (Number.isNaN(bookingId)) {
                res.status(400).json({ success: false, error: "Invalid booking ID" });
                return;
            }
            if (!otp) {
                res.status(400).json({ success: false, error: "otp is required" });
                return;
            }
            const booking = await booking_service_1.BookingService.getById(bookingId);
            if (!booking) {
                res.status(404).json({ success: false, error: "Booking not found" });
                return;
            }
            const service = await service_service_1.ServiceService.getById(booking.serviceId);
            if (!service || service.providerId !== user.userId) {
                res
                    .status(403)
                    .json({
                    success: false,
                    error: "You can only operate on your own bookings",
                });
                return;
            }
            const targetUser = await db_1.db.query.users.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.users.id, booking.userId),
            });
            if (!targetUser) {
                res.status(404).json({ success: false, error: "Customer not found" });
                return;
            }
            await email_verification_service_1.EmailVerificationService.verify(targetUser.email, String(otp));
            const updated = await booking_service_1.BookingService.updateStatus(bookingId, "completed");
            res.status(200).json({ success: true, data: updated });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Failed to verify OTP";
            res.status(500).json({ success: false, error: message });
        }
    }
}
exports.PartnerController = PartnerController;
//# sourceMappingURL=partner.controller.js.map