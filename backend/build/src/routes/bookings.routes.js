"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const booking_controller_1 = require("../controllers/booking.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
router.get('/me', auth_middleware_1.authenticateToken, booking_controller_1.BookingController.listMine);
router.post('/', auth_middleware_1.authenticateToken, (0, validation_middleware_1.validateRequest)([
    { field: 'serviceId', validator: validation_middleware_1.Validators.isNumber, message: 'serviceId must be a number' },
    { field: 'date', validator: validation_middleware_1.Validators.isString, message: 'date must be a string' },
    { field: 'time', validator: validation_middleware_1.Validators.isString, message: 'time must be a string' },
    { field: 'address', validator: validation_middleware_1.Validators.isString, message: 'address must be a string' },
    { field: 'specialInstructions', validator: validation_middleware_1.Validators.isString, message: 'specialInstructions must be a string', optional: true },
    { field: 'price', validator: validation_middleware_1.Validators.isNumber, message: 'price must be a number' },
]), booking_controller_1.BookingController.create);
exports.default = router;
//# sourceMappingURL=bookings.routes.js.map