import { Request, Response } from "express";
import { ServiceService } from "../services/service.service";
import { BookingService } from "../services/booking.service";
import { ReviewService } from "../services/review.service";

export class ProviderController {
	// Get all services created by the provider
	static async getMyServices(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as any).user;
			const services = await ServiceService.listByProvider(user.userId);
			res.status(200).json({ success: true, data: services });
		} catch (error: any) {
			res
				.status(500)
				.json({
					success: false,
					error: error.message || "Failed to fetch services",
				});
		}
	}

	// Create a new service for the provider
	static async createService(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as any).user;
			const body = req.body;

			const created = await ServiceService.create({
				name: body.name,
				description: body.description,
				price: body.price,
				serviceType: body.serviceType,
				categoryId: body.categoryId,
				serviceTypeId: body.serviceTypeId,
				durationMinutes: body.durationMinutes,
				availability: body.availability ?? true,
				timeSlots: body.timeSlots,
				providerId: user.userId, // Associate with the provider
			});
			res.status(201).json({ success: true, data: created });
		} catch (error: any) {
			res
				.status(500)
				.json({
					success: false,
					error: error.message || "Failed to create service",
				});
		}
	}

	// Update a service owned by the provider
	static async updateService(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as any).user;
			const serviceId = parseInt(req.params.id, 10);
			const body = req.body;

			if (Number.isNaN(serviceId)) {
				res.status(400).json({ success: false, error: "Invalid service ID" });
				return;
			}

			// Check if service belongs to provider
			const service = await ServiceService.getById(serviceId);
			if (!service || (service as any).providerId !== user.userId) {
				res
					.status(404)
					.json({
						success: false,
						error: "Service not found or not owned by you",
					});
				return;
			}

			const updated = await ServiceService.update(serviceId, {
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
		} catch (error: any) {
			res
				.status(500)
				.json({
					success: false,
					error: error.message || "Failed to update service",
				});
		}
	}

	// Delete a service owned by the provider
	static async deleteService(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as any).user;
			const serviceId = parseInt(req.params.id, 10);

			if (Number.isNaN(serviceId)) {
				res.status(400).json({ success: false, error: "Invalid service ID" });
				return;
			}

			// Check if service belongs to provider
			const service = await ServiceService.getById(serviceId);
			if (!service || (service as any).providerId !== user.userId) {
				res
					.status(404)
					.json({
						success: false,
						error: "Service not found or not owned by you",
					});
				return;
			}

			await ServiceService.delete(serviceId);
			res
				.status(200)
				.json({ success: true, message: "Service deleted successfully" });
		} catch (error: any) {
			res
				.status(500)
				.json({
					success: false,
					error: error.message || "Failed to delete service",
				});
		}
	}

	// Get bookings for services owned by the provider
	static async getMyBookings(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as any).user;
			const bookings = await BookingService.listByProvider(user.userId);
			res.status(200).json({ success: true, data: bookings });
		} catch (error: any) {
			res
				.status(500)
				.json({
					success: false,
					error: error.message || "Failed to fetch bookings",
				});
		}
	}

	// Update booking status (complete, cancel)
	static async updateBookingStatus(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as any).user;
			const bookingId = parseInt(req.params.id, 10);
			const { status } = req.body;

			if (Number.isNaN(bookingId)) {
				res.status(400).json({ success: false, error: "Invalid booking ID" });
				return;
			}

			if (!["upcoming", "completed", "cancelled"].includes(status)) {
				res
					.status(400)
					.json({
						success: false,
						error: "Invalid status. Must be upcoming, completed, or cancelled",
					});
				return;
			}

			// Check if booking is for a service owned by the provider
			const booking = await BookingService.getById(bookingId);
			if (!booking) {
				res.status(404).json({ success: false, error: "Booking not found" });
				return;
			}

			// Get the service to check ownership
			const service = await ServiceService.getById(booking.serviceId);
			if (!service || (service as any).providerId !== user.userId) {
				res
					.status(403)
					.json({
						success: false,
						error: "You can only update bookings for your own services",
					});
				return;
			}

			const updated = await BookingService.updateStatus(bookingId, status);
			res.status(200).json({ success: true, data: updated });
		} catch (error: any) {
			res
				.status(500)
				.json({
					success: false,
					error: error.message || "Failed to update booking status",
				});
		}
	}

	// Get provider's rating summary (average rating and total ratings)
	static async getMyRatingSummary(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as any).user;
			const summary = await ReviewService.averageForProvider(user.userId);
			res.status(200).json({ success: true, data: summary });
		} catch (error: any) {
			res
				.status(500)
				.json({
					success: false,
					error: error.message || "Failed to fetch rating summary",
				});
		}
	}
}
