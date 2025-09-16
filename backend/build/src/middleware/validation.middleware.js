"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validators = exports.validateRequest = void 0;
const validateRequest = (rules) => {
    return (req, res, next) => {
        const errors = [];
        const body = req.body;
        rules.forEach(rule => {
            const value = body[rule.field];
            if (rule.optional && (value === undefined || value === null || value === '')) {
                return;
            }
            if (!rule.optional && (value === undefined || value === null || value === '')) {
                errors.push({ field: rule.field, message: `${rule.field} is required` });
                return;
            }
            if (!rule.validator(value)) {
                errors.push({ field: rule.field, message: rule.message });
            }
        });
        if (errors.length > 0) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors,
            });
            return;
        }
        next();
    };
};
exports.validateRequest = validateRequest;
exports.Validators = {
    isEmail: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    minLength: (min) => (value) => value.length >= min,
    maxLength: (max) => (value) => value.length <= max,
    isString: (value) => typeof value === 'string',
    isNumber: (value) => typeof value === 'number',
    isBoolean: (value) => typeof value === 'boolean',
};
//# sourceMappingURL=validation.middleware.js.map