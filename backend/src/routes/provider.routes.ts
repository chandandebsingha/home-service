import { Router } from 'express';
import { ProviderController } from '../controllers/provider.controller';
import { ProviderProfileController } from '../controllers/provider-profile.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest, Validators } from '../middleware/validation.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Service management routes
router.get('/services', ProviderController.getMyServices);

router.post(
  '/services',
  validateRequest([
    { field: 'name', validator: Validators.isString, message: 'name must be a string' },
    { field: 'price', validator: Validators.isNumber, message: 'price must be a number' },
    { field: 'description', validator: Validators.isString, message: 'description must be a string', optional: true },
    { field: 'serviceType', validator: Validators.isString, message: 'serviceType must be a string', optional: true },
    { field: 'categoryId', validator: Validators.isNumber, message: 'categoryId must be a number', optional: true },
    { field: 'serviceTypeId', validator: Validators.isNumber, message: 'serviceTypeId must be a number', optional: true },
    { field: 'durationMinutes', validator: Validators.isNumber, message: 'durationMinutes must be a number', optional: true },
    { field: 'availability', validator: Validators.isBoolean, message: 'availability must be a boolean', optional: true },
    { field: 'timeSlots', validator: Validators.isString, message: 'timeSlots must be a string', optional: true },
  ]),
  ProviderController.createService
);

router.put(
  '/services/:id',
  validateRequest([
    { field: 'name', validator: Validators.isString, message: 'name must be a string' },
    { field: 'price', validator: Validators.isNumber, message: 'price must be a number' },
    { field: 'description', validator: Validators.isString, message: 'description must be a string', optional: true },
    { field: 'serviceType', validator: Validators.isString, message: 'serviceType must be a string', optional: true },
    { field: 'categoryId', validator: Validators.isNumber, message: 'categoryId must be a number', optional: true },
    { field: 'serviceTypeId', validator: Validators.isNumber, message: 'serviceTypeId must be a number', optional: true },
    { field: 'durationMinutes', validator: Validators.isNumber, message: 'durationMinutes must be a number', optional: true },
    { field: 'availability', validator: Validators.isBoolean, message: 'availability must be a boolean', optional: true },
    { field: 'timeSlots', validator: Validators.isString, message: 'timeSlots must be a string', optional: true },
  ]),
  ProviderController.updateService
);

router.delete('/services/:id', ProviderController.deleteService);

// Booking management routes
router.get('/bookings', ProviderController.getMyBookings);

router.put(
  '/bookings/:id/status',
  validateRequest([
    { field: 'status', validator: Validators.isString, message: 'status must be a string' },
  ]),
  ProviderController.updateBookingStatus
);

// Provider profile routes
router.post(
  '/profile',
  validateRequest([
    { field: 'occupationId', validator: Validators.isNumber, message: 'occupationId must be a number', optional: true },
    { field: 'businessName', validator: Validators.isString, message: 'businessName must be a string', optional: true },
    { field: 'businessAddress', validator: Validators.isString, message: 'businessAddress must be a string', optional: true },
    { field: 'phoneNumber', validator: Validators.isString, message: 'phoneNumber must be a string', optional: true },
    { field: 'experience', validator: Validators.isString, message: 'experience must be a string', optional: true },
    { field: 'bio', validator: Validators.isString, message: 'bio must be a string', optional: true },
  ]),
  ProviderProfileController.create
);

router.get('/profile', ProviderProfileController.getMyProfile);

router.put(
  '/profile',
  validateRequest([
    { field: 'occupationId', validator: Validators.isNumber, message: 'occupationId must be a number', optional: true },
    { field: 'businessName', validator: Validators.isString, message: 'businessName must be a string', optional: true },
    { field: 'businessAddress', validator: Validators.isString, message: 'businessAddress must be a string', optional: true },
    { field: 'phoneNumber', validator: Validators.isString, message: 'phoneNumber must be a string', optional: true },
    { field: 'experience', validator: Validators.isString, message: 'experience must be a string', optional: true },
    { field: 'bio', validator: Validators.isString, message: 'bio must be a string', optional: true },
  ]),
  ProviderProfileController.update
);

export default router;
