import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/stats', authenticateToken, authorizeAdmin, AdminController.stats);

export default router;
