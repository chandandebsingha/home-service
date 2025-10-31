import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import {
	authenticateToken,
	authorizeAdmin,
} from "../middleware/auth.middleware";
import { ProviderProfileController } from "../controllers/provider-profile.controller";

const router = Router();

router.get("/stats", authenticateToken, authorizeAdmin, AdminController.stats);

// Provider verification workflows
router.get(
	"/provider-profiles",
	authenticateToken,
	authorizeAdmin,
	ProviderProfileController.getAll
);

router.patch(
	"/provider-profiles/:id/verify",
	authenticateToken,
	authorizeAdmin,
	ProviderProfileController.verify
);

export default router;
