"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = require("../types/config");
class NotificationService {
    static async getTransporter() {
        if (!config_1.config.email.enabled) {
            throw new Error("Email transport requested without SMTP configuration");
        }
        if (!this.transporter) {
            this.transporter = nodemailer_1.default.createTransport({
                host: config_1.config.email.host,
                port: config_1.config.email.port,
                secure: config_1.config.email.secure,
                auth: {
                    user: config_1.config.email.user,
                    pass: config_1.config.email.pass,
                },
            });
        }
        if (!this.transporterVerified) {
            await this.transporter.verify();
            this.transporterVerified = true;
        }
        return this.transporter;
    }
    static async sendEmailOtp(email, otp, expiresInMinutes) {
        const subject = `${config_1.config.appName} verification code`;
        const text = `Your verification code is ${otp}. It expires in ${expiresInMinutes} minutes.`;
        const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>Hello,</p>
        <p>Your verification code for <strong>${config_1.config.appName}</strong> is:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
        <p>This code will expire in <strong>${expiresInMinutes} minutes</strong>. If you did not request this email, you can safely ignore it.</p>
        <p>Thanks,<br/>The ${config_1.config.appName} Team</p>
      </div>
    `;
        try {
            if (!config_1.config.email.enabled) {
                console.warn("SMTP configuration is missing. Logging OTP to console instead of sending email.");
                console.info(`[Email OTP] recipient=${email}, otp=${otp}, expiresInMinutes=${expiresInMinutes}`);
                return;
            }
            const transporter = await this.getTransporter();
            await transporter.sendMail({
                from: config_1.config.email.from,
                to: email,
                subject,
                text,
                html,
            });
        }
        catch (error) {
            console.error("Failed to send OTP email:", error);
            throw new Error("Unable to send verification email");
        }
    }
}
exports.NotificationService = NotificationService;
NotificationService.transporter = null;
NotificationService.transporterVerified = false;
//# sourceMappingURL=notification.service.js.map