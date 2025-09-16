import { Router } from 'express';
import { ServicesController } from '../controllers/services.controller';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.middleware';
import { validateRequest, Validators } from '../middleware/validation.middleware';

const router = Router();

// Public endpoints
router.get('/', ServicesController.list);
router.get('/:id', ServicesController.getById);

// Admin-only endpoints
router.post(
  '/',
  authenticateToken,
  authorizeAdmin,
  validateRequest([
    { field: 'name', validator: Validators.isString, message: 'name must be a string' },
    { field: 'price', validator: Validators.isNumber, message: 'price must be a number' },
    { field: 'description', validator: Validators.isString, message: 'description must be a string', optional: true },
    { field: 'serviceType', validator: Validators.isString, message: 'serviceType must be a string', optional: true },
    { field: 'durationMinutes', validator: Validators.isNumber, message: 'durationMinutes must be a number', optional: true },
    { field: 'availability', validator: Validators.isBoolean, message: 'availability must be a boolean', optional: true },
    { field: 'timeSlots', validator: Validators.isString, message: 'timeSlots must be a string', optional: true },
  ]),
  ServicesController.create
);

export default router;
