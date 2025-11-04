import { Request, Response, NextFunction } from 'express';
export interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}
export declare const jsonErrorHandler: (error: any, req: Request, res: Response, next: NextFunction) => void;
export declare const errorHandler: (error: AppError, req: Request, res: Response, next: NextFunction) => void;
export declare const createError: (message: string, statusCode?: number) => AppError;
//# sourceMappingURL=error.middleware.d.ts.map