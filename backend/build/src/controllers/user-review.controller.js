"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserReviewController = void 0;
const booking_service_1 = require("../services/booking.service");
const service_service_1 = require("../services/service.service");
const review_service_1 = require("../services/review.service");
class UserReviewController {
    static async create(req, res) {
        try {
            const auth = req.user;
            const { bookingId, rating, comment } = req.body || {};
            const parsedBookingId = Number(bookingId);
            const parsedRating = Number(rating);
            if (!Number.isFinite(parsedBookingId)) {
                res.status(400).json({ success: false, error: "Invalid bookingId" });
                return;
            }
            if (!Number.isFinite(parsedRating) ||
                parsedRating < 1 ||
                parsedRating > 5) {
                res
                    .status(400)
                    .json({ success: false, error: "rating must be between 1 and 5" });
                return;
            }
            const booking = await booking_service_1.BookingService.getById(parsedBookingId);
            if (!booking) {
                res.status(404).json({ success: false, error: "Booking not found" });
                return;
            }
            const service = await service_service_1.ServiceService.getById(booking.serviceId);
            if (!service || service.providerId !== auth.userId) {
                res
                    .status(403)
                    .json({
                    success: false,
                    error: "You can only review customers for your own services",
                });
                return;
            }
            if (booking.status !== "completed") {
                res
                    .status(400)
                    .json({
                    success: false,
                    error: "You can only review completed bookings",
                });
                return;
            }
            const existing = await review_service_1.ReviewService.getByBookingAndTarget(parsedBookingId, "customer");
            if (existing) {
                res
                    .status(409)
                    .json({
                    success: false,
                    error: "Review already exists for this booking",
                });
                return;
            }
            const createdUnified = await review_service_1.ReviewService.create({
                bookingId: booking.id,
                userId: auth.userId,
                serviceId: booking.serviceId,
                providerId: (await service_service_1.ServiceService.getById(booking.serviceId))?.providerId ??
                    null,
                reviewerId: auth.userId,
                revieweeId: booking.userId,
                target: "customer",
                rating: parsedRating,
                comment: comment ? String(comment) : null,
            });
            res.status(201).json({ success: true, data: createdUnified });
        }
        catch (error) {
            res
                .status(500)
                .json({
                success: false,
                error: error.message || "Failed to submit review",
            });
        }
    }
}
exports.UserReviewController = UserReviewController;
//# sourceMappingURL=user-review.controller.js.map