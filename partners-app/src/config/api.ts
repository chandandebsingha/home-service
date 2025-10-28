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
    PROVIDER: {
      SERVICES: {
        LIST: "/provider/services",
        CREATE: "/provider/services",
        UPDATE: (id: number | string) => `/provider/services/${id}`,
        DELETE: (id: number | string) => `/provider/services/${id}`,
      },
      PARTNER: {
        BOOKINGS: {
          LIST: "/partner/bookings",
          UPDATE_STATUS: (id: number | string) =>
            `/partner/bookings/${id}/status`,
        },
      },
      BOOKINGS: {
        LIST: "/provider/bookings",
        UPDATE_STATUS: (id: number | string) =>
          `/provider/bookings/${id}/status`,
      },
      PROFILE: {
        GET: "/provider/profile",
        CREATE: "/provider/profile",
        UPDATE: "/provider/profile",
      },
    },
    // Partner-specific endpoints (top-level alias for partner/owner actions)
    PARTNER: {
      BOOKINGS: {
        LIST: "/partner/bookings",
        UPDATE_STATUS: (id: number | string) =>
          `/partner/bookings/${id}/status`,
      },
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
