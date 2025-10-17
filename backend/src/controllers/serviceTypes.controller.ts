import { Request, Response } from "express";
import { ServiceService } from "../services/service.service";

export class ServiceTypesController {
	static async servicesByType(req: Request, res: Response): Promise<void> {
		try {
			const id = Number(req.params.id);
			if (Number.isNaN(id)) {
				res.status(400).json({ success: false, error: "Invalid id" });
				return;
			}

			const limit = Math.min(
				parseInt(String(req.query.limit ?? "50"), 10) || 50,
				100
			);
			const offset = parseInt(String(req.query.offset ?? "0"), 10) || 0;

			const items = await ServiceService.list(limit, offset, {
				serviceTypeId: id,
			});
			res.status(200).json({ success: true, data: items });
		} catch (error: any) {
			res
				.status(500)
				.json({
					success: false,
					error: error?.message || "Failed to list services for type",
				});
		}
	}
}

export default ServiceTypesController;
