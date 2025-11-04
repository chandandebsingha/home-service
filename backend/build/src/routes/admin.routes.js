"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const provider_profile_controller_1 = require("../controllers/provider-profile.controller");
const router = (0, express_1.Router)();
router.get("/stats", auth_middleware_1.authenticateToken, auth_middleware_1.authorizeAdmin, admin_controller_1.AdminController.stats);
router.get("/provider-profiles", auth_middleware_1.authenticateToken, auth_middleware_1.authorizeAdmin, provider_profile_controller_1.ProviderProfileController.getAll);
router.patch("/provider-profiles/:id/verify", auth_middleware_1.authenticateToken, auth_middleware_1.authorizeAdmin, provider_profile_controller_1.ProviderProfileController.verify);
router.post("/provider-profiles/:id/verify", auth_middleware_1.authenticateToken, auth_middleware_1.authorizeAdmin, provider_profile_controller_1.ProviderProfileController.verify);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map