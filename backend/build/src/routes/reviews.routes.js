"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_controller_1 = require("../controllers/review.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
router.post("/", auth_middleware_1.authenticateToken, (0, validation_middleware_1.validateRequest)([
    {
        field: "bookingId",
        validator: validation_middleware_1.Validators.isNumber,
        message: "bookingId must be a number",
    },
    {
        field: "rating",
        validator: validation_middleware_1.Validators.isNumber,
        message: "rating must be a number",
    },
    {
        field: "comment",
        validator: validation_middleware_1.Validators.isString,
        message: "comment must be a string",
        optional: true,
    },
]), review_controller_1.ReviewController.create);
exports.default = router;
//# sourceMappingURL=reviews.routes.js.map