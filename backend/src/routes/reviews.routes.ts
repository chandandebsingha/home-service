import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import {
	validateRequest,
	Validators,
} from "../middleware/validation.middleware";

const router = Router();

router.post(
	"/",
	authenticateToken,
	validateRequest([
		{
			field: "bookingId",
			validator: Validators.isNumber,
			message: "bookingId must be a number",
		},
		{
			field: "rating",
			validator: Validators.isNumber,
			message: "rating must be a number",
		},
		{
			field: "comment",
			validator: Validators.isString,
			message: "comment must be a string",
			optional: true,
		},
	]),
	ReviewController.create
);

export default router;
