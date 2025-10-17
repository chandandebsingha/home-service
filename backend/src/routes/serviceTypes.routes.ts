import { Router } from "express";
import ServiceTypesController from "../controllers/serviceTypes.controller";

const router = Router();

// GET /api/service-types/:id/services
router.get("/:id/services", ServiceTypesController.servicesByType);

export default router;
