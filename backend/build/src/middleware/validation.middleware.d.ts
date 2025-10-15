import { Request, Response, NextFunction } from "express";
export interface ValidationRule {
    field: string;
    validator: (value: any) => boolean;
    message: string;
    optional?: boolean;
}
export declare const validateRequest: (rules: ValidationRule[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const Validators: {
    isEmail: (value: string) => boolean;
    minLength: (min: number) => (value: string) => boolean;
    maxLength: (max: number) => (value: string) => boolean;
    isString: (value: any) => value is string;
    isNumber: (value: any) => value is number;
    isBoolean: (value: any) => value is boolean;
};
//# sourceMappingURL=validation.middleware.d.ts.map