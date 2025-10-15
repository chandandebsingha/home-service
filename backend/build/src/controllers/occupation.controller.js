"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OccupationController = void 0;
const occupation_service_1 = require("../services/occupation.service");
class OccupationController {
    static async create(req, res) {
        try {
            const body = req.body;
            const created = await occupation_service_1.OccupationService.create({
                name: body.name,
                description: body.description,
                isActive: body.isActive ?? true,
            });
            res.status(201).json({ success: true, data: created });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Failed to create occupation' });
        }
    }
    static async list(req, res) {
        try {
            const occupations = await occupation_service_1.OccupationService.list();
            res.status(200).json({ success: true, data: occupations });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Failed to fetch occupations' });
        }
    }
    static async getById(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (Number.isNaN(id)) {
                res.status(400).json({ success: false, error: 'Invalid occupation ID' });
                return;
            }
            const occupation = await occupation_service_1.OccupationService.getById(id);
            if (!occupation) {
                res.status(404).json({ success: false, error: 'Occupation not found' });
                return;
            }
            res.status(200).json({ success: true, data: occupation });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Failed to fetch occupation' });
        }
    }
    static async update(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (Number.isNaN(id)) {
                res.status(400).json({ success: false, error: 'Invalid occupation ID' });
                return;
            }
            const body = req.body;
            const updated = await occupation_service_1.OccupationService.update(id, {
                name: body.name,
                description: body.description,
                isActive: body.isActive,
            });
            res.status(200).json({ success: true, data: updated });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Failed to update occupation' });
        }
    }
    static async delete(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (Number.isNaN(id)) {
                res.status(400).json({ success: false, error: 'Invalid occupation ID' });
                return;
            }
            await occupation_service_1.OccupationService.delete(id);
            res.status(200).json({ success: true, message: 'Occupation deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Failed to delete occupation' });
        }
    }
}
exports.OccupationController = OccupationController;
//# sourceMappingURL=occupation.controller.js.map