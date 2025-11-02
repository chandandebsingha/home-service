import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
	apiService,
	User,
	LoginRequest,
	RegisterRequest,
	AuthResponse,
	VerifyEmailOtpRequest,
} from "../services/api";

// Auth Context Types
interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	login: (
		credentials: LoginRequest
	) => Promise<{
		success: boolean;
		error?: string;
		requiresVerification?: boolean;
		email?: string;
	}>;
	register: (
		userData: RegisterRequest
	) => Promise<{
		success: boolean;
		error?: string;
		requiresVerification?: boolean;
		email?: string;
	}>;
	verifyEmailOtp: (
		payload: VerifyEmailOtpRequest
	) => Promise<{ success: boolean; error?: string }>;
	resendEmailOtp: (
		email: string
	) => Promise<{ success: boolean; error?: string }>;
	logout: () => Promise<void>;
	refreshUser: () => Promise<void>;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Props
interface AuthProviderProps {
	children: ReactNode;
}

// Storage Keys
const STORAGE_KEYS = {
	ACCESS_TOKEN: "access_token",
	REFRESH_TOKEN: "refresh_token",
	USER_DATA: "user_data",
};

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [accessToken, setAccessToken] = useState<string | null>(null);

	const isAuthenticated = !!user && !!accessToken;

	const persistAuthSession = async (authData: AuthResponse) => {
		if (!authData) {
			throw new Error("Invalid auth response from server");
		}

		const { user: userData, accessToken: token, refreshToken } = authData;

		if (!token || !userData) {
			throw new Error("Invalid server response (missing access token or user)");
		}

		await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
		if (refreshToken) {
			await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
		} else {
			await AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
		}
		await AsyncStorage.setItem(
			STORAGE_KEYS.USER_DATA,
			JSON.stringify(userData)
		);

		setAccessToken(token);
		setUser(userData);
	};

	// Initialize auth state on app start
	useEffect(() => {
		initializeAuth();
	}, []);

	const initializeAuth = async () => {
		try {
			setIsLoading(true);

			// Try to get stored tokens and user data
			const [storedToken, storedUser] = await Promise.all([
				AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
				AsyncStorage.getItem(STORAGE_KEYS.USER_DATA),
			]);

			if (storedToken && storedUser) {
				setAccessToken(storedToken);
				setUser(JSON.parse(storedUser));

				// Verify token is still valid by fetching profile
				const response = await apiService.getProfile(storedToken);
				if (response.success && response.data) {
					setUser(response.data);
					await AsyncStorage.setItem(
						STORAGE_KEYS.USER_DATA,
						JSON.stringify(response.data)
					);
				} else {
					// Token is invalid, clear storage
					await clearAuthData();
				}
			}
		} catch (error) {
			console.error("Auth initialization error:", error);
			await clearAuthData();
		} finally {
			setIsLoading(false);
		}
	};

	const clearAuthData = async () => {
		try {
			await Promise.all([
				AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
				AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
				AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA),
			]);
			setAccessToken(null);
			setUser(null);
		} catch (error) {
			console.error("Error clearing auth data:", error);
		}
	};

	const login = async (credentials: LoginRequest) => {
		try {
			setIsLoading(true);
			const response = await apiService.login(credentials);

			if (response.success && response.data) {
				const authData = response.data as AuthResponse;
				const userData = authData?.user;

				if (userData && userData.isEmailVerified === false) {
					await clearAuthData();
					const targetEmail = userData.email || credentials.email;
					if (targetEmail) {
						try {
							const otpResponse = await apiService.resendEmailOtp(targetEmail);
							if (!otpResponse.success) {
								console.error(
									"Failed to send OTP during login:",
									otpResponse.error
								);
							}
						} catch (otpError) {
							console.error("OTP send error during login:", otpError);
						}
					}
					return {
						success: false,
						requiresVerification: true,
						email: targetEmail,
						error: "Please verify your email to continue",
					};
				}

				if (authData) {
					await persistAuthSession(authData);
					return { success: true };
				}

				return { success: false, error: "Login failed" };
			} else {
				return { success: false, error: response.error || "Login failed" };
			}
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Login failed",
			};
		} finally {
			setIsLoading(false);
		}
	};

	const register = async (userData: RegisterRequest) => {
		try {
			setIsLoading(true);
			const response = await apiService.register(userData);

			if (response.success && response.data) {
				const authData = response.data as AuthResponse;
				const newUser = authData?.user;

				if (newUser && newUser.isEmailVerified === false) {
					await clearAuthData();
					return {
						success: true,
						requiresVerification: true,
						email: newUser.email || userData.email,
					};
				}

				if (authData) {
					await persistAuthSession(authData);
					return { success: true };
				}

				return {
					success: true,
					requiresVerification: true,
					email: newUser?.email || userData.email,
				};
			} else {
				return {
					success: false,
					error: response.error || "Registration failed",
				};
			}
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Registration failed",
			};
		} finally {
			setIsLoading(false);
		}
	};

	const verifyEmailOtp = async (payload: VerifyEmailOtpRequest) => {
		try {
			setIsLoading(true);
			const response = await apiService.verifyEmailOtp(payload);

			if (response.success && response.data) {
				await persistAuthSession(response.data as AuthResponse);
				return { success: true };
			}

			return {
				success: false,
				error: response.error || "OTP verification failed",
			};
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error ? error.message : "OTP verification failed",
			};
		} finally {
			setIsLoading(false);
		}
	};

	const resendEmailOtp = async (email: string) => {
		try {
			const response = await apiService.resendEmailOtp(email);
			if (response.success) {
				return { success: true };
			}
			return {
				success: false,
				error: response.error || "Failed to resend OTP",
			};
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Failed to resend OTP",
			};
		}
	};

	const logout = async () => {
		try {
			if (accessToken) {
				await apiService.logout(accessToken);
			}
		} catch (error) {
			console.error("Logout error:", error);
		} finally {
			await clearAuthData();
		}
	};

	const refreshUser = async () => {
		if (!accessToken) return;

		try {
			const response = await apiService.getProfile(accessToken);
			if (response.success && response.data) {
				setUser(response.data);
				await AsyncStorage.setItem(
					STORAGE_KEYS.USER_DATA,
					JSON.stringify(response.data)
				);
			}
		} catch (error) {
			console.error("Error refreshing user:", error);
		}
	};

	const value: AuthContextType = {
		user,
		isLoading,
		isAuthenticated,
		login,
		register,
		verifyEmailOtp,
		resendEmailOtp,
		logout,
		refreshUser,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

export default AuthContext;
