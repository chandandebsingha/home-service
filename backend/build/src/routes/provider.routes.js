"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const provider_controller_1 = require("../controllers/provider.controller");
const provider_profile_controller_1 = require("../controllers/provider-profile.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
router.get('/services', provider_controller_1.ProviderController.getMyServices);
router.post('/services', (0, validation_middleware_1.validateRequest)([
    { field: 'name', validator: validation_middleware_1.Validators.isString, message: 'name must be a string' },
    { field: 'price', validator: validation_middleware_1.Validators.isNumber, message: 'price must be a number' },
    { field: 'description', validator: validation_middleware_1.Validators.isString, message: 'description must be a string', optional: true },
    { field: 'serviceType', validator: validation_middleware_1.Validators.isString, message: 'serviceType must be a string', optional: true },
    { field: 'categoryId', validator: validation_middleware_1.Validators.isNumber, message: 'categoryId must be a number', optional: true },
    { field: 'serviceTypeId', validator: validation_middleware_1.Validators.isNumber, message: 'serviceTypeId must be a number', optional: true },
    { field: 'durationMinutes', validator: validation_middleware_1.Validators.isNumber, message: 'durationMinutes must be a number', optional: true },
    { field: 'availability', validator: validation_middleware_1.Validators.isBoolean, message: 'availability must be a boolean', optional: true },
    { field: 'timeSlots', validator: validation_middleware_1.Validators.isString, message: 'timeSlots must be a string', optional: true },
]), provider_controller_1.ProviderController.createService);
router.put('/services/:id', (0, validation_middleware_1.validateRequest)([
    { field: 'name', validator: validation_middleware_1.Validators.isString, message: 'name must be a string' },
    { field: 'price', validator: validation_middleware_1.Validators.isNumber, message: 'price must be a number' },
    { field: 'description', validator: validation_middleware_1.Validators.isString, message: 'description must be a string', optional: true },
    { field: 'serviceType', validator: validation_middleware_1.Validators.isString, message: 'serviceType must be a string', optional: true },
    { field: 'categoryId', validator: validation_middleware_1.Validators.isNumber, message: 'categoryId must be a number', optional: true },
    { field: 'serviceTypeId', validator: validation_middleware_1.Validators.isNumber, message: 'serviceTypeId must be a number', optional: true },
    { field: 'durationMinutes', validator: validation_middleware_1.Validators.isNumber, message: 'durationMinutes must be a number', optional: true },
    { field: 'availability', validator: validation_middleware_1.Validators.isBoolean, message: 'availability must be a boolean', optional: true },
    { field: 'timeSlots', validator: validation_middleware_1.Validators.isString, message: 'timeSlots must be a string', optional: true },
]), provider_controller_1.ProviderController.updateService);
router.delete('/services/:id', provider_controller_1.ProviderController.deleteService);
router.get('/bookings', provider_controller_1.ProviderController.getMyBookings);
router.put('/bookings/:id/status', (0, validation_middleware_1.validateRequest)([
    { field: 'status', validator: validation_middleware_1.Validators.isString, message: 'status must be a string' },
]), provider_controller_1.ProviderController.updateBookingStatus);
router.post('/profile', (0, validation_middleware_1.validateRequest)([
    { field: 'occupationId', validator: validation_middleware_1.Validators.isNumber, message: 'occupationId must be a number' },
    { field: 'businessName', validator: validation_middleware_1.Validators.isString, message: 'businessName must be a string', optional: true },
    { field: 'businessAddress', validator: validation_middleware_1.Validators.isString, message: 'businessAddress must be a string', optional: true },
    { field: 'phoneNumber', validator: validation_middleware_1.Validators.isString, message: 'phoneNumber must be a string', optional: true },
    { field: 'experience', validator: validation_middleware_1.Validators.isString, message: 'experience must be a string', optional: true },
    { field: 'bio', validator: validation_middleware_1.Validators.isString, message: 'bio must be a string', optional: true },
]), provider_profile_controller_1.ProviderProfileController.create);
router.get('/profile', provider_profile_controller_1.ProviderProfileController.getMyProfile);
router.put('/profile', (0, validation_middleware_1.validateRequest)([
    { field: 'occupationId', validator: validation_middleware_1.Validators.isNumber, message: 'occupationId must be a number', optional: true },
    { field: 'businessName', validator: validation_middleware_1.Validators.isString, message: 'businessName must be a string', optional: true },
    { field: 'businessAddress', validator: validation_middleware_1.Validators.isString, message: 'businessAddress must be a string', optional: true },
    { field: 'phoneNumber', validator: validation_middleware_1.Validators.isString, message: 'phoneNumber must be a string', optional: true },
    { field: 'experience', validator: validation_middleware_1.Validators.isString, message: 'experience must be a string', optional: true },
    { field: 'bio', validator: validation_middleware_1.Validators.isString, message: 'bio must be a string', optional: true },
]), provider_profile_controller_1.ProviderProfileController.update);
exports.default = router;
//# sourceMappingURL=provider.routes.js.map