"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createError = exports.errorHandler = exports.jsonErrorHandler = void 0;
const jsonErrorHandler = (error, req, res, next) => {
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
exports.jsonErrorHandler = jsonErrorHandler;
const errorHandler = (error, req, res, next) => {
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
exports.errorHandler = errorHandler;
const createError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    error.isOperational = true;
    return error;
};
exports.createError = createError;
//# sourceMappingURL=error.middleware.js.map