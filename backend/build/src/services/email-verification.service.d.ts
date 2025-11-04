import { type User } from "../../drizzle/schema";
export declare class EmailVerificationService {
    private static generateOtp;
    private static persistToken;
    static createAndSend(user: User): Promise<void>;
    static resend(email: string): Promise<void>;
    static verify(email: string, otp: string): Promise<User>;
}
//# sourceMappingURL=email-verification.service.d.ts.map