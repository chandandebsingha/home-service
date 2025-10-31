import React, { useEffect, useState } from "react";
import { router, Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import {
	View,
	Image,
	TouchableOpacity,
	Text,
	BackHandler,
	Alert,
} from "react-native";
import { useAuth } from "@/src/contexts/AuthContext";
import ProviderOnboardingModal from "@/src/components/ProviderOnboardingModal";
import { apiService } from "@/src/services/api";
import VerificationPendingOverlay from "@/src/components/VerificationPendingOverlay";

export default function TabLayout() {
	const { user, isAuthenticated, logout, isLoading, accessToken } = useAuth();
	const [showOnboarding, setShowOnboarding] = useState(false);
	const [pendingVerification, setPendingVerification] = useState(false);

	useEffect(() => {
		const run = async () => {
			if (!isAuthenticated || !accessToken) return;
			const res = await apiService.getProviderProfile(accessToken);
			if (!res.success) {
				setShowOnboarding(true);
				setPendingVerification(false);
			} else {
				setShowOnboarding(false);
				setPendingVerification(!res.data?.isVerified);
			}
		};
		run();
	}, [isAuthenticated, accessToken]);

	// Block hardware back while onboarding required or verification pending
	useEffect(() => {
		if (!showOnboarding && !pendingVerification) return;
		const sub = BackHandler.addEventListener("hardwareBackPress", () => {
			Alert.alert(
				"Action required",
				"Please complete your business profile to continue."
			);
			return true;
		});
		return () => sub.remove();
	}, [showOnboarding, pendingVerification]);

	return (
		<>
			<Tabs
				screenOptions={{
					tabBarActiveTintColor: "#6366f1",
					tabBarInactiveTintColor: "#9ca3af",
					tabBarStyle: {
						backgroundColor: "#fff",
						borderTopWidth: 1,
						borderTopColor: "#e5e7eb",
						paddingBottom: 5,
						paddingTop: 5,
						height: 65,
					},
					tabBarLabelStyle: {
						fontSize: 12,
						fontWeight: "500",
					},
					headerStyle: {
						backgroundColor: "#6366f1",
					},
					headerTintColor: "#fff",
					headerTitleStyle: {
						fontWeight: "600",
					},
					headerRight: () => (
						<View>
							{isAuthenticated ? (
								<TouchableOpacity
									style={{ marginRight: 15 }}
									onPress={() => router.push("/profile")}
								>
									<Image
										source={{
											uri: "https://randomuser.me/api/portraits/men/1.jpg",
										}}
										style={{
											width: 36,
											height: 36,
											borderRadius: 18,
											borderWidth: 2,
											borderColor: "#fff",
										}}
									/>
								</TouchableOpacity>
							) : (
								<TouchableOpacity
									onPress={() => router.push("/auth/login")}
									// style={styles.loginButton}
									style={{
										paddingHorizontal: 16,
										paddingVertical: 8,
										borderRadius: 8,
										marginRight: 10,
										backgroundColor: "rgba(255,255,255,0.2)",
									}}
								>
									<Text
										style={{ color: "#fff", fontSize: 14, fontWeight: "600" }}
									>
										Sign In
									</Text>
								</TouchableOpacity>
							)}
						</View>
					),
				}}
			>
				<Tabs.Screen
					name="index"
					options={{
						title: "Dashboard",
						headerTitle: "Partner Dashboard",
						tabBarIcon: ({ color, size }) => (
							<MaterialIcons name="dashboard" size={size} color={color} />
						),
					}}
				/>
				<Tabs.Screen
					name="services"
					options={{
						title: "Services",
						headerTitle: "My Services",
						tabBarIcon: ({ color, size }) => (
							<MaterialIcons name="build" size={size} color={color} />
						),
					}}
				/>
				<Tabs.Screen
					name="bookings"
					options={{
						title: "Bookings",
						headerTitle: "Incoming Bookings",
						tabBarIcon: ({ color, size }) => (
							<MaterialIcons name="bookmark" size={size} color={color} />
						),
					}}
				/>
				<Tabs.Screen
					name="profile"
					options={{
						title: "Profile",
						headerTitle: "Partner Profile",
						tabBarIcon: ({ color, size }) => (
							<MaterialIcons name="person" size={size} color={color} />
						),
					}}
				/>
			</Tabs>
			<ProviderOnboardingModal
				visible={!!isAuthenticated && showOnboarding}
				onSubmitted={() => setShowOnboarding(false)}
			/>
			<VerificationPendingOverlay
				visible={!!isAuthenticated && !showOnboarding && pendingVerification}
			/>
		</>
	);
}
