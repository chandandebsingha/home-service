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
	refreshToken: string;
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

// Provider profile types
export interface Occupation {
	id: number;
	name: string;
	description?: string | null;
	isActive?: boolean;
}

export interface ProviderProfile {
	id: number;
	userId: number;
	occupationId?: number | null;
	businessName?: string | null;
	businessAddress?: string | null; // Legacy field
	addressId?: number | null; // New field for relational address
	phoneNumber?: string | null;
	experience?: string | null;
	skills?: string[] | null;
	certifications?: string[] | null;
	bio?: string | null;
	isVerified: boolean;
	isActive: boolean;
	createdAt?: string;
	updatedAt?: string;
	user?: { id: number; fullName: string; email: string };
	occupation?: { id: number; name: string; description?: string | null } | null;
}

export interface CreateProviderProfileRequest {
	occupationId?: number;
	businessName?: string;
	businessAddress?: string; // Legacy field for backward compatibility
	addressId?: number; // New field for relational address
	phoneNumber?: string;
	experience?: string;
	skills?: string[];
	certifications?: string[];
	bio?: string;
}

export interface CreateServiceRequest {
	name: string;
	description?: string;
	price: number;
	serviceType?: string;
	serviceTypeId?: number;
	categoryId?: number;
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

export interface Address {
	id?: number;
	userId?: number;
	street: string;
	apartment?: string;
	landmark?: string;
	city: string;
	state: string;
	pinCode: string;
	country: string;
	latitude?: number | string;
	longitude?: number | string;
	isDefault?: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateAddressRequest {
	street: string;
	apartment?: string;
	landmark?: string;
	city: string;
	state: string;
	pinCode: string;
	country: string;
	latitude?: number;
	longitude?: number;
	isDefault?: boolean;
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
			const contentType = response.headers.get("content-type") || "";
			const rawText = await response.text();
			let parsed: any = null;
			if (
				contentType.includes("application/json") ||
				rawText.trim().startsWith("{") ||
				rawText.trim().startsWith("[")
			) {
				try {
					parsed = JSON.parse(rawText);
				} catch (err) {
					return {
						success: false,
						error: `Invalid JSON response (HTTP ${response.status}) for ${url}.`,
					};
				}
			} else {
				if (!response.ok) {
					const snippet = rawText?.slice(0, 120) || "";
					return {
						success: false,
						error: `HTTP ${response.status} ${response.statusText} at ${url}${
							snippet ? ` - ${snippet}` : ""
						}`,
					};
				}
				// Unexpected non-JSON success; surface minimal info
				return {
					success: false,
					error: `Unexpected non-JSON response from server at ${url}.`,
				};
			}

			if (!response.ok) {
				return {
					success: false,
					// Prefer `error` (used by backend), then `message`, then a generic HTTP fallback
					error:
						parsed?.error ||
						parsed?.message ||
						`HTTP ${response.status}: ${response.statusText} at ${url}`,
				};
			}

			return {
				success: true,
				data: parsed,
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
		const res = await this.request<any>(
			API_CONFIG.ENDPOINTS.PROVIDER.SERVICES.CREATE,
			{
				method: "POST",
				headers: { Authorization: `Bearer ${token}` },
				body: JSON.stringify(payload),
			}
		);
		if (!res.success) return res;
		return { success: true, data: res.data?.data as Service };
	}

	async listMyServices(token: string): Promise<ApiResponse<Service[]>> {
		const res = await this.request<any>(
			API_CONFIG.ENDPOINTS.PROVIDER.SERVICES.LIST,
			{
				method: "GET",
				headers: { Authorization: `Bearer ${token}` },
			}
		);
		if (!res.success) return res;
		return { success: true, data: res.data?.data as Service[] };
	}

	async updateMyService(
		token: string,
		id: number,
		payload: Partial<CreateServiceRequest>
	): Promise<ApiResponse<Service>> {
		const res = await this.request<any>(
			API_CONFIG.ENDPOINTS.PROVIDER.SERVICES.UPDATE(id),
			{
				method: "PUT",
				headers: { Authorization: `Bearer ${token}` },
				body: JSON.stringify(payload),
			}
		);
		if (!res.success) return res;
		return { success: true, data: res.data?.data as Service };
	}

	async deleteMyService(token: string, id: number): Promise<ApiResponse> {
		return this.request(API_CONFIG.ENDPOINTS.PROVIDER.SERVICES.DELETE(id), {
			method: "DELETE",
			headers: { Authorization: `Bearer ${token}` },
		});
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
		const res = await this.request<any>(
			API_CONFIG.ENDPOINTS.PROVIDER.BOOKINGS.LIST,
			{
				method: "GET",
				headers: { Authorization: `Bearer ${token}` },
			}
		);
		if (!res.success) return res;
		return { success: true, data: res.data?.data as Booking[] };
	}

	// Partner-specific bookings (for users with partner role)
	async listPartnerBookings(token: string): Promise<ApiResponse<Booking[]>> {
		const res = await this.request<any>(
			API_CONFIG.ENDPOINTS.PARTNER.BOOKINGS.LIST,
			{
				method: "GET",
				headers: { Authorization: `Bearer ${token}` },
			}
		);
		if (!res.success) return res;
		return { success: true, data: res.data?.data as Booking[] };
	}

	async updateBookingStatus(
		token: string,
		id: number,
		status: string
	): Promise<ApiResponse<Booking>> {
		const res = await this.request<any>(
			API_CONFIG.ENDPOINTS.PROVIDER.BOOKINGS.UPDATE_STATUS(id),
			{
				method: "PUT",
				headers: { Authorization: `Bearer ${token}` },
				body: JSON.stringify({ status }),
			}
		);
		if (!res.success) return res;
		return { success: true, data: res.data?.data as Booking };
	}

	// Partner update booking status (partners can update bookings for their services)
	async updatePartnerBookingStatus(
		token: string,
		id: number,
		status: string
	): Promise<ApiResponse<Booking>> {
		const res = await this.request<any>(
			API_CONFIG.ENDPOINTS.PARTNER.BOOKINGS.UPDATE_STATUS(id),
			{
				method: "PUT",
				headers: { Authorization: `Bearer ${token}` },
				body: JSON.stringify({ status }),
			}
		);
		if (!res.success) return res;
		return { success: true, data: res.data?.data as Booking };
	}

	// Health check
	async healthCheck(): Promise<ApiResponse> {
		return this.request("/", {
			method: "GET",
		});
	}

	// Provider profile
	async getProviderProfile(
		token: string
	): Promise<ApiResponse<ProviderProfile>> {
		const res = await this.request<any>(
			API_CONFIG.ENDPOINTS.PROVIDER.PROFILE.GET,
			{
				method: "GET",
				headers: { Authorization: `Bearer ${token}` },
			}
		);
		if (!res.success) return res;
		return { success: true, data: res.data?.data as ProviderProfile };
	}

	async createProviderProfile(
		token: string,
		payload: CreateProviderProfileRequest
	): Promise<ApiResponse<ProviderProfile>> {
		const res = await this.request<any>(
			API_CONFIG.ENDPOINTS.PROVIDER.PROFILE.CREATE,
			{
				method: "POST",
				headers: { Authorization: `Bearer ${token}` },
				body: JSON.stringify(payload),
			}
		);
		if (!res.success) return res;
		return { success: true, data: res.data?.data as ProviderProfile };
	}

	async updateProviderProfile(
		token: string,
		payload: Partial<CreateProviderProfileRequest>
	): Promise<ApiResponse<ProviderProfile>> {
		const res = await this.request<any>(
			API_CONFIG.ENDPOINTS.PROVIDER.PROFILE.UPDATE,
			{
				method: "PUT",
				headers: { Authorization: `Bearer ${token}` },
				body: JSON.stringify(payload),
			}
		);
		if (!res.success) return res;
		return { success: true, data: res.data?.data as ProviderProfile };
	}

	// Public reference data
	async listPublicOccupations(): Promise<ApiResponse<Occupation[]>> {
		const res = await this.request<any>("/public/occupations", {
			method: "GET",
		});
		if (!res.success) return res;
		return { success: true, data: res.data?.data as Occupation[] };
	}

	// Address management
	async createAddress(
		token: string,
		payload: CreateAddressRequest
	): Promise<ApiResponse<Address>> {
		const res = await this.request<any>("/addresses", {
			method: "POST",
			headers: { Authorization: `Bearer ${token}` },
			body: JSON.stringify(payload),
		});
		if (!res.success) return res;
		return { success: true, data: res.data?.data as Address };
	}

	async listMyAddresses(token: string): Promise<ApiResponse<Address[]>> {
		const res = await this.request<any>("/addresses", {
			method: "GET",
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!res.success) return res;
		return { success: true, data: res.data?.data as Address[] };
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

	async deleteAddress(token: string, id: number): Promise<ApiResponse> {
		return this.request(`/addresses/${id}`, {
			method: "DELETE",
			headers: { Authorization: `Bearer ${token}` },
		});
	}
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
