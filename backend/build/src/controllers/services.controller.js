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
            const items = await service_service_1.ServiceService.list();
            res.status(200).json({ success: true, data: items });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message || 'Failed to list services' });
        }
    }
}
exports.ServicesController = ServicesController;
//# sourceMappingURL=services.controller.js.map