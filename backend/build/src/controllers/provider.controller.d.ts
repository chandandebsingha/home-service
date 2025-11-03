import { Request, Response } from "express";
export declare class ProviderController {
    static getMyServices(req: Request, res: Response): Promise<void>;
    static createService(req: Request, res: Response): Promise<void>;
    static updateService(req: Request, res: Response): Promise<void>;
    static deleteService(req: Request, res: Response): Promise<void>;
    static getMyBookings(req: Request, res: Response): Promise<void>;
    static updateBookingStatus(req: Request, res: Response): Promise<void>;
    static getMyRatingSummary(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=provider.controller.d.ts.map