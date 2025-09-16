"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const services_controller_1 = require("../controllers/services.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
router.get('/', services_controller_1.ServicesController.list);
router.post('/', auth_middleware_1.authenticateToken, auth_middleware_1.authorizeAdmin, (0, validation_middleware_1.validateRequest)([
    { field: 'name', validator: validation_middleware_1.Validators.isString, message: 'name must be a string' },
    { field: 'price', validator: validation_middleware_1.Validators.isNumber, message: 'price must be a number' },
    { field: 'description', validator: validation_middleware_1.Validators.isString, message: 'description must be a string', optional: true },
    { field: 'serviceType', validator: validation_middleware_1.Validators.isString, message: 'serviceType must be a string', optional: true },
    { field: 'durationMinutes', validator: validation_middleware_1.Validators.isNumber, message: 'durationMinutes must be a number', optional: true },
    { field: 'availability', validator: validation_middleware_1.Validators.isBoolean, message: 'availability must be a boolean', optional: true },
    { field: 'timeSlots', validator: validation_middleware_1.Validators.isString, message: 'timeSlots must be a string', optional: true },
]), services_controller_1.ServicesController.create);
exports.default = router;
//# sourceMappingURL=services.routes.js.map