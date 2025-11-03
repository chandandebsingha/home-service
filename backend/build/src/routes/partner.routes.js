"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const partner_controller_1 = require("../controllers/partner.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
router.get("/bookings", partner_controller_1.PartnerController.getBookings);
router.put("/bookings/:id/status", (0, validation_middleware_1.validateRequest)([
    {
        field: "status",
        validator: validation_middleware_1.Validators.isString,
        message: "status must be a string",
    },
]), partner_controller_1.PartnerController.updateBookingStatus);
router.post("/bookings/:id/complete-otp", partner_controller_1.PartnerController.requestCompletionOtp);
router.post("/bookings/:id/complete-verify", (0, validation_middleware_1.validateRequest)([
    {
        field: "otp",
        validator: validation_middleware_1.Validators.minLength(4),
        message: "otp must be at least 4 characters",
    },
]), partner_controller_1.PartnerController.verifyCompletionOtp);
exports.default = router;
//# sourceMappingURL=partner.routes.js.map