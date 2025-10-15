"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicesController = void 0;
const service_service_1 = require("../services/service.service");
class ServicesController {
    static async create(req, res) {
        try {
            const body = req.body;
            const created = await service_service_1.ServiceService.create({
                name: body.name,
                description: body.description,
                price: body.price,
                serviceType: body.serviceType,
                categoryId: body.categoryId,
                serviceTypeId: body.serviceTypeId,
                durationMinutes: body.durationMinutes,
                availability: body.availability ?? true,
                timeSlots: body.timeSlots,
            });
            res.status(201).json({ success: true, data: created });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Failed to create service' });
        }
    }
    static async list(req, res) {
        try {
            const limit = Math.min(parseInt(String(req.query.limit ?? '50'), 10) || 50, 100);
            const offset = parseInt(String(req.query.offset ?? '0'), 10) || 0;
            const categoryId = req.query.categoryId ? parseInt(String(req.query.categoryId), 10) : undefined;
            const serviceTypeId = req.query.serviceTypeId ? parseInt(String(req.query.serviceTypeId), 10) : undefined;
            const items = await service_service_1.ServiceService.list(limit, offset, { categoryId, serviceTypeId });
            res.status(200).json({ success: true, data: items });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Failed to list services' });
        }
    }
    static async getById(req, res) {
        try {
            const id = parseInt(req.params.id, 10);
            if (Number.isNaN(id)) {
                res.status(400).json({ success: false, error: 'Invalid id' });
                return;
            }
            const item = await service_service_1.ServiceService.getById(id);
            if (!item) {
                res.status(404).json({ success: false, error: 'Service not found' });
                return;
            }
            res.status(200).json({ success: true, data: item });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Failed to get service' });
        }
    }
}
exports.ServicesController = ServicesController;
//# sourceMappingURL=services.controller.js.map