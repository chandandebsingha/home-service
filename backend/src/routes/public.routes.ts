import { Router } from "express";
import { OccupationService } from "../services/occupation.service";

const router = Router();

// Publicly available endpoints (no auth required)
router.get("/occupations", async (_req, res) => {
	try {
		const items = await OccupationService.list();
		res.status(200).json({ success: true, data: items });
	} catch (error: any) {
		res
			.status(500)
			.json({
				success: false,
				error: error?.message || "Failed to fetch occupations",
			});
	}
});

export default router;
