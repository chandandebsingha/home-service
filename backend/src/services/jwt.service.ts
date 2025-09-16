import jwt from 'jsonwebtoken';
import { config } from '../types/config';
import { JwtPayload } from '../types/auth.types';

export class JwtService {
  static generateToken(
    payload: JwtPayload,
    expiry: string | number = config.accessTokenExpiry,
    secret: string = config.jwtSecret
  ): string {
    const expiresIn = typeof expiry === 'number' ? `${expiry}s` : expiry;
    return jwt.sign(payload, secret, { expiresIn } as any);
  }

  static verifyToken(token: string, secret: string = config.jwtSecret): JwtPayload {
    try {
      return jwt.verify(token, secret) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static generateAccessToken(userId: number, email: string, role: string): string {
    const payload: JwtPayload = { userId, email, role };
    return this.generateToken(payload, config.accessTokenExpiry);
  }

  static generateRefreshToken(userId: number, email: string, role: string): string {
    const payload: JwtPayload = { userId, email, role };
    return this.generateToken(payload, config.refreshTokenExpiry);
  }
}