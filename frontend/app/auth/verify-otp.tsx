import React, { useEffect, useMemo, useRef, useState } from "react";
import {
	Alert,
	KeyboardAvoidingView,
	Pressable,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../src/contexts/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

const RESEND_INTERVAL_SECONDS = 60;
const OTP_LENGTH = 6;

export default function VerifyOtpScreen() {
	const { verifyEmailOtp, resendEmailOtp, isLoading } = useAuth();
	const params = useLocalSearchParams<{ email?: string | string[] }>();

	const initialEmail = useMemo(() => {
		const emailParam = params?.email;
		if (Array.isArray(emailParam)) {
			return emailParam[0] || "";
		}
		return emailParam || "";
	}, [params]);

	const [email] = useState(initialEmail);
	const [otp, setOtp] = useState("");
	const [resendTimer, setResendTimer] = useState(0);
	const [isResending, setIsResending] = useState(false);
	const inputRef = useRef<TextInput>(null);

	// Ensure the hidden input focuses on mount to trigger the keyboard reliably in Expo Go
	useEffect(() => {
		const t = setTimeout(() => inputRef.current?.focus(), 250);
		return () => clearTimeout(t);
	}, []);

	useEffect(() => {
		if (email) {
			setResendTimer(RESEND_INTERVAL_SECONDS);
		}
	}, [email]);

	useEffect(() => {
		if (resendTimer <= 0) {
			return;
		}

		const timer = setInterval(() => {
			setResendTimer((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(timer);
	}, [resendTimer]);

	const handleVerify = async () => {
		if (!email) {
			Alert.alert(
				"Missing Email",
				"We could not determine which email to verify. Please register again."
			);
			return;
		}

		const trimmedOtp = otp.trim();
		if (trimmedOtp.length < 4) {
			Alert.alert("Invalid OTP", "Enter the code sent to your email.");
			return;
		}

		const result = await verifyEmailOtp({ email, otp: trimmedOtp });
		if (result.success) {
			router.replace("/(tabs)");
		} else {
			Alert.alert(
				"Verification Failed",
				result.error || "Invalid or expired code. Please try again."
			);
		}
	};

	const handleResend = async () => {
		if (!email) {
			Alert.alert(
				"Cannot Resend",
				"Email address is missing. Please go back and register again."
			);
			return;
		}

		try {
			setIsResending(true);
			const result = await resendEmailOtp(email);
			if (result.success) {
				setResendTimer(RESEND_INTERVAL_SECONDS);
				Alert.alert("OTP sent", "We have sent a fresh code to your email.");
			} else {
				Alert.alert(
					"Resend failed",
					result.error || "Unable to send a new OTP right now."
				);
			}
		} finally {
			setIsResending(false);
		}
	};

	const disableResend = isResending || resendTimer > 0;

	return (
		<SafeAreaView style={styles.container}>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				style={styles.flex}
			>
				<ScrollView
					contentContainerStyle={styles.scrollContent}
					keyboardShouldPersistTaps={"handled"}
				>
					<View style={styles.illustrationContainer}>
						<View style={styles.illustrationBubble}>
							<Text style={styles.illustrationEmoji}>✉️</Text>
						</View>
					</View>

					<Text style={styles.title}>OTP Verification</Text>
					<Text style={styles.description}>
						Enter the OTP sent to{" "}
						<Text style={styles.emailText}>{email || "your email"}.</Text>
					</Text>

					<View style={styles.otpInputWrapper}>
						<Pressable
							accessible
							accessibilityLabel={"OTP input"}
							onPress={() => {
								// Small delay can help ensure keyboard shows on some Android devices
								setTimeout(() => inputRef.current?.focus(), 50);
							}}
							style={styles.otpBoxes}
						>
							{Array.from({ length: OTP_LENGTH }).map((_, index) => {
								const digit = otp[index] || "";
								const isActive = index === Math.min(otp.length, OTP_LENGTH - 1);
								return (
									<View
										key={index}
										style={[styles.otpBox, isActive && styles.otpBoxActive]}
									>
										<Text style={styles.otpDigit}>{digit}</Text>
									</View>
								);
							})}
						</Pressable>
						<TextInput
							ref={inputRef}
							value={otp}
							onChangeText={(value) =>
								setOtp(value.replace(/[^0-9]/g, "").slice(0, OTP_LENGTH))
							}
							keyboardType={Platform.OS === "ios" ? "number-pad" : "numeric"}
							returnKeyType="done"
							style={styles.hiddenInput}
							maxLength={OTP_LENGTH}
							autoFocus
							showSoftInputOnFocus={true}
							caretHidden={false}
							autoCorrect={false}
							underlineColorAndroid="transparent"
							textContentType={Platform.OS === "ios" ? "oneTimeCode" : "none"}
						/>
					</View>

					<TouchableOpacity
						style={[styles.verifyButton, isLoading && styles.buttonDisabled]}
						onPress={handleVerify}
						disabled={isLoading}
					>
						<Text style={styles.verifyButtonText}>
							{isLoading ? "Verifying..." : "Verify & Proceed"}
						</Text>
					</TouchableOpacity>

					<View style={styles.resendContainer}>
						<Text style={styles.resendText}>Don't receive the OTP?</Text>
						<TouchableOpacity onPress={handleResend} disabled={disableResend}>
							<Text
								style={[
									styles.resendLink,
									disableResend && styles.resendLinkDisabled,
								]}
							>
								{disableResend && resendTimer > 0
									? `Resend in ${resendTimer}s`
									: "Resend OTP"}
							</Text>
						</TouchableOpacity>
					</View>

					<TouchableOpacity
						style={styles.backButton}
						onPress={() => router.replace("/auth/login")}
					>
						<Text style={styles.backButtonText}>Back to Sign In</Text>
					</TouchableOpacity>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f7f8fc",
	},
	flex: {
		flex: 1,
	},
	scrollContent: {
		flexGrow: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 24,
		paddingVertical: 48,
	},
	illustrationContainer: {
		marginBottom: 32,
		alignItems: "center",
	},
	illustrationBubble: {
		width: 120,
		height: 120,
		borderRadius: 60,
		backgroundColor: "#ede9fe",
		justifyContent: "center",
		alignItems: "center",
		shadowColor: "#6366f1",
		shadowOffset: { width: 0, height: 18 },
		shadowOpacity: 0.15,
		shadowRadius: 24,
		elevation: 10,
	},
	illustrationEmoji: {
		fontSize: 46,
	},
	title: {
		fontSize: 24,
		fontWeight: "700",
		color: "#111827",
		textAlign: "center",
	},
	description: {
		marginTop: 12,
		fontSize: 15,
		color: "#4b5563",
		textAlign: "center",
		lineHeight: 22,
	},
	emailText: {
		fontWeight: "600",
		color: "#4c1d95",
	},
	otpInputWrapper: {
		marginTop: 32,
		marginBottom: 32,
		width: "100%",
		maxWidth: 360,
	},
	otpBoxes: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignSelf: "center",
		width: "100%",
	},
	otpBox: {
		width: 48,
		height: 56,
		borderBottomWidth: 2,
		borderColor: "#d1d5db",
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#fff",
		borderRadius: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.05,
		shadowRadius: 12,
		elevation: 6,
	},
	otpBoxActive: {
		borderColor: "#6366f1",
	},
	otpDigit: {
		fontSize: 22,
		fontWeight: "700",
		color: "#111827",
	},
	hiddenInput: {
		position: "absolute",
		opacity: 0,
		width: 1,
		height: 1,
	},
	verifyButton: {
		backgroundColor: "#6366f1",
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: "center",
		marginTop: 12,
		width: "100%",
		maxWidth: 340,
		alignSelf: "center",
	},
	verifyButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "700",
	},
	buttonDisabled: {
		backgroundColor: "#9ca3af",
	},
	resendContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginTop: 24,
		alignItems: "center",
	},
	resendText: {
		fontSize: 14,
		color: "#6b7280",
	},
	resendLink: {
		fontSize: 14,
		color: "#6366f1",
		fontWeight: "700",
		marginLeft: 6,
	},
	resendLinkDisabled: {
		color: "#9ca3af",
	},
	backButton: {
		marginTop: 32,
		alignItems: "center",
	},
	backButtonText: {
		fontSize: 15,
		color: "#1f2937",
		fontWeight: "600",
		textDecorationLine: "underline",
	},
});
