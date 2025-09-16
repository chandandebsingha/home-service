import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validateRequest, Validators } from '../middleware/validation.middleware';

const router = Router();

router.get('/me', authenticateToken, BookingController.listMine);

router.post(
  '/',
  authenticateToken,
  validateRequest([
    { field: 'serviceId', validator: Validators.isNumber, message: 'serviceId must be a number' },
    { field: 'date', validator: Validators.isString, message: 'date must be a string' },
    { field: 'time', validator: Validators.isString, message: 'time must be a string' },
    { field: 'address', validator: Validators.isString, message: 'address must be a string' },
    { field: 'specialInstructions', validator: Validators.isString, message: 'specialInstructions must be a string', optional: true },
    { field: 'price', validator: Validators.isNumber, message: 'price must be a number' },
  ]),
  BookingController.create
);

export default router;
