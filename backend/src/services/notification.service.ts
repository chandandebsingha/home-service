import nodemailer, { Transporter } from "nodemailer";
import { config } from "../types/config";

export class NotificationService {
	private static transporter: Transporter | null = null;
	private static transporterVerified = false;

	private static async getTransporter(): Promise<Transporter> {
		if (!config.email.enabled) {
			throw new Error("Email transport requested without SMTP configuration");
		}

		if (!this.transporter) {
			this.transporter = nodemailer.createTransport({
				host: config.email.host,
				port: config.email.port,
				secure: config.email.secure,
				auth: {
					user: config.email.user,
					pass: config.email.pass,
				},
			});
		}

		if (!this.transporterVerified) {
			await this.transporter.verify();
			this.transporterVerified = true;
		}

		return this.transporter;
	}

	static async sendEmailOtp(
		email: string,
		otp: string,
		expiresInMinutes: number
	): Promise<void> {
		const subject = `${config.appName} verification code`;
		const text = `Your verification code is ${otp}. It expires in ${expiresInMinutes} minutes.`;
		const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>Hello,</p>
        <p>Your verification code for <strong>${config.appName}</strong> is:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
        <p>This code will expire in <strong>${expiresInMinutes} minutes</strong>. If you did not request this email, you can safely ignore it.</p>
        <p>Thanks,<br/>The ${config.appName} Team</p>
      </div>
    `;

		try {
			if (!config.email.enabled) {
				console.warn(
					"SMTP configuration is missing. Logging OTP to console instead of sending email."
				);
				console.info(
					`[Email OTP] recipient=${email}, otp=${otp}, expiresInMinutes=${expiresInMinutes}`
				);
				return;
			}

			const transporter = await this.getTransporter();
			await transporter.sendMail({
				from: config.email.from,
				to: email,
				subject,
				text,
				html,
			});
		} catch (error) {
			console.error("Failed to send OTP email:", error);
			throw new Error("Unable to send verification email");
		}
	}
}
