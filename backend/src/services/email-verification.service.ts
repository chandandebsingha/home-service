import { desc, eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { db } from "../db";
import {
	users,
	emailVerificationTokens,
	type User,
} from "../../drizzle/schema";
import { NotificationService } from "./notification.service";

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const OTP_SALT_ROUNDS = 10;

export class EmailVerificationService {
	private static generateOtp(): string {
		return Math.floor(
			Math.pow(10, OTP_LENGTH - 1) +
				Math.random() * 9 * Math.pow(10, OTP_LENGTH - 1)
		)
			.toString()
			.padStart(OTP_LENGTH, "0");
	}

	private static async persistToken(user: User, otp: string) {
		await db
			.delete(emailVerificationTokens)
			.where(eq(emailVerificationTokens.userId, user.id));

		const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
		const otpHash = await bcrypt.hash(otp, OTP_SALT_ROUNDS);

		await db.insert(emailVerificationTokens).values({
			userId: user.id,
			email: user.email,
			otpHash,
			expiresAt,
			attempts: 0,
		});
	}

	static async createAndSend(user: User): Promise<void> {
		const otp = this.generateOtp();
		await this.persistToken(user, otp);

		await NotificationService.sendEmailOtp(user.email, otp, OTP_EXPIRY_MINUTES);
	}

	static async resend(email: string): Promise<void> {
		const user = await db.query.users.findFirst({
			where: eq(users.email, email),
		});

		if (!user) {
			throw new Error("User not found");
		}

		if (user.isEmailVerified) {
			throw new Error("Email is already verified");
		}

		await this.createAndSend(user);
	}

	static async verify(email: string, otp: string): Promise<User> {
		const [record] = await db
			.select()
			.from(emailVerificationTokens)
			.where(eq(emailVerificationTokens.email, email))
			.orderBy(desc(emailVerificationTokens.createdAt))
			.limit(1);

		if (!record) {
			throw new Error("No verification request found for this email");
		}

		if (record.expiresAt <= new Date()) {
			await db
				.delete(emailVerificationTokens)
				.where(eq(emailVerificationTokens.id, record.id));
			throw new Error("OTP has expired. Please request a new code");
		}

		const isValid = await bcrypt.compare(otp, record.otpHash);
		if (!isValid) {
			await db
				.update(emailVerificationTokens)
				.set({ attempts: record.attempts + 1, updatedAt: new Date() })
				.where(eq(emailVerificationTokens.id, record.id));
			throw new Error("Invalid OTP provided");
		}

		await db
			.update(users)
			.set({ isEmailVerified: true })
			.where(eq(users.id, record.userId));

		await db
			.delete(emailVerificationTokens)
			.where(eq(emailVerificationTokens.userId, record.userId));

		const verifiedUser = await db.query.users.findFirst({
			where: eq(users.id, record.userId),
		});

		if (!verifiedUser) {
			throw new Error("User not found after verification");
		}

		return verifiedUser;
	}
}
