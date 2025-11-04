"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const review_service_1 = require("../services/review.service");
const booking_service_1 = require("../services/booking.service");
const service_service_1 = require("../services/service.service");
class ReviewController {
    static async create(req, res) {
        try {
            const user = req.user;
            const { bookingId, rating, comment, target } = req.body || {};
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
            if (booking.status !== "completed") {
                res.status(400).json({
                    success: false,
                    error: "You can only review completed bookings",
                });
                return;
            }
            const reviewTarget = target === "customer" ? "customer" : "provider";
            if (reviewTarget === "provider") {
                if (booking.userId !== user.userId) {
                    res
                        .status(403)
                        .json({
                        success: false,
                        error: "Not allowed to review this booking",
                    });
                    return;
                }
            }
            else {
                const serviceCheck = await service_service_1.ServiceService.getById(booking.serviceId);
                if (!serviceCheck || serviceCheck.providerId !== user.userId) {
                    res
                        .status(403)
                        .json({
                        success: false,
                        error: "You can only review customers for your own services",
                    });
                    return;
                }
            }
            const existing = await review_service_1.ReviewService.getByBookingAndTarget(parsedBookingId, reviewTarget);
            if (existing) {
                res.status(409).json({
                    success: false,
                    error: "Review already exists for this booking",
                });
                return;
            }
            const service = await service_service_1.ServiceService.getById(booking.serviceId);
            const reviewerId = user.userId;
            const revieweeId = reviewTarget === "provider"
                ? service?.providerId
                : booking.userId;
            const created = await review_service_1.ReviewService.create({
                bookingId: booking.id,
                userId: reviewerId,
                serviceId: booking.serviceId,
                providerId: service?.providerId ?? null,
                reviewerId,
                revieweeId: revieweeId,
                target: reviewTarget,
                rating: parsedRating,
                comment: comment ? String(comment) : null,
            });
            res.status(201).json({ success: true, data: created });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || "Failed to submit review",
            });
        }
    }
}
exports.ReviewController = ReviewController;
//# sourceMappingURL=review.controller.js.map