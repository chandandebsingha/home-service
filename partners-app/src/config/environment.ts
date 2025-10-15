// Environment Configuration
const ensureApiSuffix = (base: string): string => {
    try {
        const url = new URL(base);
        // If path already contains '/api' at the end or beyond, keep as-is
        if (url.pathname.endsWith('/api') || url.pathname.includes('/api/')) {
            return base.replace(/\/$/, '');
        }
        // Otherwise, append '/api'
        url.pathname = url.pathname.replace(/\/$/, '') + '/api';
        return url.toString().replace(/\/$/, '');
    } catch {
        // Fallback naive handling
        if (/\/api\/?$/.test(base)) return base.replace(/\/$/, '');
        return (base.replace(/\/$/, '')) + '/api';
    }
};

const resolveBaseUrl = (): string => {
    // Explicit override wins
    if (process.env.EXPO_PUBLIC_API_BASE_URL)
        return ensureApiSuffix(process.env.EXPO_PUBLIC_API_BASE_URL);

	// On native devices in Expo Go, 'localhost' points to the device itself; use LAN IP
	try {
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const Constants = require("expo-constants").default;
		const debuggerHost: string | undefined =
			Constants.expoConfig?.hostUri || Constants.debuggerHost;
		if (debuggerHost) {
			const lanHost = debuggerHost.split(":")[0];
            if (lanHost && lanHost !== "localhost" && lanHost !== "127.0.0.1") {
                return `http://${lanHost}:3001/api`;
            }
		}
	} catch {}

	// Fallback for web or simulators
    return "http://localhost:3001/api";
};

export const ENV = {
	// API Configuration
	API_BASE_URL: resolveBaseUrl(),

	// Environment
	NODE_ENV: process.env.NODE_ENV || "development",
	IS_DEV: process.env.NODE_ENV === "development",

	// App Configuration
	APP_NAME: "Home Service App",
	VERSION: "1.0.0",
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
	return `${ENV.API_BASE_URL}${endpoint}`;
};
