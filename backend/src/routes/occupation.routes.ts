import { Router } from 'express';
import { OccupationController } from '../controllers/occupation.controller';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.middleware';
import { validateRequest, Validators } from '../middleware/validation.middleware';

const router = Router();

// All routes require admin authentication
router.use(authenticateToken);
router.use(authorizeAdmin);

// Occupation management routes
router.get('/', OccupationController.list);
router.get('/:id', OccupationController.getById);

router.post(
  '/',
  validateRequest([
    { field: 'name', validator: Validators.isString, message: 'name must be a string' },
    { field: 'description', validator: Validators.isString, message: 'description must be a string', optional: true },
    { field: 'isActive', validator: Validators.isBoolean, message: 'isActive must be a boolean', optional: true },
  ]),
  OccupationController.create
);

router.put(
  '/:id',
  validateRequest([
    { field: 'name', validator: Validators.isString, message: 'name must be a string' },
    { field: 'description', validator: Validators.isString, message: 'description must be a string', optional: true },
    { field: 'isActive', validator: Validators.isBoolean, message: 'isActive must be a boolean', optional: true },
  ]),
  OccupationController.update
);

router.delete('/:id', OccupationController.delete);

export default router;
