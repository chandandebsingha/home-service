"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const address_controller_1 = require("../controllers/address.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
router.get("/me", auth_middleware_1.authenticateToken, address_controller_1.AddressController.listMine);
router.post("/", auth_middleware_1.authenticateToken, (0, validation_middleware_1.validateRequest)([
    {
        field: "street",
        validator: validation_middleware_1.Validators.isString,
        message: "street must be a string",
    },
    {
        field: "city",
        validator: validation_middleware_1.Validators.isString,
        message: "city must be a string",
    },
    {
        field: "state",
        validator: validation_middleware_1.Validators.isString,
        message: "state must be a string",
    },
    {
        field: "pinCode",
        validator: validation_middleware_1.Validators.isString,
        message: "pinCode must be a string",
    },
    {
        field: "country",
        validator: validation_middleware_1.Validators.isString,
        message: "country must be a string",
    },
    {
        field: "apartment",
        validator: validation_middleware_1.Validators.isString,
        message: "apartment must be a string",
        optional: true,
    },
    {
        field: "landmark",
        validator: validation_middleware_1.Validators.isString,
        message: "landmark must be a string",
        optional: true,
    },
    {
        field: "latitude",
        validator: validation_middleware_1.Validators.isNumber,
        message: "latitude must be a number",
        optional: true,
    },
    {
        field: "longitude",
        validator: validation_middleware_1.Validators.isNumber,
        message: "longitude must be a number",
        optional: true,
    },
    {
        field: "isDefault",
        validator: validation_middleware_1.Validators.isBoolean,
        message: "isDefault must be a boolean",
        optional: true,
    },
]), address_controller_1.AddressController.create);
router.put("/:id", auth_middleware_1.authenticateToken, (0, validation_middleware_1.validateRequest)([
    {
        field: "street",
        validator: validation_middleware_1.Validators.isString,
        message: "street must be a string",
        optional: true,
    },
    {
        field: "city",
        validator: validation_middleware_1.Validators.isString,
        message: "city must be a string",
        optional: true,
    },
    {
        field: "state",
        validator: validation_middleware_1.Validators.isString,
        message: "state must be a string",
        optional: true,
    },
    {
        field: "pinCode",
        validator: validation_middleware_1.Validators.isString,
        message: "pinCode must be a string",
        optional: true,
    },
    {
        field: "country",
        validator: validation_middleware_1.Validators.isString,
        message: "country must be a string",
        optional: true,
    },
    {
        field: "apartment",
        validator: validation_middleware_1.Validators.isString,
        message: "apartment must be a string",
        optional: true,
    },
    {
        field: "landmark",
        validator: validation_middleware_1.Validators.isString,
        message: "landmark must be a string",
        optional: true,
    },
    {
        field: "latitude",
        validator: validation_middleware_1.Validators.isNumber,
        message: "latitude must be a number",
        optional: true,
    },
    {
        field: "longitude",
        validator: validation_middleware_1.Validators.isNumber,
        message: "longitude must be a number",
        optional: true,
    },
    {
        field: "isDefault",
        validator: validation_middleware_1.Validators.isBoolean,
        message: "isDefault must be a boolean",
        optional: true,
    },
]), address_controller_1.AddressController.update);
router.delete("/:id", auth_middleware_1.authenticateToken, address_controller_1.AddressController.remove);
exports.default = router;
//# sourceMappingURL=addresses.routes.js.map