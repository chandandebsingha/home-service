import { Request, Response } from "express";
import { BookingService } from "../services/booking.service";
import { ServiceService } from "../services/service.service";
import { ReviewService } from "../services/review.service";

export class UserReviewController {
	static async create(req: Request, res: Response): Promise<void> {
		try {
			const auth = (req as any).user; // provider
			const { bookingId, rating, comment } = req.body || {};

			const parsedBookingId = Number(bookingId);
			const parsedRating = Number(rating);
			if (!Number.isFinite(parsedBookingId)) {
				res.status(400).json({ success: false, error: "Invalid bookingId" });
				return;
			}
			if (
				!Number.isFinite(parsedRating) ||
				parsedRating < 1 ||
				parsedRating > 5
			) {
				res
					.status(400)
					.json({ success: false, error: "rating must be between 1 and 5" });
				return;
			}

			const booking = await BookingService.getById(parsedBookingId);
			if (!booking) {
				res.status(404).json({ success: false, error: "Booking not found" });
				return;
			}

			// Check that the authenticated provider owns the service
			const service = await ServiceService.getById(booking.serviceId);
			if (!service || (service as any).providerId !== auth.userId) {
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

			// Ensure no duplicate review for this booking & target
			const existing = await ReviewService.getByBookingAndTarget(
				parsedBookingId,
				"customer"
			);
			if (existing) {
				res
					.status(409)
					.json({
						success: false,
						error: "Review already exists for this booking",
					});
				return;
			}

			// Write into unified reviews table
			const createdUnified = await ReviewService.create({
				bookingId: booking.id,
				userId: auth.userId, // legacy
				serviceId: booking.serviceId,
				providerId:
					(await ServiceService.getById(booking.serviceId))?.providerId ??
					(null as any),
				reviewerId: auth.userId,
				revieweeId: booking.userId,
				target: "customer" as any,
				rating: parsedRating,
				comment: comment ? String(comment) : (null as any),
			} as any);
			res.status(201).json({ success: true, data: createdUnified });
		} catch (error: any) {
			res
				.status(500)
				.json({
					success: false,
					error: error.message || "Failed to submit review",
				});
		}
	}
}
