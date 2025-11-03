"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailVerificationService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../db");
const schema_1 = require("../../drizzle/schema");
const notification_service_1 = require("./notification.service");
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const OTP_SALT_ROUNDS = 10;
class EmailVerificationService {
    static generateOtp() {
        return Math.floor(Math.pow(10, OTP_LENGTH - 1) +
            Math.random() * 9 * Math.pow(10, OTP_LENGTH - 1))
            .toString()
            .padStart(OTP_LENGTH, "0");
    }
    static async persistToken(user, otp) {
        await db_1.db
            .delete(schema_1.emailVerificationTokens)
            .where((0, drizzle_orm_1.eq)(schema_1.emailVerificationTokens.userId, user.id));
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
        const otpHash = await bcrypt_1.default.hash(otp, OTP_SALT_ROUNDS);
        await db_1.db.insert(schema_1.emailVerificationTokens).values({
            userId: user.id,
            email: user.email,
            otpHash,
            expiresAt,
            attempts: 0,
        });
    }
    static async createAndSend(user) {
        const otp = this.generateOtp();
        await this.persistToken(user, otp);
        await notification_service_1.NotificationService.sendEmailOtp(user.email, otp, OTP_EXPIRY_MINUTES);
    }
    static async resend(email) {
        const user = await db_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.email, email),
        });
        if (!user) {
            throw new Error("User not found");
        }
        if (user.isEmailVerified) {
            throw new Error("Email is already verified");
        }
        await this.createAndSend(user);
    }
    static async verify(email, otp) {
        const [record] = await db_1.db
            .select()
            .from(schema_1.emailVerificationTokens)
            .where((0, drizzle_orm_1.eq)(schema_1.emailVerificationTokens.email, email))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.emailVerificationTokens.createdAt))
            .limit(1);
        if (!record) {
            throw new Error("No verification request found for this email");
        }
        if (record.expiresAt <= new Date()) {
            await db_1.db
                .delete(schema_1.emailVerificationTokens)
                .where((0, drizzle_orm_1.eq)(schema_1.emailVerificationTokens.id, record.id));
            throw new Error("OTP has expired. Please request a new code");
        }
        const isValid = await bcrypt_1.default.compare(otp, record.otpHash);
        if (!isValid) {
            await db_1.db
                .update(schema_1.emailVerificationTokens)
                .set({ attempts: record.attempts + 1, updatedAt: new Date() })
                .where((0, drizzle_orm_1.eq)(schema_1.emailVerificationTokens.id, record.id));
            throw new Error("Invalid OTP provided");
        }
        await db_1.db
            .update(schema_1.users)
            .set({ isEmailVerified: true })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, record.userId));
        await db_1.db
            .delete(schema_1.emailVerificationTokens)
            .where((0, drizzle_orm_1.eq)(schema_1.emailVerificationTokens.userId, record.userId));
        const verifiedUser = await db_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.id, record.userId),
        });
        if (!verifiedUser) {
            throw new Error("User not found after verification");
        }
        return verifiedUser;
    }
}
exports.EmailVerificationService = EmailVerificationService;
//# sourceMappingURL=email-verification.service.js.map