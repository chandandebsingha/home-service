"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const validators_1 = require("../utils/validators");
const router = (0, express_1.Router)();
router.post("/register", (0, validation_middleware_1.validateRequest)(validators_1.registerSchema), auth_controller_1.AuthController.register);
router.post("/login", (0, validation_middleware_1.validateRequest)(validators_1.loginSchema), auth_controller_1.AuthController.login);
router.post("/verify-email-otp", (0, validation_middleware_1.validateRequest)(validators_1.verifyEmailOtpSchema), auth_controller_1.AuthController.verifyEmailOtp);
router.post("/resend-email-otp", (0, validation_middleware_1.validateRequest)(validators_1.resendEmailOtpSchema), auth_controller_1.AuthController.resendEmailOtp);
router.post("/logout", auth_middleware_1.authenticateToken, auth_controller_1.AuthController.logout);
router.get("/profile", auth_middleware_1.authenticateToken, auth_controller_1.AuthController.getProfile);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map