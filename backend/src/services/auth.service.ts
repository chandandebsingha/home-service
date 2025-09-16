import { db } from '../db';
import { users, userSessions, type NewUser } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { SupabaseService } from './supabase.service';
import { JwtService } from './jwt.service';
import { LoginRequest, RegisterRequest } from '../types/auth.types';
import bcrypt from 'bcrypt';

export class AuthService {
  static async register(userData: RegisterRequest) {
    try {
      // 1. Check if user already exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, userData.email),
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // 2. Create user in Supabase Auth and capture UID
      const supabaseResult = await SupabaseService.signUp(
        userData.email,
        userData.password,
        { fullName: userData.fullName }
      );

      const supabaseUid = supabaseResult.user?.id;

      // 3. Hash the password for our local DB
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);

      // 4. Create user in our database with Supabase UID
      const newUser: NewUser = {
        email: userData.email,
        passwordHash: passwordHash,
        fullName: userData.fullName,
        supabaseUid: supabaseUid,
        isEmailVerified: false, // Will be verified via email confirmation
      };

      const [user] = await db.insert(users).values(newUser).returning();

      // 5. Generate tokens
      const accessToken = JwtService.generateAccessToken(user.id, user.email, user.role!);
      const refreshToken = JwtService.generateRefreshToken(user.id, user.email, user.role!);

      return { user, accessToken, refreshToken };
    } catch (error) {
      throw error;
    }
  }

  static async login(loginData: LoginRequest) {
    try {
      // 1. Get user from our database
      const user = await db.query.users.findFirst({
        where: eq(users.email, loginData.email),
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      // 2. Verify password. If missing local hash, attempt Supabase sign-in then backfill hash
      if (!user.passwordHash) {
        // Try Supabase auth as a fallback for legacy users
        const supa = await SupabaseService.signIn(loginData.email, loginData.password);
        if (!supa || !supa.user) {
          throw new Error('Invalid credentials');
        }
        // Backfill local password hash and supabase uid if needed
        const newHash = await bcrypt.hash(loginData.password, 12);
        await db.update(users)
          .set({ passwordHash: newHash, supabaseUid: user.supabaseUid || supa.user.id })
          .where(eq(users.id, user.id));
        user.passwordHash = newHash;
      }

      const isPasswordValid = await bcrypt.compare(loginData.password, user.passwordHash);
      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // 3. Update last login
      await db.update(users)
        .set({ lastLogin: new Date() })
        .where(eq(users.id, user.id));

      // 4. Generate tokens
      const accessToken = JwtService.generateAccessToken(user.id, user.email, user.role!);
      const refreshToken = JwtService.generateRefreshToken(user.id, user.email, user.role!);

      return { user, accessToken, refreshToken };
    } catch (error) {
      throw error;
    }
  }

  static async logout(userId: number, token: string) {
    try {
      // Store the invalidated token in our database
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
      
      await db.insert(userSessions).values({
        userId: userId,
        token: token,
        expiresAt: expiresAt,
        isValid: false, // Mark as invalid
      });
      
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  static async getProfile(userId: number) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user) {
        throw new Error('User not found');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }
}