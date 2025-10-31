import React, { useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ImageBackground,
	Dimensions,
	ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../src/contexts/AuthContext";

const { width, height } = Dimensions.get("window");

export default function LandingPage() {
	const { isAuthenticated, isLoading } = useAuth();

	useEffect(() => {
		// If user is already logged in, redirect to home page
		if (!isLoading && isAuthenticated) {
			router.replace("/(tabs)");
		}
	}, [isAuthenticated, isLoading]);

	const handleContinue = () => {
		router.push("/auth/login");
	};

	// Show loading spinner while checking authentication
	if (isLoading) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#6366F1" />
				</View>
			</SafeAreaView>
		);
	}

	// Don't render landing page if user is authenticated (will redirect)
	if (isAuthenticated) {
		return null;
	}

	return (
		<SafeAreaView style={styles.container}>
			<LinearGradient
				colors={["#E8F4F8", "#F0F9FF", "#FFFFFF"]}
				style={styles.gradient}
			>
				{/* Header Section */}
				<View style={styles.header}>
					<Text style={styles.headerBadge}>TRUSTED EXPERTS</Text>
					<Text style={styles.title}>Best Helping</Text>
					<Text style={styles.title}>Hand for You</Text>
					<Text style={styles.subtitle}>
						We make sure excellent services{"\n"}thought our expert worker.
					</Text>
				</View>

				{/* Hero Image Section */}
				<View style={styles.heroContainer}>
					<View style={styles.imageWrapper}>
						{/* Placeholder for service provider image */}
						<View style={styles.heroImage}>
							<MaterialIcons name="engineering" size={180} color="#1E3A8A" />
						</View>

						{/* Stats Badges */}
						<View style={styles.statBadge1}>
							<View style={styles.statIcon}>
								<MaterialIcons name="business" size={16} color="#6366F1" />
							</View>
							<View style={styles.statContent}>
								<Text style={styles.statNumber}>25+</Text>
								<Text style={styles.statLabel}>Service Category</Text>
							</View>
						</View>

						<View style={styles.statBadge2}>
							<View style={styles.statIconOrange}>
								<MaterialIcons name="stars" size={16} color="#F97316" />
							</View>
							<View style={styles.statContent}>
								<Text style={styles.statNumber}>3999+</Text>
								<Text style={styles.statLabel}>Expert Worker</Text>
							</View>
						</View>

						<View style={styles.statBadge3}>
							<View style={styles.statIconGreen}>
								<MaterialIcons name="groups" size={16} color="#10B981" />
							</View>
							<View style={styles.statContent}>
								<Text style={styles.statNumber}>2000+</Text>
								<Text style={styles.statLabel}>Expert Worker</Text>
							</View>
						</View>
					</View>
				</View>

				{/* Continue Button */}
				<View style={styles.buttonContainer}>
					<TouchableOpacity
						style={styles.continueButton}
						onPress={handleContinue}
						activeOpacity={0.8}
					>
						<Text style={styles.continueButtonText}>Continue</Text>
						<View style={styles.arrowCircle}>
							<MaterialIcons name="arrow-forward" size={20} color="#1E3A8A" />
						</View>
					</TouchableOpacity>
				</View>
			</LinearGradient>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#E8F4F8",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#E8F4F8",
	},
	gradient: {
		flex: 1,
	},
	header: {
		paddingHorizontal: 24,
		paddingTop: 20,
	},
	headerBadge: {
		fontSize: 12,
		fontWeight: "700",
		color: "#6366F1",
		letterSpacing: 1.5,
		marginBottom: 12,
	},
	title: {
		fontSize: 36,
		fontWeight: "700",
		color: "#1E3A8A",
		lineHeight: 42,
	},
	subtitle: {
		fontSize: 14,
		color: "#64748B",
		marginTop: 12,
		lineHeight: 20,
	},
	heroContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 40,
	},
	imageWrapper: {
		position: "relative",
		width: width * 0.7,
		height: height * 0.45,
		justifyContent: "center",
		alignItems: "center",
	},
	heroImage: {
		width: 200,
		height: 280,
		backgroundColor: "#DBEAFE",
		borderRadius: 20,
		justifyContent: "center",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 12,
		elevation: 5,
	},
	statBadge1: {
		position: "absolute",
		top: 20,
		left: -10,
		backgroundColor: "#FFFFFF",
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
	statBadge2: {
		position: "absolute",
		top: 100,
		right: -20,
		backgroundColor: "#FFFFFF",
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
	statBadge3: {
		position: "absolute",
		bottom: 30,
		left: -15,
		backgroundColor: "#FFFFFF",
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
	statIcon: {
		width: 32,
		height: 32,
		backgroundColor: "#EEF2FF",
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 8,
	},
	statIconOrange: {
		width: 32,
		height: 32,
		backgroundColor: "#FFF7ED",
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 8,
	},
	statIconGreen: {
		width: 32,
		height: 32,
		backgroundColor: "#ECFDF5",
		borderRadius: 16,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 8,
	},
	statContent: {
		marginRight: 4,
	},
	statNumber: {
		fontSize: 16,
		fontWeight: "700",
		color: "#1E293B",
	},
	statLabel: {
		fontSize: 10,
		color: "#64748B",
	},
	buttonContainer: {
		paddingHorizontal: 24,
		paddingBottom: 40,
	},
	continueButton: {
		backgroundColor: "#F97316",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 18,
		borderRadius: 30,
		shadowColor: "#F97316",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 12,
		elevation: 6,
	},
	continueButtonText: {
		fontSize: 18,
		fontWeight: "700",
		color: "#FFFFFF",
		marginRight: 12,
	},
	arrowCircle: {
		width: 36,
		height: 36,
		backgroundColor: "#FFFFFF",
		borderRadius: 18,
		justifyContent: "center",
		alignItems: "center",
	},
});
