"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const db_1 = require("../db");
const schema_1 = require("../../build/drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const supabase_service_1 = require("./supabase.service");
const jwt_service_1 = require("./jwt.service");
const bcrypt_1 = __importDefault(require("bcrypt"));
class AuthService {
    static async register(userData) {
        try {
            const existingUser = await db_1.db.query.users.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.users.email, userData.email),
            });
            if (existingUser) {
                throw new Error('User with this email already exists');
            }
            const adminUser = await supabase_service_1.SupabaseService.adminCreateUser(userData.email, userData.password, { fullName: userData.fullName });
            const supabaseUid = adminUser?.id;
            if (!supabaseUid) {
                throw new Error('Failed to obtain Supabase UID');
            }
            const saltRounds = 12;
            const passwordHash = await bcrypt_1.default.hash(userData.password, saltRounds);
            const newUser = {
                email: userData.email,
                passwordHash: passwordHash,
                fullName: userData.fullName,
                supabaseUid: supabaseUid,
                role: userData.role ?? 'user',
                isEmailVerified: true,
            };
            const [user] = await db_1.db.insert(schema_1.users).values(newUser).returning();
            const accessToken = jwt_service_1.JwtService.generateAccessToken(user.id, user.email, user.role);
            const refreshToken = jwt_service_1.JwtService.generateRefreshToken(user.id, user.email, user.role);
            return { user, accessToken, refreshToken };
        }
        catch (error) {
            throw error;
        }
    }
    static async login(loginData) {
        try {
            const user = await db_1.db.query.users.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.users.email, loginData.email),
            });
            if (!user || !user.passwordHash) {
                throw new Error('Invalid email or password');
            }
            const isValid = await bcrypt_1.default.compare(loginData.password, user.passwordHash);
            if (!isValid) {
                throw new Error('Invalid email or password');
            }
            const accessToken = jwt_service_1.JwtService.generateAccessToken(user.id, user.email, user.role);
            const refreshToken = jwt_service_1.JwtService.generateRefreshToken(user.id, user.email, user.role);
            return { user, accessToken, refreshToken };
        }
        catch (error) {
            throw error;
        }
    }
    static async logout(userId, token) {
        try {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);
            await db_1.db.insert(schema_1.userSessions).values({
                userId: userId,
                token: token,
                expiresAt: expiresAt,
                isValid: false,
            });
            return { success: true };
        }
        catch (error) {
            throw error;
        }
    }
    static async getProfile(userId) {
        try {
            const user = await db_1.db.query.users.findFirst({
                where: (0, drizzle_orm_1.eq)(schema_1.users.id, userId),
            });
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map