"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressController = void 0;
const addresses_service_1 = require("../services/addresses.service");
class AddressController {
    static async create(req, res) {
        try {
            const user = req.user;
            const body = req.body;
            if (body.isDefault) {
                await addresses_service_1.AddressesService.unsetDefaultForUser(user.userId);
            }
            const created = await addresses_service_1.AddressesService.create({
                userId: user.userId,
                street: String(body.street || ""),
                landmark: body.landmark ? String(body.landmark) : null,
                apartment: body.apartment ? String(body.apartment) : null,
                city: String(body.city || ""),
                state: String(body.state || ""),
                pinCode: String(body.pinCode || ""),
                country: String(body.country || ""),
                latitude: body.latitude !== undefined && body.latitude !== null
                    ? Number(body.latitude)
                    : null,
                longitude: body.longitude !== undefined && body.longitude !== null
                    ? Number(body.longitude)
                    : null,
                isDefault: !!body.isDefault,
            });
            res.status(201).json({ success: true, data: created });
        }
        catch (error) {
            res
                .status(500)
                .json({
                success: false,
                error: error.message || "Failed to create address",
            });
        }
    }
    static async listMine(req, res) {
        try {
            const user = req.user;
            const rows = await addresses_service_1.AddressesService.listByUser(user.userId);
            res.status(200).json({ success: true, data: rows });
        }
        catch (error) {
            res
                .status(500)
                .json({
                success: false,
                error: error.message || "Failed to fetch addresses",
            });
        }
    }
    static async update(req, res) {
        try {
            const user = req.user;
            const id = Number(req.params.id);
            const body = req.body;
            if (!Number.isFinite(id)) {
                res.status(400).json({ success: false, error: "Invalid id" });
                return;
            }
            const existing = await addresses_service_1.AddressesService.getById(id);
            if (!existing) {
                res.status(404).json({ success: false, error: "Address not found" });
                return;
            }
            if (existing.userId !== user.userId) {
                res.status(403).json({ success: false, error: "Not authorized" });
                return;
            }
            if (body.isDefault) {
                await addresses_service_1.AddressesService.unsetDefaultForUser(user.userId);
            }
            const updated = await addresses_service_1.AddressesService.update(id, {
                street: body.street !== undefined ? String(body.street) : existing.street,
                landmark: body.landmark !== undefined
                    ? body.landmark
                        ? String(body.landmark)
                        : null
                    : existing.landmark,
                apartment: body.apartment !== undefined
                    ? body.apartment
                        ? String(body.apartment)
                        : null
                    : existing.apartment,
                city: body.city !== undefined ? String(body.city) : existing.city,
                state: body.state !== undefined ? String(body.state) : existing.state,
                pinCode: body.pinCode !== undefined ? String(body.pinCode) : existing.pinCode,
                country: body.country !== undefined ? String(body.country) : existing.country,
                latitude: body.latitude !== undefined
                    ? body.latitude !== null
                        ? Number(body.latitude)
                        : null
                    : existing.latitude,
                longitude: body.longitude !== undefined
                    ? body.longitude !== null
                        ? Number(body.longitude)
                        : null
                    : existing.longitude,
                isDefault: body.isDefault !== undefined ? !!body.isDefault : existing.isDefault,
            });
            res.status(200).json({ success: true, data: updated });
        }
        catch (error) {
            res
                .status(500)
                .json({
                success: false,
                error: error.message || "Failed to update address",
            });
        }
    }
    static async remove(req, res) {
        try {
            const user = req.user;
            const id = Number(req.params.id);
            if (!Number.isFinite(id)) {
                res.status(400).json({ success: false, error: "Invalid id" });
                return;
            }
            const existing = await addresses_service_1.AddressesService.getById(id);
            if (!existing) {
                res.status(404).json({ success: false, error: "Address not found" });
                return;
            }
            if (existing.userId !== user.userId) {
                res.status(403).json({ success: false, error: "Not authorized" });
                return;
            }
            const deleted = await addresses_service_1.AddressesService.remove(id);
            res.status(200).json({ success: true, data: deleted });
        }
        catch (error) {
            res
                .status(500)
                .json({
                success: false,
                error: error.message || "Failed to delete address",
            });
        }
    }
}
exports.AddressController = AddressController;
//# sourceMappingURL=address.controller.js.map