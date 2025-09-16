import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

// Handle JSON parsing errors specifically
export const jsonErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error instanceof SyntaxError && error.message.includes('JSON') && 'body' in error) {
    console.error('JSON Parse Error:', {
      message: error.message,
      url: req.url,
      method: req.method,
    });

    res.status(400).json({
      success: false,
      message: 'Invalid JSON format in request body',
      error: 'Please ensure your request body contains valid JSON with double-quoted property names',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
    return;
  }
  next(error);
};

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    statusCode,
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
};

export const createError = (message: string, statusCode: number = 500): AppError => {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};
