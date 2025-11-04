import { db } from "../db";
import { users, userSessions, type NewUser } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { SupabaseService } from "./supabase.service";
import { JwtService } from "./jwt.service";
import {
	LoginRequest,
	RegisterRequest,
	VerifyEmailOtpRequest,
} from "../types/auth.types";
import bcrypt from "bcrypt";
import { EmailVerificationService } from "./email-verification.service";

export class AuthService {
	static async register(userData: RegisterRequest) {
		try {
			// 1. Check if user already exists
			const existingUser = await db.query.users.findFirst({
				where: eq(users.email, userData.email),
			});

			if (existingUser) {
				throw new Error("User with this email already exists");
			}

			// 2. Create user in Supabase via admin API and capture UID
			const adminUser = await SupabaseService.adminCreateUser(
				userData.email,
				userData.password,
				{ fullName: userData.fullName }
			);

			const supabaseUid = adminUser?.id;
			if (!supabaseUid) {
				throw new Error("Failed to obtain Supabase UID");
			}

			// 3. Hash the password for our local DB
			const saltRounds = 12;
			const passwordHash = await bcrypt.hash(userData.password, saltRounds);

			// 4. Create user in our database with Supabase UID
			const newUser: NewUser = {
				email: userData.email,
				passwordHash: passwordHash,
				fullName: userData.fullName,
				supabaseUid: supabaseUid,
				isEmailVerified: false,
			};

			const [user] = await db.insert(users).values(newUser).returning();

			await EmailVerificationService.createAndSend(user);

			// 5. Generate tokens
			const accessToken = JwtService.generateAccessToken(
				user.id,
				user.email,
				user.role!
			);
			const refreshToken = JwtService.generateRefreshToken(
				user.id,
				user.email,
				user.role!
			);

			return { user, accessToken, refreshToken };
		} catch (error) {
			throw error;
		}
	}

	static async login(loginData: LoginRequest) {
		try {
			// 1. Find user by email
			const user = await db.query.users.findFirst({
				where: eq(users.email, loginData.email),
			});

			if (!user || !user.passwordHash) {
				throw new Error("Invalid email or password");
			}

			// 2. Verify password
			const isValid = await bcrypt.compare(
				loginData.password,
				user.passwordHash
			);
			if (!isValid) {
				throw new Error("Invalid email or password");
			}

			// 3. Generate tokens
			const accessToken = JwtService.generateAccessToken(
				user.id,
				user.email,
				user.role!
			);
			const refreshToken = JwtService.generateRefreshToken(
				user.id,
				user.email,
				user.role!
			);

			// 4. Return tokens and user
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
				throw new Error("User not found");
			}

			return user;
		} catch (error) {
			throw error;
		}
	}

	static async verifyEmailOtp(payload: VerifyEmailOtpRequest) {
		const { email, otp } = payload;

		if (!email || !otp) {
			throw new Error("Email and OTP are required");
		}

		const user = await EmailVerificationService.verify(email, otp);

		const accessToken = JwtService.generateAccessToken(
			user.id,
			user.email,
			user.role!
		);
		const refreshToken = JwtService.generateRefreshToken(
			user.id,
			user.email,
			user.role!
		);

		return { user, accessToken, refreshToken };
	}

	static async resendEmailOtp(email: string) {
		if (!email) {
			throw new Error("Email is required");
		}

		await EmailVerificationService.resend(email);
	}
}
