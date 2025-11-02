import React, { useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Dimensions,
	ActivityIndicator,
	Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../src/contexts/AuthContext";

const { height } = Dimensions.get("window");

export default function LandingPage() {
	const { isAuthenticated, isLoading } = useAuth();

	useEffect(() => {
		if (!isLoading && isAuthenticated) {
			router.replace("/(tabs)");
		}
	}, [isAuthenticated, isLoading]);

	const handleSignIn = () => {
		router.push("/auth/login");
	};

	if (isLoading) {
		return (
			<LinearGradient
				colors={["#EDE9FF", "#C4B5FD", "#0B1120"]}
				style={styles.gradient}
			>
				<SafeAreaView style={styles.loadingSafeArea}>
					<StatusBar style="light" />
					<ActivityIndicator size="large" color="#FFFFFF" />
				</SafeAreaView>
			</LinearGradient>
		);
	}

	if (isAuthenticated) {
		return null;
	}

	return (
		<LinearGradient
			colors={["#EDE9FF", "#C4B5FD", "#0B1120"]}
			locations={[0, 0.4, 1]}
			style={styles.gradient}
		>
			<StatusBar style="light" />
			<SafeAreaView style={styles.safeArea}>
				<View style={styles.topContent}>
					<View style={styles.logoContainer}>
						<View style={styles.logoBadge}>
							<View style={styles.logoFrame}>
								<Image
									source={require("../assets/images/icon2.png")}
									style={styles.logoImage}
									resizeMode="contain"
								/>
							</View>
						</View>
					</View>

					<View style={styles.headline}>
						<Text style={styles.welcomeTitle}>Welcome to MDC</Text>
						<Text style={styles.welcomeSubtitle}>
							Instant access to trusted home services whenever you need a helping
							hand.
						</Text>
					</View>
				</View>

				<View style={styles.buttonContainer}>
					<TouchableOpacity
						style={styles.primaryButton}
						onPress={handleSignIn}
						activeOpacity={0.85}
					>
						<Text style={styles.primaryButtonText}>Continue</Text>
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	gradient: {
		flex: 1,
	},
	safeArea: {
		flex: 1,
		width: "100%",
		justifyContent: "space-between",
	},
	loadingSafeArea: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	topContent: {
		flex: 1,
		paddingHorizontal: 28,
		justifyContent: "space-between",
		paddingBottom: 40,
	},
	logoContainer: {
		alignItems: "center",
		marginTop: height * 0.04,
	},
	logoBadge: {
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 16,
	},
	logoFrame: {
		width: 200,
		height: 200,
		borderRadius: 100,
		overflow: "hidden",
		justifyContent: "center",
		alignItems: "center",
	},
	logoImage: {
		width: "100%",
		height: "100%",
		borderRadius: 100,
	},
	headline: {
		alignItems: "center",
		paddingHorizontal: 16,
	},
	welcomeTitle: {
		fontSize: 32,
		fontWeight: "800",
		color: "#FFFFFF",
		marginBottom: 12,
	},
	welcomeSubtitle: {
		fontSize: 15,
		textAlign: "center",
		lineHeight: 22,
		color: "rgba(255,255,255,0.85)",
	},
	buttonContainer: {
		paddingHorizontal: 32,
		paddingBottom: 48,
		alignItems: "center",
	},
	primaryButton: {
		width: "100%",
		backgroundColor: "rgba(255,255,255,0.2)",
		paddingVertical: 18,
		borderRadius: 30,
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 1,
		borderColor: "rgba(255,255,255,0.6)",
	},
	primaryButtonText: {
		fontSize: 18,
		fontWeight: "700",
		color: "#FFFFFF",
		letterSpacing: 1.5,
		textTransform: "uppercase",
	},
});
