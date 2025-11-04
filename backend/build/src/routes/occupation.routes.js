"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const occupation_controller_1 = require("../controllers/occupation.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticateToken);
router.use(auth_middleware_1.authorizeAdmin);
router.get('/', occupation_controller_1.OccupationController.list);
router.get('/:id', occupation_controller_1.OccupationController.getById);
router.post('/', (0, validation_middleware_1.validateRequest)([
    { field: 'name', validator: validation_middleware_1.Validators.isString, message: 'name must be a string' },
    { field: 'description', validator: validation_middleware_1.Validators.isString, message: 'description must be a string', optional: true },
    { field: 'isActive', validator: validation_middleware_1.Validators.isBoolean, message: 'isActive must be a boolean', optional: true },
]), occupation_controller_1.OccupationController.create);
router.put('/:id', (0, validation_middleware_1.validateRequest)([
    { field: 'name', validator: validation_middleware_1.Validators.isString, message: 'name must be a string' },
    { field: 'description', validator: validation_middleware_1.Validators.isString, message: 'description must be a string', optional: true },
    { field: 'isActive', validator: validation_middleware_1.Validators.isBoolean, message: 'isActive must be a boolean', optional: true },
]), occupation_controller_1.OccupationController.update);
router.delete('/:id', occupation_controller_1.OccupationController.delete);
exports.default = router;
//# sourceMappingURL=occupation.routes.js.map