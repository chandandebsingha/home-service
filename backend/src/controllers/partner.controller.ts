import { Request, Response } from "express";
import { BookingService } from "../services/booking.service";
import { ServiceService } from "../services/service.service";
import { JwtPayload } from "../types/auth.types";
import { db } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
// OTP-based booking completion removed

export class PartnerController {
	// List bookings for services owned by the partner
	static async getBookings(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as any).user as JwtPayload | undefined;

			// ensure user has partner role
			if (!user || user.role !== "partner") {
				res
					.status(403)
					.json({ success: false, error: "Partner privileges required" });
				return;
			}

			const bookings = await BookingService.listByProvider(user.userId);
			res.status(200).json({ success: true, data: bookings });
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Failed to fetch partner bookings";
			res.status(500).json({ success: false, error: message });
		}
	}

	// Update booking status for services owned by the partner
	static async updateBookingStatus(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as any).user as JwtPayload | undefined;

			// ensure user has partner role
			if (!user || user.role !== "partner") {
				res
					.status(403)
					.json({ success: false, error: "Partner privileges required" });
				return;
			}

			const bookingId = parseInt(req.params.id, 10);
			const { status } = req.body as { status?: string };

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

			const booking = await BookingService.getById(bookingId);
			if (!booking) {
				res.status(404).json({ success: false, error: "Booking not found" });
				return;
			}

			// ensure the booking belongs to a service owned by this partner
			const service = await ServiceService.getById(booking.serviceId);
			if (!service || (service as any).providerId !== user.userId) {
				res.status(403).json({
					success: false,
					error: "You can only update bookings for your own services",
				});
				return;
			}

			const updated = await BookingService.updateStatus(
				bookingId,
				String(status)
			);
			res.status(200).json({ success: true, data: updated });
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Failed to update booking status";
			res.status(500).json({ success: false, error: message });
		}
	}

	// Previously sent OTP to the booking owner's email; now a no-op for backward compatibility
	static async requestCompletionOtp(
		req: Request,
		res: Response
	): Promise<void> {
		try {
			const user = (req as any).user as JwtPayload | undefined;
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

			const booking = await BookingService.getById(bookingId);
			if (!booking) {
				res.status(404).json({ success: false, error: "Booking not found" });
				return;
			}

			// ensure booking belongs to this partner's service
			const service = await ServiceService.getById(booking.serviceId);
			if (!service || (service as any).providerId !== user.userId) {
				res
					.status(403)
					.json({
						success: false,
						error: "You can only operate on your own bookings",
					});
				return;
			}

			const targetUser = await db.query.users.findFirst({
				where: eq(users.id, booking.userId),
			});
			if (!targetUser) {
				res.status(404).json({ success: false, error: "Customer not found" });
				return;
			}

			// No OTP is sent anymore
			res
				.status(200)
				.json({ success: true, message: "OTP-based confirmation disabled" });
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: "Failed to initiate completion OTP";
			res.status(500).json({ success: false, error: message });
		}
	}

	// Directly mark booking completed without OTP
	static async verifyCompletionOtp(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as any).user as JwtPayload | undefined;
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

			const booking = await BookingService.getById(bookingId);
			if (!booking) {
				res.status(404).json({ success: false, error: "Booking not found" });
				return;
			}

			// ensure booking belongs to this partner's service
			const service = await ServiceService.getById(booking.serviceId);
			if (!service || (service as any).providerId !== user.userId) {
				res
					.status(403)
					.json({
						success: false,
						error: "You can only operate on your own bookings",
					});
				return;
			}

			const targetUser = await db.query.users.findFirst({
				where: eq(users.id, booking.userId),
			});
			if (!targetUser) {
				res.status(404).json({ success: false, error: "Customer not found" });
				return;
			}

			const updated = await BookingService.updateStatus(bookingId, "completed");
			res.status(200).json({ success: true, data: updated });
		} catch (error) {
			const message =
				error instanceof Error ? error.message : "Failed to verify OTP";
			res.status(500).json({ success: false, error: message });
		}
	}
}
