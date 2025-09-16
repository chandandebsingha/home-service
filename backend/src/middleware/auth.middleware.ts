import { Request, Response, NextFunction } from 'express';
import { JwtService } from '../services/jwt.service';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
    return;
  }

  try {
    const decoded = JwtService.verifyToken(token);
    (req as any).user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ 
      success: false, 
      error: 'Invalid or expired token' 
    });
    return;
  }
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = JwtService.verifyToken(token);
      (req as any).user = decoded;
    } catch (error) {
      // Continue without user info if token is invalid
    }
  }
  next();
};