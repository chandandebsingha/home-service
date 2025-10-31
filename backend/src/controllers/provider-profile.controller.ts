import { Request, Response } from "express";
import { ProviderProfileService } from "../services/provider-profile.service";

export class ProviderProfileController {
	static async create(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as any).user;
			const body = req.body;

			// Check if user already has a provider profile
			const existingProfile = await ProviderProfileService.getByUserId(
				user.userId
			);
			if (existingProfile) {
				res
					.status(400)
					.json({
						success: false,
						error: "Provider profile already exists for this user",
					});
				return;
			}

			const created = await ProviderProfileService.create({
				userId: user.userId,
				occupationId: body.occupationId,
				businessName: body.businessName,
				businessAddress: body.businessAddress,
				phoneNumber: body.phoneNumber,
				experience: body.experience,
				skills: body.skills ? JSON.stringify(body.skills) : null,
				certifications: body.certifications
					? JSON.stringify(body.certifications)
					: null,
				bio: body.bio,
			});
			res.status(201).json({ success: true, data: created });
		} catch (error: any) {
			res
				.status(500)
				.json({
					success: false,
					error: error.message || "Failed to create provider profile",
				});
		}
	}

	static async getMyProfile(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as any).user;
			const profile = await ProviderProfileService.getByUserId(user.userId);
			if (!profile) {
				res
					.status(404)
					.json({ success: false, error: "Provider profile not found" });
				return;
			}
			res.status(200).json({ success: true, data: profile });
		} catch (error: any) {
			res
				.status(500)
				.json({
					success: false,
					error: error.message || "Failed to fetch provider profile",
				});
		}
	}

	static async update(req: Request, res: Response): Promise<void> {
		try {
			const user = (req as any).user;
			const body = req.body;

			const updated = await ProviderProfileService.updateByUserId(user.userId, {
				occupationId: body.occupationId,
				businessName: body.businessName,
				businessAddress: body.businessAddress,
				phoneNumber: body.phoneNumber,
				experience: body.experience,
				skills: body.skills ? JSON.stringify(body.skills) : null,
				certifications: body.certifications
					? JSON.stringify(body.certifications)
					: null,
				bio: body.bio,
			});
			res.status(200).json({ success: true, data: updated });
		} catch (error: any) {
			res
				.status(500)
				.json({
					success: false,
					error: error.message || "Failed to update provider profile",
				});
		}
	}

	static async getAll(req: Request, res: Response): Promise<void> {
		try {
			const profiles = await ProviderProfileService.getAll();
			res.status(200).json({ success: true, data: profiles });
		} catch (error: any) {
			res
				.status(500)
				.json({
					success: false,
					error: error.message || "Failed to fetch provider profiles",
				});
		}
	}

	static async verify(req: Request, res: Response): Promise<void> {
		try {
			const profileId = parseInt(req.params.id, 10);
			if (Number.isNaN(profileId)) {
				res.status(400).json({ success: false, error: "Invalid profile ID" });
				return;
			}

			const updated = await ProviderProfileService.verifyAndPromote(profileId);
			res.status(200).json({ success: true, data: updated });
		} catch (error: any) {
			res
				.status(500)
				.json({
					success: false,
					error: error.message || "Failed to verify provider",
				});
		}
	}
}
