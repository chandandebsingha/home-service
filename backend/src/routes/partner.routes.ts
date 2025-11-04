import { Router } from "express";
import { PartnerController } from "../controllers/partner.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import {
	validateRequest,
	Validators,
} from "../middleware/validation.middleware";

const router = Router();

// All partner routes require authentication
router.use(authenticateToken);

// Get bookings for the authenticated partner
router.get("/bookings", PartnerController.getBookings);

// Update booking status for partner-owned services
router.put(
	"/bookings/:id/status",
	validateRequest([
		{
			field: "status",
			validator: Validators.isString,
			message: "status must be a string",
		},
	]),
	PartnerController.updateBookingStatus
);

// Initiate booking completion (send OTP to booking's user)
router.post(
	"/bookings/:id/complete-otp",
	PartnerController.requestCompletionOtp
);

// Verify OTP and complete the booking
router.post(
	"/bookings/:id/complete-verify",
	PartnerController.verifyCompletionOtp
);

export default router;
