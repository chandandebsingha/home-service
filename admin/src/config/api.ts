import { ENV, getApiUrl as getEnvApiUrl } from './environment';

export const API_CONFIG = {
  BASE_URL: ENV.API_BASE_URL,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      PROFILE: '/auth/profile',
    },
    ADMIN: {
      STATS: '/admin/stats',
    },
    SERVICES: {
      LIST: '/services',
      DETAIL: (id: number | string) => `/services/${id}`,
      CREATE: '/services',
      META: {
        CATEGORIES: '/services/meta/categories',
        TYPES: (categoryId?: number | string) => categoryId ? `/services/meta/types?categoryId=${categoryId}` : '/services/meta/types',
      },
    },
  },
  TIMEOUT: 10000,
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

export const getApiUrl = (endpoint: string): string => getEnvApiUrl(endpoint);


