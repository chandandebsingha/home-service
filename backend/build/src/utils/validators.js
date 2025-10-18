"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = exports.loginSchema = exports.registerRules = exports.loginRules = void 0;
const validation_middleware_1 = require("../middleware/validation.middleware");
exports.loginRules = [
    {
        field: 'email',
        validator: validation_middleware_1.Validators.isEmail,
        message: 'Invalid email address',
    },
    {
        field: 'password',
        validator: validation_middleware_1.Validators.minLength(6),
        message: 'Password must be at least 6 characters',
    },
];
exports.registerRules = [
    {
        field: 'email',
        validator: validation_middleware_1.Validators.isEmail,
        message: 'Invalid email address',
    },
    {
        field: 'password',
        validator: validation_middleware_1.Validators.minLength(8),
        message: 'Password must be at least 8 characters',
    },
    {
        field: 'fullName',
        validator: validation_middleware_1.Validators.minLength(2),
        message: 'Full name must be at least 2 characters',
    },
    {
        field: 'role',
        validator: (v) => v === undefined || ['user', 'admin', 'partner'].includes(v),
        message: 'Invalid role',
        optional: true,
    },
];
exports.loginSchema = exports.loginRules;
exports.registerSchema = exports.registerRules;
//# sourceMappingURL=validators.js.map