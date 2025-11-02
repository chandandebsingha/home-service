import { ENV, getApiUrl as getEnvApiUrl } from "./environment";

// API Configuration
export const API_CONFIG = {
	// Base URL for the backend API
	BASE_URL: ENV.API_BASE_URL,

	// API Endpoints
	ENDPOINTS: {
		AUTH: {
			REGISTER: "/auth/register",
			LOGIN: "/auth/login",
			LOGOUT: "/auth/logout",
			PROFILE: "/auth/profile",
			VERIFY_EMAIL_OTP: "/auth/verify-email-otp",
			RESEND_EMAIL_OTP: "/auth/resend-email-otp",
		},
		SERVICES: {
			LIST: "/services",
			DETAIL: (id: number | string) => `/services/${id}`,
			CREATE: "/services",
			// legacy placeholders
			CATEGORIES: "/services/categories",
			PROVIDERS: "/services/providers",
			BOOKINGS: "/services/bookings",
		},
	},

	// Request timeout
	TIMEOUT: 10000,

	// Headers
	DEFAULT_HEADERS: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
	return getEnvApiUrl(endpoint);
};
