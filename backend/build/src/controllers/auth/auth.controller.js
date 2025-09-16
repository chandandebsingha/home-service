"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../../services/auth.service");
class AuthController {
    static async register(req, res) {
        try {
            const { email, password, fullName } = req.body;
            const result = await auth_service_1.AuthService.register({ email, password, fullName });
            const userProfile = {
                id: result.user.id,
                email: result.user.email,
                fullName: result.user.fullName || '',
                role: result.user.role || 'user',
                isEmailVerified: result.user.isEmailVerified || false,
                createdAt: result.user.createdAt || undefined,
                lastLogin: result.user.lastLogin || undefined,
            };
            const response = {
                success: true,
                message: 'User registered successfully',
                data: {
                    user: userProfile,
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                },
            };
            res.status(201).json(response);
        }
        catch (error) {
            const response = {
                success: false,
                message: 'Registration failed',
                error: error.message,
            };
            res.status(400).json(response);
            console.log("hello", response);
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await auth_service_1.AuthService.login({ email, password });
            const userProfile = {
                id: result.user.id,
                email: result.user.email,
                fullName: result.user.fullName || '',
                role: result.user.role || 'user',
                isEmailVerified: result.user.isEmailVerified || false,
                createdAt: result.user.createdAt || undefined,
                lastLogin: result.user.lastLogin || undefined,
            };
            const response = {
                success: true,
                message: 'Login successful',
                data: {
                    user: userProfile,
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                },
            };
            res.status(200).json(response);
        }
        catch (error) {
            const response = {
                success: false,
                message: 'Login failed',
                error: error.message,
            };
            res.status(401).json(response);
        }
    }
    static async logout(req, res) {
        try {
            const userId = req.user.userId;
            const token = req.headers.authorization?.replace('Bearer ', '');
            await auth_service_1.AuthService.logout(userId, token);
            const response = {
                success: true,
                message: 'Logout successful',
            };
            res.status(200).json(response);
        }
        catch (error) {
            const response = {
                success: false,
                message: 'Logout failed',
                error: error.message,
            };
            res.status(400).json(response);
        }
    }
    static async getProfile(req, res) {
        try {
            const userId = req.user.userId;
            const user = await auth_service_1.AuthService.getProfile(userId);
            res.status(200).json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            res.status(404).json({
                success: false,
                error: error.message,
            });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map