"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/stats', auth_middleware_1.authenticateToken, auth_middleware_1.authorizeAdmin, admin_controller_1.AdminController.stats);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map