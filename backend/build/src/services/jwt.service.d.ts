import { JwtPayload } from '../types/auth.types';
export declare class JwtService {
    static generateToken(payload: JwtPayload, expiry?: string | number, secret?: string): string;
    static verifyToken(token: string, secret?: string): JwtPayload;
    static generateAccessToken(userId: number, email: string, role: string): string;
    static generateRefreshToken(userId: number, email: string, role: string): string;
}
//# sourceMappingURL=jwt.service.d.ts.map