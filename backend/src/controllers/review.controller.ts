import { Request, Response } from "express";
import { ReviewService } from "../services/review.service";
import { BookingService } from "../services/booking.service";
import { ServiceService } from "../services/service.service";

export class ReviewController {
	static async create(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as any).user;
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
			if (booking.userId !== user.userId) {
				res
					.status(403)
					.json({
						success: false,
						error: "Not allowed to review this booking",
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

			const existing = await ReviewService.getByBookingId(parsedBookingId);
			if (existing) {
				res
					.status(409)
					.json({
						success: false,
						error: "Review already exists for this booking",
					});
				return;
			}

			const service = await ServiceService.getById(booking.serviceId);

			const created = await ReviewService.create({
				bookingId: booking.id,
				userId: user.userId,
				serviceId: booking.serviceId,
				providerId: service?.providerId ?? (null as any),
				rating: parsedRating,
				comment: comment ? String(comment) : (null as any),
			} as any);

			res.status(201).json({ success: true, data: created });
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
