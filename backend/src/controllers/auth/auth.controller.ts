import { Request, Response } from 'express';
import { AuthService } from '../../services/auth.service';
import { AuthResponse, UserProfile } from '../../types/auth.types';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, fullName } = req.body;

      const result = await AuthService.register({ email, password, fullName });

      const userProfile: UserProfile = {
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.fullName || '',
        role: result.user.role || 'user',
        isEmailVerified: result.user.isEmailVerified || false,
        createdAt: result.user.createdAt || undefined,
        lastLogin: result.user.lastLogin || undefined,
      };

      const response: AuthResponse = {
        success: true,
        message: 'User registered successfully',
        data: {
          user: userProfile,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      };

      res.status(201).json(response);
    } catch (error: any) {
      const response: AuthResponse = {
        success: false,
        message: 'Registration failed',
        error: error.message,
      };
      res.status(400).json(response);
      console.log("hello",response);
      
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login({ email, password });

      const userProfile: UserProfile = {
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.fullName || '',
        role: result.user.role || 'user',
        isEmailVerified: result.user.isEmailVerified || false,
        createdAt: result.user.createdAt || undefined,
        lastLogin: result.user.lastLogin || undefined,
      };

      const response: AuthResponse = {
        success: true,
        message: 'Login successful',
        data: {
          user: userProfile,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: AuthResponse = {
        success: false,
        message: 'Login failed',
        error: error.message,
      };
      res.status(401).json(response);
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const token = req.headers.authorization?.replace('Bearer ', '');

      await AuthService.logout(userId, token!);

      const response: AuthResponse = {
        success: true,
        message: 'Logout successful',
      };

      res.status(200).json(response);
    } catch (error: any) {
      const response: AuthResponse = {
        success: false,
        message: 'Logout failed',
        error: error.message,
      };
      res.status(400).json(response);
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user.userId;
      const user = await AuthService.getProfile(userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message,
      });
    }
  }
}