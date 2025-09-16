import { API_CONFIG, getApiUrl } from '../config/api';

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  role?: string;
  isEmailVerified?: boolean;
  lastLogin?: string | null;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// API Service Class
class ApiService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // Generic request method (returns parsed JSON as-is)
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = getApiUrl(endpoint);
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  // Authentication methods
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const res = await this.request<any>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (!res.success) return res;
    return {
      success: true,
      data: res.data?.data as AuthResponse,
    };
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const res = await this.request<any>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (!res.success) return res;
    return {
      success: true,
      data: res.data?.data as AuthResponse,
    };
  }

  async logout(token: string): Promise<ApiResponse> {
    return this.request(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async getProfile(token: string): Promise<ApiResponse<User>> {
    const res = await this.request<any>(API_CONFIG.ENDPOINTS.AUTH.PROFILE, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.success) return res;
    return {
      success: true,
      data: res.data?.data as User,
    };
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/', {
      method: 'GET',
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
