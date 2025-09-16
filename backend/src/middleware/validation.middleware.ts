import { Request, Response, NextFunction } from "express";

export interface ValidationRule {
	field: string;
	validator: (value: any) => boolean;
	message: string;
	optional?: boolean;
}

export const validateRequest = (rules: ValidationRule[]) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		const errors: { field: string; message: string }[] = [];
		const body = req.body;

		rules.forEach((rule) => {
			const value = body[rule.field];

			// Skip optional fields that are not provided
			if (
				rule.optional &&
				(value === undefined || value === null || value === "")
			) {
				return;
			}

			// Check required fields
			if (
				!rule.optional &&
				(value === undefined || value === null || value === "")
			) {
				errors.push({
					field: rule.field,
					message: `${rule.field} is required`,
				});
				return;
			}

			// Run validator
			if (!rule.validator(value)) {
				errors.push({ field: rule.field, message: rule.message });
			}
		});

		if (errors.length > 0) {
			res.status(400).json({
				success: false,
				message: "Validation failed",
				errors,
			});
			return;
		}

		next();
	};
};

// Common validators
export const Validators = {
	isEmail: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
	minLength: (min: number) => (value: string) => value.length >= min,
	maxLength: (max: number) => (value: string) => value.length <= max,
	isString: (value: any) => typeof value === "string",
	isNumber: (value: any) => typeof value === "number",
	isBoolean: (value: any) => typeof value === "boolean",
};
