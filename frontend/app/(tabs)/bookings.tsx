import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiService, Booking, Service } from "../../src/services/api";

type BookingStatus = "upcoming" | "completed" | "cancelled";

export default function BookingsScreen() {
	const [activeTab, setActiveTab] = useState<"upcoming" | "completed">(
		"upcoming"
	);
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [loading, setLoading] = useState(true);
	const [serviceNames, setServiceNames] = useState<Record<number, Service>>({});

	useEffect(() => {
		let mounted = true;
		(async () => {
			setLoading(true);
			const token = await AsyncStorage.getItem("access_token");
			if (!token) {
				setBookings([]);
				setLoading(false);
				return;
			}
			const res = await apiService.listMyBookings(token);
			if (!mounted) return;
			if (res.success && res.data) {
				setBookings(res.data);
				// fetch service names for nicer titles
				const uniqueServiceIds = Array.from(
					new Set(res.data.map((b) => b.serviceId))
				);
				const fetched = await Promise.all(
					uniqueServiceIds.map(async (id) => {
						const sres = await apiService.getService(id);
						return sres.success && sres.data ? (sres.data as Service) : null;
					})
				);
				const map: Record<number, Service> = {};
				fetched.filter(Boolean).forEach((s) => {
					map[(s as Service).id] = s as Service;
				});
				setServiceNames(map);
			}
			setLoading(false);
		})();
		return () => {
			mounted = false;
		};
	}, []);

	const filteredBookings = bookings.filter((b) =>
		activeTab === "upcoming"
			? b.status === "upcoming"
			: b.status === "completed"
	);

	const getStatusColor = (status: BookingStatus) => {
		switch (status) {
			case "upcoming":
				return "#3b82f6";
			case "completed":
				return "#10b981";
			case "cancelled":
				return "#ef4444";
			default:
				return "#6b7280";
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.tabContainer}>
				<TouchableOpacity
					style={[styles.tab, activeTab === "upcoming" && styles.activeTab]}
					onPress={() => setActiveTab("upcoming")}
				>
					<Text
						style={[
							styles.tabText,
							activeTab === "upcoming" && styles.activeTabText,
						]}
					>
						Upcoming
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.tab, activeTab === "completed" && styles.activeTab]}
					onPress={() => setActiveTab("completed")}
				>
					<Text
						style={[
							styles.tabText,
							activeTab === "completed" && styles.activeTabText,
						]}
					>
						Completed
					</Text>
				</TouchableOpacity>
			</View>

			<ScrollView
				style={styles.scrollView}
				showsVerticalScrollIndicator={false}
			>
				{filteredBookings.length === 0 ? (
					<View style={styles.emptyState}>
						<MaterialIcons name="event-busy" size={64} color="#9ca3af" />
						<Text style={styles.emptyTitle}>No {activeTab} bookings</Text>
						<Text style={styles.emptySubtitle}>
							{activeTab === "upcoming"
								? "Book a service to see it here"
								: "Your completed bookings will appear here"}
						</Text>
					</View>
				) : (
					<View style={styles.bookingsList}>
						{filteredBookings.map((booking) => (
							<TouchableOpacity
								key={booking.id}
								style={styles.bookingCard}
								activeOpacity={0.6}
							>
								<View style={styles.cardContent}>
									<View style={styles.bookingHeader}>
										<View style={styles.bookingInfo}>
											<Text style={styles.serviceName}>
												{serviceNames[booking.serviceId]?.name || "Service"}
											</Text>
											<Text style={styles.providerName} numberOfLines={1}>
												{booking.address}
											</Text>
										</View>
										<View
											style={[
												styles.statusBadge,
												{ borderColor: getStatusColor(booking.status) },
											]}
										>
											<Text
												style={[
													styles.statusText,
													{ color: getStatusColor(booking.status) },
												]}
											>
												{booking.status.charAt(0).toUpperCase() +
													booking.status.slice(1)}
											</Text>
										</View>
									</View>

									<View style={styles.bookingDetails}>
										<View style={styles.detailRow}>
											<MaterialIcons name="event" size={16} color="#9ca3af" />
											<Text style={styles.detailText}>
												{booking.date} · {booking.time}
											</Text>
										</View>
										<View style={styles.detailRow}>
											<MaterialIcons
												name="payments"
												size={16}
												color="#9ca3af"
											/>
											<Text style={styles.priceText}>
												₹{booking.price.toLocaleString()}
											</Text>
										</View>
									</View>
								</View>
							</TouchableOpacity>
						))}
					</View>
				)}
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f8fafc",
	},
	tabContainer: {
		flexDirection: "row",
		backgroundColor: "#fff",
		marginHorizontal: 20,
		marginTop: 10,
		borderRadius: 12,
		padding: 4,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	tab: {
		flex: 1,
		paddingVertical: 12,
		alignItems: "center",
		borderRadius: 8,
	},
	activeTab: {
		backgroundColor: "#6366f1",
	},
	tabText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#6b7280",
	},
	activeTabText: {
		color: "#fff",
	},
	scrollView: {
		flex: 1,
		marginTop: 20,
	},
	emptyState: {
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 80,
		paddingHorizontal: 40,
	},
	emptyTitle: {
		fontSize: 20,
		fontWeight: "600",
		color: "#1f2937",
		marginTop: 16,
		marginBottom: 8,
	},
	emptySubtitle: {
		fontSize: 16,
		color: "#6b7280",
		textAlign: "center",
		lineHeight: 24,
	},
	bookingsList: {
		paddingHorizontal: 20,
		paddingBottom: 20,
	},
	bookingCard: {
		backgroundColor: "#fff",
		borderRadius: 12,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: "#f0f0f0",
	},
	cardContent: {
		padding: 16,
	},
	bookingHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 12,
	},
	bookingInfo: {
		flex: 1,
		marginRight: 12,
	},
	serviceName: {
		fontSize: 16,
		fontWeight: "600",
		color: "#111827",
		marginBottom: 4,
	},
	providerName: {
		fontSize: 13,
		color: "#6b7280",
	},
	statusBadge: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 6,
		borderWidth: 1,
	},
	statusText: {
		fontSize: 11,
		fontWeight: "600",
	},
	bookingDetails: {
		gap: 8,
	},
	detailRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	detailText: {
		fontSize: 14,
		color: "#4b5563",
	},
	priceText: {
		fontSize: 14,
		color: "#111827",
		fontWeight: "600",
	},
});
