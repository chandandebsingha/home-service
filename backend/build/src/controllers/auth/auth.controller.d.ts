import { Request, Response } from 'express';
export declare class AuthController {
    static register(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    static logout(req: Request, res: Response): Promise<void>;
    static getProfile(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=auth.controller.d.ts.map