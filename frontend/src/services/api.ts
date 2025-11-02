import { API_CONFIG, getApiUrl } from "../config/api";

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
	refreshToken?: string;
}

export interface VerifyEmailOtpRequest {
	email: string;
	otp: string;
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
	updatedAt?: string;
}

export interface CreateServiceRequest {
	name: string;
	description?: string;
	price: number;
	serviceType?: string;
	durationMinutes?: number;
	availability?: boolean;
	timeSlots?: string;
}

export interface Booking {
	id: number;
	userId: number;
	serviceId: number;
	date: string;
	time: string;
	address: string;
	specialInstructions?: string;
	price: number;
	status: "upcoming" | "completed" | "cancelled";
	createdAt?: string;
}

export interface CreateBookingRequest {
	serviceId: number;
	date: string;
	time: string;
	address: string;
	specialInstructions?: string;
	price: number;
}

// Address type (follow backend schema)
export interface Address {
	id?: number;
	userId?: number;
	street: string;
	landmark?: string | null;
	apartment?: string | null;
	city: string;
	state: string;
	pinCode: string;
	country: string;
	latitude?: number | null;
	longitude?: number | null;
	isDefault?: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateAddressRequest {
	street: string;
	landmark?: string | null;
	apartment?: string | null;
	city: string;
	state: string;
	pinCode: string;
	country: string;
	latitude?: number | null;
	longitude?: number | null;
	isDefault?: boolean;
}

// Category type
export interface Category {
	id: number;
	name: string;
	description?: string;
	createdAt?: string;
	updatedAt?: string;
	// optional UI metadata
	icon?: string | null;
	color?: string | null;
	emoji?: string | null;
}

export interface ServiceType {
	id: number;
	categoryId: number;
	name: string;
	description?: string;
	createdAt?: string;
	updatedAt?: string;
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
					error:
						data.message || `HTTP ${response.status}: ${response.statusText}`,
				};
			}

			return {
				success: true,
				data,
			};
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error ? error.message : "Network error occurred",
			};
		}
	}

	// Authentication methods
	async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
		const res = await this.request<any>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
			method: "POST",
			body: JSON.stringify(credentials),
		});
		if (!res.success) return res;
		return {
			success: true,
			data: res.data?.data as AuthResponse,
		};
	}

	async register(
		userData: RegisterRequest
	): Promise<ApiResponse<AuthResponse>> {
		const res = await this.request<any>(API_CONFIG.ENDPOINTS.AUTH.REGISTER, {
			method: "POST",
			body: JSON.stringify(userData),
		});
		if (!res.success) return res;
		return {
			success: true,
			data: res.data?.data as AuthResponse,
		};
	}

	async verifyEmailOtp(
		payload: VerifyEmailOtpRequest
	): Promise<ApiResponse<AuthResponse>> {
		const res = await this.request<any>(
			API_CONFIG.ENDPOINTS.AUTH.VERIFY_EMAIL_OTP,
			{
				method: "POST",
				body: JSON.stringify(payload),
			}
		);
		if (!res.success) return res;
		return {
			success: true,
			data: res.data?.data as AuthResponse,
		};
	}

	async resendEmailOtp(email: string): Promise<ApiResponse> {
		return this.request(API_CONFIG.ENDPOINTS.AUTH.RESEND_EMAIL_OTP, {
			method: "POST",
			body: JSON.stringify({ email }),
		});
	}

	async logout(token: string): Promise<ApiResponse> {
		return this.request(API_CONFIG.ENDPOINTS.AUTH.LOGOUT, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
	}

	async getProfile(token: string): Promise<ApiResponse<User>> {
		const res = await this.request<any>(API_CONFIG.ENDPOINTS.AUTH.PROFILE, {
			method: "GET",
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

	// Services
	async listServices(
		limit = 50,
		offset = 0,
		filters?: { categoryId?: number; serviceTypeId?: number }
	): Promise<ApiResponse<Service[]>> {
		const params = new URLSearchParams({
			limit: String(limit),
			offset: String(offset),
		});
		if (filters?.categoryId != null)
			params.append("categoryId", String(filters.categoryId));
		if (filters?.serviceTypeId != null)
			params.append("serviceTypeId", String(filters.serviceTypeId));
		const res = await this.request<any>(
			`${API_CONFIG.ENDPOINTS.SERVICES.LIST}?${params.toString()}`,
			{
				method: "GET",
			}
		);
		if (!res.success) return res;
		return { success: true, data: res.data?.data as Service[] };
	}

	// Categories
	async listCategories(): Promise<ApiResponse<Category[]>> {
		// use the services meta endpoint which includes emoji metadata
		const res = await this.request<any>("/services/meta/categories", {
			method: "GET",
		});
		if (!res.success) return res;
		return { success: true, data: res.data?.data as Category[] };
	}

	// Service types
	async listServiceTypes(
		categoryId?: number
	): Promise<ApiResponse<ServiceType[]>> {
		const endpoint = categoryId
			? `/categories/${categoryId}/types`
			: `/categories/types`;
		const res = await this.request<any>(endpoint, { method: "GET" });
		if (!res.success) return res;
		return { success: true, data: res.data?.data as ServiceType[] };
	}

	// Services by service type (calls new backend route)
	async listServicesByType(
		typeId: number,
		limit = 50,
		offset = 0
	): Promise<ApiResponse<Service[]>> {
		const res = await this.request<any>(
			`/service-types/${typeId}/services?limit=${limit}&offset=${offset}`,
			{ method: "GET" }
		);
		if (!res.success) return res;
		return { success: true, data: res.data?.data as Service[] };
	}

	async getService(id: number): Promise<ApiResponse<Service>> {
		const res = await this.request<any>(
			API_CONFIG.ENDPOINTS.SERVICES.DETAIL(id),
			{
				method: "GET",
			}
		);
		if (!res.success) return res;
		return { success: true, data: res.data?.data as Service };
	}

	async createService(
		token: string,
		payload: CreateServiceRequest
	): Promise<ApiResponse<Service>> {
		const res = await this.request<any>(API_CONFIG.ENDPOINTS.SERVICES.CREATE, {
			method: "POST",
			headers: { Authorization: `Bearer ${token}` },
			body: JSON.stringify(payload),
		});
		if (!res.success) return res;
		return { success: true, data: res.data?.data as Service };
	}

	// Bookings
	async createBooking(
		token: string,
		payload: CreateBookingRequest
	): Promise<ApiResponse<Booking>> {
		const res = await this.request<any>("/bookings", {
			method: "POST",
			headers: { Authorization: `Bearer ${token}` },
			body: JSON.stringify(payload),
		});
		if (!res.success) return res;
		return { success: true, data: res.data?.data as Booking };
	}

	async listMyBookings(token: string): Promise<ApiResponse<Booking[]>> {
		const res = await this.request<any>("/bookings/me", {
			method: "GET",
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!res.success) return res;
		return { success: true, data: res.data?.data as Booking[] };
	}

	// Addresses
	async listMyAddresses(token: string): Promise<ApiResponse<Address[]>> {
		const res = await this.request<any>(`/addresses/me`, {
			method: "GET",
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!res.success) return res;
		return { success: true, data: res.data?.data as Address[] };
	}

	async createAddress(
		token: string,
		payload: CreateAddressRequest
	): Promise<ApiResponse<Address>> {
		const res = await this.request<any>(`/addresses`, {
			method: "POST",
			headers: { Authorization: `Bearer ${token}` },
			body: JSON.stringify(payload),
		});
		if (!res.success) return res;
		return { success: true, data: res.data?.data as Address };
	}

	async updateAddress(
		token: string,
		id: number,
		payload: Partial<CreateAddressRequest>
	): Promise<ApiResponse<Address>> {
		const res = await this.request<any>(`/addresses/${id}`, {
			method: "PUT",
			headers: { Authorization: `Bearer ${token}` },
			body: JSON.stringify(payload),
		});
		if (!res.success) return res;
		return { success: true, data: res.data?.data as Address };
	}

	async deleteAddress(
		token: string,
		id: number
	): Promise<ApiResponse<Address>> {
		const res = await this.request<any>(`/addresses/${id}`, {
			method: "DELETE",
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!res.success) return res;
		return { success: true, data: res.data?.data as Address };
	}

	// Health check
	async healthCheck(): Promise<ApiResponse> {
		return this.request("/", {
			method: "GET",
		});
	}
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
