"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderProfileController = void 0;
const provider_profile_service_1 = require("../services/provider-profile.service");
class ProviderProfileController {
    static async create(req, res) {
        try {
            const user = req.user;
            const body = req.body;
            const existingProfile = await provider_profile_service_1.ProviderProfileService.getByUserId(user.userId);
            if (existingProfile) {
                res.status(400).json({ success: false, error: 'Provider profile already exists for this user' });
                return;
            }
            const created = await provider_profile_service_1.ProviderProfileService.create({
                userId: user.userId,
                occupationId: body.occupationId,
                businessName: body.businessName,
                businessAddress: body.businessAddress,
                phoneNumber: body.phoneNumber,
                experience: body.experience,
                skills: body.skills ? JSON.stringify(body.skills) : null,
                certifications: body.certifications ? JSON.stringify(body.certifications) : null,
                bio: body.bio,
            });
            res.status(201).json({ success: true, data: created });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Failed to create provider profile' });
        }
    }
    static async getMyProfile(req, res) {
        try {
            const user = req.user;
            const profile = await provider_profile_service_1.ProviderProfileService.getByUserId(user.userId);
            if (!profile) {
                res.status(404).json({ success: false, error: 'Provider profile not found' });
                return;
            }
            res.status(200).json({ success: true, data: profile });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Failed to fetch provider profile' });
        }
    }
    static async update(req, res) {
        try {
            const user = req.user;
            const body = req.body;
            const updated = await provider_profile_service_1.ProviderProfileService.updateByUserId(user.userId, {
                occupationId: body.occupationId,
                businessName: body.businessName,
                businessAddress: body.businessAddress,
                phoneNumber: body.phoneNumber,
                experience: body.experience,
                skills: body.skills ? JSON.stringify(body.skills) : null,
                certifications: body.certifications ? JSON.stringify(body.certifications) : null,
                bio: body.bio,
            });
            res.status(200).json({ success: true, data: updated });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Failed to update provider profile' });
        }
    }
    static async getAll(req, res) {
        try {
            const profiles = await provider_profile_service_1.ProviderProfileService.getAll();
            res.status(200).json({ success: true, data: profiles });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Failed to fetch provider profiles' });
        }
    }
    static async verify(req, res) {
        try {
            const profileId = parseInt(req.params.id, 10);
            if (Number.isNaN(profileId)) {
                res.status(400).json({ success: false, error: 'Invalid profile ID' });
                return;
            }
            const updated = await provider_profile_service_1.ProviderProfileService.update(profileId, { isVerified: true });
            res.status(200).json({ success: true, data: updated });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Failed to verify provider' });
        }
    }
}
exports.ProviderProfileController = ProviderProfileController;
//# sourceMappingURL=provider-profile.controller.js.map