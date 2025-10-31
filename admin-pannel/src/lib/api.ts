export interface ApiResponse<T = any> {
	success: boolean;
	data?: T;
	message?: string;
	error?: string;
}

const resolveBaseUrl = (): string => {
	if (process.env.NEXT_PUBLIC_API_BASE_URL)
		return process.env.NEXT_PUBLIC_API_BASE_URL;
	// Default to local backend
	return "http://localhost:3001/api";
};

export const API = {
	BASE_URL: resolveBaseUrl(),
	ENDPOINTS: {
		HEALTH: "/",
		AUTH: {
			LOGIN: "/auth/login",
			REGISTER: "/auth/register",
			PROFILE: "/auth/profile",
			LOGOUT: "/auth/logout",
		},
		ADMIN: {
			STATS: "/admin/stats",
			PROVIDERS: {
				LIST: "/admin/provider-profiles",
				VERIFY: (id: number) => `/admin/provider-profiles/${id}/verify`,
			},
		},
		SERVICES: {
			LIST: "/services",
			DETAIL: (id: number) => `/services/${id}`,
		},
		BOOKINGS: {
			LIST: "/bookings/me",
		},
		PROVIDER: {
			SERVICES: {
				LIST: "/provider/services",
				CREATE: "/provider/services",
				UPDATE: (id: number) => `/provider/services/${id}`,
				DELETE: (id: number) => `/provider/services/${id}`,
			},
			BOOKINGS: {
				LIST: "/provider/bookings",
				UPDATE_STATUS: (id: number) => `/provider/bookings/${id}/status`,
			},
		},
	},
	DEFAULT_HEADERS: {
		"Content-Type": "application/json",
		Accept: "application/json",
	} as Record<string, string>,
};

export const getApiUrl = (endpoint: string): string =>
	`${API.BASE_URL}${endpoint}`;

export async function apiGet<T>(
	endpoint: string,
	token?: string
): Promise<ApiResponse<T>> {
	try {
		const res = await fetch(getApiUrl(endpoint), {
			method: "GET",
			headers: {
				...API.DEFAULT_HEADERS,
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
			cache: "no-store",
		});
		const json = await res.json();
		if (!res.ok) {
			return { success: false, error: json?.message || `HTTP ${res.status}` };
		}
		return { success: true, data: json?.data ?? json };
	} catch (e: any) {
		return { success: false, error: e?.message || "Network error" };
	}
}

export async function apiHealth(): Promise<ApiResponse> {
	return apiGet(API.ENDPOINTS.HEALTH);
}

export interface AdminStatsResponse {
	counts: { users: number; services: number; bookings: number };
	recent: {
		bookings: Array<{
			id: number;
			date: string;
			time: string;
			price: number;
			createdAt?: string;
		}>;
		services: Array<{
			id: number;
			name: string;
			price: number;
			serviceType?: string;
			createdAt?: string;
		}>;
	};
}

export async function getAdminStats(
	token?: string
): Promise<ApiResponse<AdminStatsResponse>> {
	return apiGet(API.ENDPOINTS.ADMIN.STATS, token);
}

// Provider profiles (admin)
export interface ProviderProfileDTO {
	id: number;
	userId: number;
	occupationId?: number | null;
	businessName?: string | null;
	businessAddress?: string | null;
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

export async function adminListProviderProfiles(
	token: string
): Promise<ApiResponse<ProviderProfileDTO[]>> {
	return apiGet(API.ENDPOINTS.ADMIN.PROVIDERS.LIST, token);
}

export async function adminVerifyProviderProfile(
	token: string,
	id: number
): Promise<ApiResponse<ProviderProfileDTO>> {
	return apiPost(API.ENDPOINTS.ADMIN.PROVIDERS.VERIFY(id), {}, token);
}

// Auth types
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

// Auth API functions
export async function apiPost<T>(
	endpoint: string,
	data: any,
	token?: string
): Promise<ApiResponse<T>> {
	try {
		const res = await fetch(getApiUrl(endpoint), {
			method: "POST",
			headers: {
				...API.DEFAULT_HEADERS,
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
			body: JSON.stringify(data),
			cache: "no-store",
		});
		const json = await res.json();
		if (!res.ok) {
			return { success: false, error: json?.message || `HTTP ${res.status}` };
		}
		return { success: true, data: json?.data ?? json };
	} catch (e: any) {
		return { success: false, error: e?.message || "Network error" };
	}
}

export async function login(
	credentials: LoginRequest
): Promise<ApiResponse<AuthResponse>> {
	return apiPost(API.ENDPOINTS.AUTH.LOGIN, credentials);
}

export async function register(
	userData: RegisterRequest
): Promise<ApiResponse<AuthResponse>> {
	return apiPost(API.ENDPOINTS.AUTH.REGISTER, userData);
}

export async function getProfile(token: string): Promise<ApiResponse<User>> {
	return apiGet(API.ENDPOINTS.AUTH.PROFILE, token);
}

export async function logout(token: string): Promise<ApiResponse> {
	return apiPost(API.ENDPOINTS.AUTH.LOGOUT, {}, token);
}

// Data types for comprehensive dashboard
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

// Additional API functions for comprehensive data
export async function getAllServices(
	token?: string
): Promise<ApiResponse<Service[]>> {
	return apiGet(API.ENDPOINTS.SERVICES.LIST, token);
}

export async function getService(
	id: number,
	token?: string
): Promise<ApiResponse<Service>> {
	return apiGet(API.ENDPOINTS.SERVICES.DETAIL(id), token);
}

export async function getAllBookings(
	token: string
): Promise<ApiResponse<Booking[]>> {
	return apiGet(API.ENDPOINTS.BOOKINGS.LIST, token);
}

// Provider API functions
export async function getMyServices(
	token: string
): Promise<ApiResponse<Service[]>> {
	return apiGet(API.ENDPOINTS.PROVIDER.SERVICES.LIST, token);
}

export async function createMyService(
	token: string,
	serviceData: CreateServiceRequest
): Promise<ApiResponse<Service>> {
	return apiPost(API.ENDPOINTS.PROVIDER.SERVICES.CREATE, serviceData, token);
}

export async function updateMyService(
	token: string,
	serviceId: number,
	serviceData: Partial<CreateServiceRequest>
): Promise<ApiResponse<Service>> {
	return apiPost(
		API.ENDPOINTS.PROVIDER.SERVICES.UPDATE(serviceId),
		serviceData,
		token
	);
}

export async function deleteMyService(
	token: string,
	serviceId: number
): Promise<ApiResponse> {
	return apiPost(API.ENDPOINTS.PROVIDER.SERVICES.DELETE(serviceId), {}, token);
}

export async function getMyBookings(
	token: string
): Promise<ApiResponse<Booking[]>> {
	return apiGet(API.ENDPOINTS.PROVIDER.BOOKINGS.LIST, token);
}

export async function updateBookingStatus(
	token: string,
	bookingId: number,
	status: string
): Promise<ApiResponse<Booking>> {
	return apiPost(
		API.ENDPOINTS.PROVIDER.BOOKINGS.UPDATE_STATUS(bookingId),
		{ status },
		token
	);
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
