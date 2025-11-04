"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceTypesController = void 0;
const service_service_1 = require("../services/service.service");
class ServiceTypesController {
    static async servicesByType(req, res) {
        try {
            const id = Number(req.params.id);
            if (Number.isNaN(id)) {
                res.status(400).json({ success: false, error: "Invalid id" });
                return;
            }
            const limit = Math.min(parseInt(String(req.query.limit ?? "50"), 10) || 50, 100);
            const offset = parseInt(String(req.query.offset ?? "0"), 10) || 0;
            const items = await service_service_1.ServiceService.list(limit, offset, {
                serviceTypeId: id,
            });
            res.status(200).json({ success: true, data: items });
        }
        catch (error) {
            res
                .status(500)
                .json({
                success: false,
                error: error?.message || "Failed to list services for type",
            });
        }
    }
}
exports.ServiceTypesController = ServiceTypesController;
exports.default = ServiceTypesController;
//# sourceMappingURL=serviceTypes.controller.js.map