import * as dotenv from "dotenv";

dotenv.config();

// Required environment variables
const requiredEnvVars = [
	"SUPABASE_URL",
	"SUPABASE_ANON_KEY",
	"SUPABASE_SERVICE_ROLE_KEY",
	"JWT_SECRET",
	"DATABASE_URL",
];

// Validate required environment variables
for (const envVar of requiredEnvVars) {
	if (!process.env[envVar]) {
		throw new Error(`Missing required environment variable: ${envVar}`);
	}
}

const parseBoolean = (value?: string) => {
	if (!value) return false;
	return ["true", "1", "yes", "y"].includes(value.toLowerCase());
};

const smtpPortRaw = process.env.SMTP_PORT;
let smtpPort = 587;
if (smtpPortRaw) {
	const parsed = Number.parseInt(smtpPortRaw, 10);
	if (Number.isNaN(parsed)) {
		throw new Error("Invalid SMTP_PORT value. It must be a number.");
	}
	smtpPort = parsed;
}

const smtpHost = process.env.SMTP_HOST;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const emailFrom = process.env.EMAIL_FROM;
const smtpSecure = parseBoolean(process.env.SMTP_SECURE);
const emailEnabled = Boolean(smtpHost && smtpUser && smtpPass && emailFrom);

export const config = {
	// Supabase
	supabaseUrl: process.env.SUPABASE_URL!,
	supabaseAnonKey: process.env.SUPABASE_ANON_KEY!,
	supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,

	// Database
	databaseUrl: process.env.DATABASE_URL!,

	// JWT
	jwtSecret: process.env.JWT_SECRET!,
	accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || "1h",
	refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || "7d",

	// Server
	port: parseInt(process.env.PORT || "3001", 10),
	nodeEnv: process.env.NODE_ENV || "development",

	// App
	appName: process.env.APP_NAME || "Home Service App",

	// Email
	email: {
		enabled: emailEnabled,
		host: smtpHost || "",
		port: smtpPort,
		secure: smtpSecure,
		user: smtpUser || "",
		pass: smtpPass || "",
		from: emailFrom || "",
	},
};
