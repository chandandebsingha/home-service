import { Router } from "express";
import { AuthController } from "../controllers/auth/auth.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validation.middleware";
import {
	loginSchema,
	registerSchema,
	verifyEmailOtpSchema,
	resendEmailOtpSchema,
} from "../utils/validators";

const router = Router();

// Public routes
router.post(
	"/register",
	validateRequest(registerSchema),
	AuthController.register
);
router.post("/login", validateRequest(loginSchema), AuthController.login);
router.post(
	"/verify-email-otp",
	validateRequest(verifyEmailOtpSchema),
	AuthController.verifyEmailOtp
);
router.post(
	"/resend-email-otp",
	validateRequest(resendEmailOtpSchema),
	AuthController.resendEmailOtp
);

// Protected routes
router.post("/logout", authenticateToken, AuthController.logout);
router.get("/profile", authenticateToken, AuthController.getProfile);

export default router;
