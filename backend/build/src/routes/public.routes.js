"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const occupation_service_1 = require("../services/occupation.service");
const router = (0, express_1.Router)();
router.get("/occupations", async (_req, res) => {
    try {
        const items = await occupation_service_1.OccupationService.list();
        res.status(200).json({ success: true, data: items });
    }
    catch (error) {
        res
            .status(500)
            .json({
            success: false,
            error: error?.message || "Failed to fetch occupations",
        });
    }
});
exports.default = router;
//# sourceMappingURL=public.routes.js.map