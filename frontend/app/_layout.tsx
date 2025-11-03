import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text } from "react-native";
import { AuthProvider } from "../src/contexts/AuthContext";

export default function RootLayout() {
	
	useEffect(() => {
	
		const prev = (Text as any).defaultProps?.style;
		(Text as any).defaultProps = {
			...((Text as any).defaultProps || {}),
			style: [{ color: "#111111" }, prev].filter(Boolean),
		};
	}, []);

	return (
		<AuthProvider>
			{/* Use a fixed status bar style for consistent contrast */}
			<StatusBar style="dark" />
			<Stack
				screenOptions={{
					headerStyle: {
						backgroundColor: "#fff",
					},
					headerTintColor: "#000",
					headerTitleStyle: {
						fontWeight: "600",
					},
				}}
			>
				<Stack.Screen name="index" options={{ headerShown: false }} />
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
				<Stack.Screen
					name="auth/login"
					options={{ title: "Sign In", headerShown: false }}
				/>
				<Stack.Screen
					name="auth/register"
					options={{ title: "Sign Up", headerShown: false }}
				/>
				<Stack.Screen
					name="auth/verify-otp"
					options={{ title: "Verify Email", headerShown: false }}
				/>
				<Stack.Screen name="category/[id]" options={{ title: "Services" }} />
				<Stack.Screen
					name="provider/[id]"
					options={{ title: "Service Provider" }}
				/>
				<Stack.Screen
					name="booking/[serviceId]"
					options={{ title: "Book Service" }}
				/>
				<Stack.Screen
					name="booking/confirmation"
					options={{ title: "Booking Confirmed" }}
				/>
			</Stack>
		</AuthProvider>
	);
}
