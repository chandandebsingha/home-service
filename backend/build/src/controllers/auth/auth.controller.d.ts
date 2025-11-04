import { Request, Response } from "express";
export declare class AuthController {
    static register(req: Request, res: Response): Promise<void>;
    static login(req: Request, res: Response): Promise<void>;
    static logout(req: Request, res: Response): Promise<void>;
    static getProfile(req: Request, res: Response): Promise<void>;
    static verifyEmailOtp(req: Request, res: Response): Promise<void>;
    static resendEmailOtp(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=auth.controller.d.ts.map