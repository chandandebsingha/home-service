import { LoginRequest, RegisterRequest } from '../types/auth.types';
export declare class AuthService {
    static register(userData: RegisterRequest): Promise<{
        user: {
            id: number;
            supabaseUid: string;
            email: string;
            passwordHash: string | null;
            fullName: string;
            role: "user" | "admin" | "partner" | null;
            isEmailVerified: boolean;
            lastLogin: Date | null;
            createdAt: Date;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    static login(loginData: LoginRequest): Promise<{
        user: {
            id: number;
            supabaseUid: string;
            email: string;
            passwordHash: string | null;
            fullName: string;
            role: "user" | "admin" | "partner" | null;
            isEmailVerified: boolean;
            lastLogin: Date | null;
            createdAt: Date;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    static logout(userId: number, token: string): Promise<{
        success: boolean;
    }>;
    static getProfile(userId: number): Promise<{
        id: number;
        supabaseUid: string;
        email: string;
        passwordHash: string | null;
        fullName: string;
        role: "user" | "admin" | "partner" | null;
        isEmailVerified: boolean;
        lastLogin: Date | null;
        createdAt: Date;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map