import { API_CONFIG, getApiUrl } from '../config/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface LoginRequest { email: string; password: string }

export interface User {
  id: number;
  email: string;
  fullName: string;
  role?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  serviceType?: string;
  categoryId?: number;
  serviceTypeId?: number;
  durationMinutes?: number;
  availability: boolean;
  timeSlots?: string;
  createdAt?: string;
}

export interface CreateServiceRequest {
  name: string;
  description?: string;
  price: number;
  serviceType?: string;
  categoryId?: number;
  serviceTypeId?: number;
  durationMinutes?: number;
  availability?: boolean;
  timeSlots?: string;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = getApiUrl(endpoint);
    const config: RequestInit = {
      ...options,
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        ...options.headers,
      },
    };
    try {
      const res = await fetch(url, config);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) return { success: false, error: json?.error || res.statusText };
      return { success: true, data: json?.data as T };
    } catch (e: any) {
      return { success: false, error: e?.message || 'Network error' };
    }
  }

  async login(body: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const res = await this.request<any>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, { method: 'POST', body: JSON.stringify(body) });
    if (!res.success) return res;
    return { success: true, data: res.data as AuthResponse };
  }

  async profile(token: string): Promise<ApiResponse<User>> {
    const res = await this.request<any>(API_CONFIG.ENDPOINTS.AUTH.PROFILE, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.success) return res;
    return { success: true, data: res.data as User };
  }

  async adminStats(token: string): Promise<ApiResponse<any>> {
    return this.request<any>(API_CONFIG.ENDPOINTS.ADMIN.STATS, { headers: { Authorization: `Bearer ${token}` } });
  }

  async listServices(): Promise<ApiResponse<Service[]>> {
    const res = await this.request<any>(API_CONFIG.ENDPOINTS.SERVICES.LIST, { method: 'GET' });
    if (!res.success) return res;
    return { success: true, data: res.data as Service[] };
  }

  async createService(token: string, payload: CreateServiceRequest): Promise<ApiResponse<Service>> {
    const res = await this.request<any>(API_CONFIG.ENDPOINTS.SERVICES.CREATE, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    if (!res.success) return res;
    return { success: true, data: res.data as Service };
  }

  async listCategories(): Promise<ApiResponse<any[]>> {
    const res = await this.request<any>(API_CONFIG.ENDPOINTS.SERVICES.META.CATEGORIES, { method: 'GET' });
    if (!res.success) return res;
    return { success: true, data: res.data as any[] };
  }

  async listServiceTypes(categoryId?: number): Promise<ApiResponse<any[]>> {
    const endpoint = API_CONFIG.ENDPOINTS.SERVICES.META.TYPES(categoryId);
    const res = await this.request<any>(endpoint, { method: 'GET' });
    if (!res.success) return res;
    return { success: true, data: res.data as any[] };
  }

  async createCategory(token: string, payload: { name: string; description?: string }): Promise<ApiResponse<any>> {
    const res = await this.request<any>(API_CONFIG.ENDPOINTS.SERVICES.META.CATEGORIES, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    if (!res.success) return res;
    return { success: true, data: res.data as any };
  }

  async createServiceType(token: string, payload: { name: string; description?: string; categoryId: number }): Promise<ApiResponse<any>> {
    const endpoint = API_CONFIG.ENDPOINTS.SERVICES.META.TYPES();
    const res = await this.request<any>(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    if (!res.success) return res;
    return { success: true, data: res.data as any };
  }
}

export const api = new ApiService();


