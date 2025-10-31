import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Alert,
	RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/src/contexts/AuthContext";
import { apiService, Service, Booking } from "@/src/services/api";
import { testApiConnection } from "@/src/utils/testConnection";

interface DashboardStats {
	totalServices: number;
	activeServices: number;
	totalBookings: number;
	pendingBookings: number;
	completedBookings: number;
	monthlyEarnings: number;
}

interface RecentBooking extends Booking {
	serviceName?: string;
	customerName?: string;
}

export default function PartnerDashboard() {
	const { user, isAuthenticated, accessToken } = useAuth();
	const [stats, setStats] = useState<DashboardStats>({
		totalServices: 0,
		activeServices: 0,
		totalBookings: 0,
		pendingBookings: 0,
		completedBookings: 0,
		monthlyEarnings: 0,
	});
	const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {
		loadDashboardData();
	}, []);

	const loadDashboardData = async () => {
		try {
			setLoading(true);
			if (!accessToken) {
				setStats({
					totalServices: 0,
					activeServices: 0,
					totalBookings: 0,
					pendingBookings: 0,
					completedBookings: 0,
					monthlyEarnings: 0,
				});
				setRecentBookings([]);
				return;
			}

			console.log(
				"Loading dashboard data with token:",
				accessToken ? "present" : "missing"
			);

			// Test API connection first
			const connectionTest = await testApiConnection();
			if (!connectionTest.success) {
				console.error("API connection failed:", connectionTest.error);
				Alert.alert(
					"Connection Error",
					`Cannot connect to server: ${connectionTest.error}`
				);
				return;
			}

			// Load services and bookings in parallel
			const [servicesRes, bookingsRes] = await Promise.all([
				apiService.listMyServices(accessToken),
				apiService.listMyBookings(accessToken),
			]);

			// Calculate stats from services
			const services = servicesRes.success ? servicesRes.data || [] : [];
			const bookings = bookingsRes.success ? bookingsRes.data || [] : [];

			// Log any API errors for debugging
			if (!servicesRes.success) {
				console.error("Failed to load services:", servicesRes.error);
			}
			if (!bookingsRes.success) {
				console.error("Failed to load bookings:", bookingsRes.error);
			}

			const totalServices = services.length;
			const activeServices = services.filter((s) => s.availability).length;
			const totalBookings = bookings.length;
			const pendingBookings = bookings.filter(
				(b) => b.status === "upcoming"
			).length;
			const completedBookings = bookings.filter(
				(b) => b.status === "completed"
			).length;

			// Calculate monthly earnings (sum of completed bookings)
			const monthlyEarnings = bookings
				.filter((b) => b.status === "completed")
				.reduce((sum, b) => sum + b.price, 0);

			setStats({
				totalServices,
				activeServices,
				totalBookings,
				pendingBookings,
				completedBookings,
				monthlyEarnings,
			});

			// Set recent bookings (last 5)
			const recent = bookings
				.sort(
					(a, b) =>
						new Date(b.createdAt || "").getTime() -
						new Date(a.createdAt || "").getTime()
				)
				.slice(0, 5)
				.map((booking) => ({
					...booking,
					serviceName:
						services.find((s) => s.id === booking.serviceId)?.name ||
						"Unknown Service",
					customerName: "Customer", // We don't have customer info in the booking
				}));

			setRecentBookings(recent);
		} catch (error) {
			console.error("Dashboard data loading error:", error);
			Alert.alert(
				"Error",
				"Failed to load dashboard data. Please check if the backend server is running."
			);
		} finally {
			setLoading(false);
		}
	};

	const onRefresh = async () => {
		setRefreshing(true);
		await loadDashboardData();
		setRefreshing(false);
	};

	const handleBookingAction = async (
		bookingId: string,
		action: "accept" | "reject" | "complete"
	) => {
		if (!accessToken) return;

		Alert.alert(
			"Confirm Action",
			`Are you sure you want to ${action} this booking?`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text:
						action === "accept"
							? "Accept"
							: action === "reject"
							? "Reject"
							: "Complete",
					onPress: async () => {
						try {
							const newStatus =
								action === "accept"
									? "upcoming"
									: action === "complete"
									? "completed"
									: "cancelled";
							const res = await apiService.updateBookingStatus(
								accessToken,
								Number(bookingId),
								newStatus
							);

							if (res.success) {
								// Update local state
								setRecentBookings((prev) =>
									prev.map((booking) =>
										booking.id === Number(bookingId)
											? { ...booking, status: newStatus as any }
											: booking
									)
								);
								// Refresh dashboard data
								await loadDashboardData();
							} else {
								Alert.alert("Error", res.error || "Failed to update booking");
							}
						} catch (error) {
							Alert.alert("Error", "Failed to update booking");
						}
					},
				},
			]
		);
	};

	const getStatusColor = (status: string) => {
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

	const renderStatCard = (
		title: string,
		value: string | number,
		icon: string,
		color: string
	) => (
		<View style={[styles.statCard, { borderLeftColor: color }]}>
			<View style={styles.statContent}>
				<View style={[styles.statIcon, { backgroundColor: `${color}15` }]}>
					<MaterialIcons name={icon as any} size={24} color={color} />
				</View>
				<View style={styles.statInfo}>
					<Text style={styles.statValue}>{value}</Text>
					<Text style={styles.statTitle}>{title}</Text>
				</View>
			</View>
		</View>
	);

	const renderBookingCard = (booking: RecentBooking) => {
		console.log("Rendering booking card:", booking);

		return (
			<View key={booking.id} style={styles.bookingCard}>
				<View style={styles.bookingHeader}>
					<View style={styles.bookingInfo}>
						<Text style={styles.bookingService}>{booking.serviceName}</Text>
						<Text style={styles.bookingCustomer}>{booking.customerName}</Text>
					</View>
					<View
						style={[
							styles.statusBadge,
							{ backgroundColor: `${getStatusColor(booking.status)}15` },
						]}
					>
						<Text
							style={[
								styles.statusText,
								{ color: getStatusColor(booking.status) },
							]}
						>
							{booking.status.replace("-", " ")}
						</Text>
					</View>
				</View>
				<View style={styles.bookingDetails}>
					<Text style={styles.bookingDate}>{booking.date}</Text>
					<Text style={styles.bookingAmount}>₹ {booking.price}</Text>
				</View>
				<View style={styles.bookingDetails}>
					<Text style={styles.bookingDate}>Slot- {booking.time}</Text>
				</View>
				{booking.status === "upcoming" && (
					<View style={styles.bookingActions}>
						<TouchableOpacity
							style={[styles.actionButton, styles.completeButton]}
							onPress={() =>
								handleBookingAction(booking.id.toString(), "complete")
							}
						>
							<MaterialIcons name="done" size={16} color="#fff" />
							<Text style={styles.actionButtonText}>Mark Complete</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.actionButton, styles.rejectButton]}
							onPress={() =>
								handleBookingAction(booking.id.toString(), "reject")
							}
						>
							<MaterialIcons name="close" size={16} color="#fff" />
							<Text style={styles.actionButtonText}>Cancel</Text>
						</TouchableOpacity>
					</View>
				)}
			</View>
		);
	};

	if (!isAuthenticated) {
		return (
			<View style={styles.centerContainer}>
				<MaterialIcons name="lock" size={64} color="#9ca3af" />
				<Text style={styles.authMessage}>
					Please sign in to access your dashboard
				</Text>
				<TouchableOpacity
					style={styles.signInButton}
					onPress={() => router.push("/auth/login")}
				>
					<Text style={styles.signInButtonText}>Sign In</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<ScrollView
				style={styles.scrollView}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
			>
				{/* Header */}
				<View style={styles.header}>
					<View>
						<Text style={styles.greeting}>
							Welcome back{user ? `, ${user.fullName.split(" ")[0]}` : ""}!
						</Text>
						<Text style={styles.subtitle}>Here's your business overview</Text>
					</View>
				</View>

				{/* Quick Actions */}
				<View style={styles.quickActions}>
					<TouchableOpacity
						style={styles.quickActionButton}
						onPress={() => router.push("/provider/add-service")}
					>
						<MaterialIcons name="add" size={24} color="#6366f1" />
						<Text style={styles.quickActionText}>Add Service</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.quickActionButton}
						onPress={() => router.push("/services")}
					>
						<MaterialIcons name="build" size={24} color="#10b981" />
						<Text style={styles.quickActionText}>Manage Services</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.quickActionButton}
						onPress={() => router.push("/bookings")}
					>
						<MaterialIcons name="bookmark" size={24} color="#f59e0b" />
						<Text style={styles.quickActionText}>View Bookings</Text>
					</TouchableOpacity>
				</View>

				{/* Stats Cards */}
				<View style={styles.statsSection}>
					<Text style={styles.sectionTitle}>Business Overview</Text>
					<View style={styles.statsGrid}>
						{renderStatCard(
							"Total Services",
							stats.totalServices,
							"build",
							"#6366f1"
						)}
						{renderStatCard(
							"Active Services",
							stats.activeServices,
							"check-circle",
							"#10b981"
						)}
						{renderStatCard(
							"Total Bookings",
							stats.totalBookings,
							"bookmark",
							"#f59e0b"
						)}
						{renderStatCard(
							"Pending",
							stats.pendingBookings,
							"schedule",
							"#ef4444"
						)}
						{renderStatCard(
							"Completed",
							stats.completedBookings,
							"done",
							"#059669"
						)}
						{renderStatCard(
							"Monthly Earnings",
							`₹ ${stats.monthlyEarnings}`,
							"attach-money",
							"#8b5cf6"
						)}
					</View>
				</View>

				{/* Recent Bookings */}
				<View style={styles.recentSection}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>Recent Bookings</Text>
						<TouchableOpacity onPress={() => router.push("/bookings")}>
							<Text style={styles.viewAllText}>View All</Text>
						</TouchableOpacity>
					</View>
					{loading ? (
						<View style={styles.centerContainer}>
							<Text style={styles.loadingText}>Loading bookings...</Text>
							<Text style={styles.loadingSubtext}>Connecting to server...</Text>
						</View>
					) : recentBookings.length === 0 ? (
						<View style={styles.centerContainer}>
							<MaterialIcons name="bookmark" size={48} color="#9ca3af" />
							<Text style={styles.emptyMessage}>No bookings yet</Text>
						</View>
					) : (
						<View style={styles.bookingsList}>
							{recentBookings.map(renderBookingCard)}
						</View>
					)}
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f9fafb",
	},
	scrollView: {
		flex: 1,
	},
	header: {
		backgroundColor: "#6366f1",
		padding: 20,
		paddingTop: 10,
		borderBottomLeftRadius: 24,
		borderBottomRightRadius: 24,
	},
	greeting: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#fff",
		marginBottom: 4,
	},
	subtitle: {
		fontSize: 16,
		color: "#e0e7ff",
	},
	quickActions: {
		flexDirection: "row",
		justifyContent: "space-around",
		padding: 20,
		backgroundColor: "#fff",
		marginTop: -20,
		marginHorizontal: 20,
		borderRadius: 16,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
	quickActionButton: {
		alignItems: "center",
		flex: 1,
	},
	quickActionText: {
		fontSize: 12,
		color: "#6b7280",
		marginTop: 4,
		fontWeight: "500",
	},
	statsSection: {
		padding: 20,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#1f2937",
		marginBottom: 16,
	},
	statsGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
	},
	statCard: {
		backgroundColor: "#fff",
		borderRadius: 12,
		borderLeftWidth: 4,
		padding: 16,
		width: "48%",
		marginBottom: 12,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	statContent: {
		flexDirection: "row",
		alignItems: "center",
	},
	statIcon: {
		width: 40,
		height: 40,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	statInfo: {
		flex: 1,
	},
	statValue: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#1f2937",
	},
	statTitle: {
		fontSize: 12,
		color: "#6b7280",
		marginTop: 2,
	},
	recentSection: {
		padding: 20,
		paddingTop: 0,
	},
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	viewAllText: {
		fontSize: 14,
		color: "#6366f1",
		fontWeight: "600",
	},
	bookingsList: {
		gap: 12,
	},
	bookingCard: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 16,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 1,
		},
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	bookingHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 8,
	},
	bookingInfo: {
		flex: 1,
	},
	bookingService: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#1f2937",
		marginBottom: 2,
	},
	bookingCustomer: {
		fontSize: 14,
		color: "#6b7280",
	},
	statusBadge: {
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: 12,
	},
	statusText: {
		fontSize: 12,
		fontWeight: "600",
		textTransform: "capitalize",
	},
	bookingDetails: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12,
	},
	bookingDate: {
		fontSize: 14,
		color: "#6b7280",
	},
	bookingAmount: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#059669",
	},
	bookingActions: {
		flexDirection: "row",
		gap: 8,
	},
	actionButton: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 6,
		flex: 1,
		justifyContent: "center",
	},
	acceptButton: {
		backgroundColor: "#10b981",
	},
	rejectButton: {
		backgroundColor: "#ef4444",
	},
	completeButton: {
		backgroundColor: "#6366f1",
	},
	actionButtonText: {
		color: "#fff",
		fontSize: 12,
		fontWeight: "600",
		marginLeft: 4,
	},
	centerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 32,
	},
	authMessage: {
		fontSize: 16,
		color: "#6b7280",
		textAlign: "center",
		marginTop: 16,
		marginBottom: 24,
	},
	signInButton: {
		backgroundColor: "#6366f1",
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
	},
	signInButtonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 16,
	},
	loadingText: {
		fontSize: 16,
		color: "#6b7280",
	},
	loadingSubtext: {
		fontSize: 14,
		color: "#9ca3af",
		marginTop: 4,
	},
	emptyMessage: {
		fontSize: 16,
		color: "#6b7280",
		textAlign: "center",
		marginTop: 8,
	},
});
