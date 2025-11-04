export interface LoginRequest {
	email: string;
	password: string;
}

export interface RegisterRequest {
	email: string;
	password: string;
	fullName: string;
}

export interface AuthResponse {
	success: boolean;
	message: string;
	data?: {
		user: UserProfile;
		accessToken: string;
		refreshToken?: string;
	};
	error?: string;
}

export interface UserProfile {
	id: number;
	email: string;
	fullName: string;
	role: string;
	isEmailVerified?: boolean;
	createdAt?: Date;
	lastLogin?: Date;
}

export interface JwtPayload {
	userId: number;
	email: string;
	role: string;
	iat?: number;
	exp?: number;
}

export interface ApiResponse<T = any> {
	success: boolean;
	message: string;
	data?: T;
	error?: string;
}
