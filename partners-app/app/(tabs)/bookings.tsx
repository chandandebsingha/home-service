import React, { useState, useEffect, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Alert,
	RefreshControl,
	Pressable,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@/src/contexts/AuthContext";
import { router } from "expo-router";
import { apiService, Booking as ApiBooking } from "@/src/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RatingStars from "@/src/components/RatingStars";

type Booking = ApiBooking;
type BookingStatus = Booking["status"];

export default function PartnerBookingsScreen() {
	const { isAuthenticated, accessToken } = useAuth();
	const [activeTab, setActiveTab] = useState<
		"upcoming" | "completed" | "cancelled"
	>("upcoming");
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [serviceMap, setServiceMap] = useState<Record<number, string>>({});
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [reviewModalVisible, setReviewModalVisible] = useState(false);
	const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
	const [rating, setRating] = useState(0);
	const [reviewText, setReviewText] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [localUserReviews, setLocalUserReviews] = useState<Record<number, { rating: number; comment?: string; submittedAt: string }>>({});

	useEffect(() => {
		// reload when authentication or token changes
		loadBookings();
		// load existing local user reviews
		(async () => {
			const stored = await AsyncStorage.getItem("partner_user_reviews");
			if (stored) {
				try { setLocalUserReviews(JSON.parse(stored)); } catch {}
			}
		})();
	}, [isAuthenticated, accessToken]);

	const loadBookings = useCallback(async () => {
		try {
			setLoading(true);
			if (!isAuthenticated || !accessToken) {
				setBookings([]);
				setServiceMap({});
				return;
			}
			// load bookings alongside owned services so we can label cards clearly
			const [bookingsRes, servicesRes] = await Promise.all([
				apiService.listPartnerBookings(accessToken),
				apiService.listMyServices(accessToken),
			]);

			if (servicesRes.success && servicesRes.data) {
				const map = servicesRes.data.reduce<Record<number, string>>(
					(acc, service) => {
						acc[service.id] = service.name;
						return acc;
					},
					{}
				);
				setServiceMap(map);
			} else if (!servicesRes.success) {
				console.error("listMyServices failed", servicesRes);
			}

			if (bookingsRes.success && bookingsRes.data) {
				setBookings(bookingsRes.data);
			} else {
				console.error("listPartnerBookings failed", bookingsRes);
				Alert.alert(
					"Error",
					bookingsRes.error || bookingsRes.message || "Failed to load bookings"
				);
			}
		} catch (err: any) {
			console.error("Failed to load bookings catch", err);
			Alert.alert("Error", err?.message || "Failed to load bookings");
		} finally {
			setLoading(false);
		}
	}, [isAuthenticated, accessToken]);

	const onRefresh = async () => {
		setRefreshing(true);
		await loadBookings();
		setRefreshing(false);
	};

	const handleUpdateStatus = (bookingId: number, status: BookingStatus) => {
		const label = status === "completed" ? "complete" : "cancel";
		Alert.alert(
			"Confirm Action",
			`Are you sure you want to ${label} this booking?`,
			[
				{ text: "Cancel", style: "cancel" },
				{
					text: label.charAt(0).toUpperCase() + label.slice(1),
					onPress: async () => {
						try {
							if (!accessToken) return;
							const res = await apiService.updatePartnerBookingStatus(
								accessToken,
								bookingId,
								status
							);
							if (res.success && res.data) {
								setBookings((prev) =>
									prev.map((b) =>
										b.id === bookingId ? { ...b, status: res.data!.status } : b
									)
								);
							} else {
								Alert.alert("Error", res.error || "Failed to update booking");
							}
						} catch {
							Alert.alert("Error", "Failed to update booking");
						}
					},
				},
			]
		);
	};

	const filteredBookings = bookings.filter(
		(booking) => booking.status === activeTab
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

	const isUserReviewed = (bookingId: number) => !!localUserReviews[bookingId];

	const openUserReview = (booking: Booking) => {
		setSelectedBooking(booking);
		const existing = localUserReviews[booking.id];
		setRating(existing?.rating || 0);
		setReviewText(existing?.comment || "");
		setReviewModalVisible(true);
	};

	const submitUserReview = async () => {
		if (!selectedBooking) return;
		if (rating < 1) return;
		setSubmitting(true);
		try {
			if (!accessToken) return;
			await apiService.submitUserReview(accessToken, {
				bookingId: selectedBooking.id,
				rating,
				comment: reviewText || undefined,
			});
			const updated = {
				...localUserReviews,
				[selectedBooking.id]: { rating, comment: reviewText || undefined, submittedAt: new Date().toISOString() },
			};
			setLocalUserReviews(updated);
			await AsyncStorage.setItem("partner_user_reviews", JSON.stringify(updated));
			setReviewModalVisible(false);
			setSelectedBooking(null);
		} catch (e: any) {
			Alert.alert("Review", e?.message || "Failed to submit review");
		} finally {
			setSubmitting(false);
		}
	};

	const formatStatus = (status: BookingStatus) => status.replace(/-/g, " ");

	const formatCurrency = (value: number) =>
		`₹ ${Number(value || 0).toLocaleString("en-IN")}`;

	const getServiceTitle = (booking: Booking) =>
		serviceMap[booking.serviceId] || `Booking ${booking.id}`;

	const renderBookingCard = (booking: Booking) => (
		<Pressable
			key={booking.id}
			style={({ pressed }) => [
				styles.bookingCard,
				pressed && styles.bookingCardPressed,
			]}
			android_ripple={{ color: "#e2e8f0" }}
		>
			<View style={styles.bookingHeader}>
				<View style={styles.bookingInfo}>
					<Text style={styles.serviceName}>{getServiceTitle(booking)}</Text>
					<Text style={styles.bookingMeta}>Ref #{booking.id}</Text>
				</View>
				<View style={styles.headerActions}>
					<View style={styles.statusBadge}>
						<View
							style={[
								styles.statusDot,
								{ backgroundColor: getStatusColor(booking.status) },
							]}
						/>
						<Text style={styles.statusText}>
							{formatStatus(booking.status)}
						</Text>
					</View>
				</View>
			</View>

			<View style={styles.bookingBody}>
				<View style={styles.detailRow}>
					<View style={[styles.detailIcon, styles.locationIcon]}>
						<MaterialIcons name="location-on" size={16} color="#334155" />
					</View>
					<View style={styles.detailContent}>
						<Text style={styles.detailLabel}>Address</Text>
						<Text style={styles.detailValue}>{booking.address}</Text>
					</View>
				</View>
				<View style={[styles.detailRow, styles.detailRowLast]}>
					<View style={[styles.detailIcon, styles.scheduleIcon]}>
						<MaterialIcons name="calendar-today" size={16} color="#334155" />
					</View>
					<View style={styles.detailContent}>
						<Text style={styles.detailLabel}>Schedule</Text>
						<Text style={styles.detailValue}>
							{booking.date} · {booking.time}
						</Text>
					</View>
				</View>
			</View>

			<View style={styles.divider} />

			<View style={styles.amountRow}>
				<Text style={styles.amountLabel}>Expected payout</Text>
				<Text style={styles.amountValue}>{formatCurrency(booking.price)}</Text>
			</View>

			{booking.status === "upcoming" && (
				<>
					<View style={styles.divider} />
					<View style={styles.bookingActions}>
						<TouchableOpacity
							style={styles.primaryActionButton}
							activeOpacity={0.85}
							onPress={() => router.push(`/bookings/${booking.id}`)}
						>
							<MaterialIcons name="visibility" size={18} color="#f8fafc" />
							<Text style={styles.primaryActionText}>View</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.secondaryActionButton}
							activeOpacity={0.85}
							onPress={() => handleUpdateStatus(booking.id, "cancelled")}
						>
							<MaterialIcons name="close" size={18} color="#475569" />
							<Text style={styles.secondaryActionText}>Cancel</Text>
						</TouchableOpacity>
					</View>
				</>
			)}

			{booking.status === "completed" && (
				<View style={{ marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
					{(() => {
						const stars = localUserReviews[booking.id]?.rating || 0;
						if (stars === 0) {
							return (
								<TouchableOpacity style={styles.primaryActionButton} activeOpacity={0.85} onPress={() => openUserReview(booking)}>
									<MaterialIcons name="star" size={18} color="#f8fafc" />
									<Text style={styles.primaryActionText}>Rate Customer</Text>
								</TouchableOpacity>
							);
						}
						return (
							<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
								<RatingStars rating={stars} onChange={() => {}} size={20} disabled />
								<Text style={{ color: "#6b7280", fontSize: 12 }}>Customer reviewed</Text>
							</View>
						);
					})()}
				</View>
			)}
		</Pressable>
	);

	if (!isAuthenticated) {
		return (
			<View style={styles.centerContainer}>
				<MaterialIcons name="lock" size={64} color="#9ca3af" />
				<Text style={styles.authMessage}>
					Please sign in to view your bookings
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
				<TouchableOpacity
					style={[styles.tab, activeTab === "cancelled" && styles.activeTab]}
					onPress={() => setActiveTab("cancelled")}
				>
					<Text
						style={[
							styles.tabText,
							activeTab === "cancelled" && styles.activeTabText,
						]}
					>
						Cancelled
					</Text>
				</TouchableOpacity>
			</View>

			<ScrollView
				style={styles.scrollView}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
			>
				{loading ? (
					<View style={styles.centerContainer}>
						<Text style={styles.loadingText}>Loading bookings...</Text>
					</View>
				) : filteredBookings.length === 0 ? (
					<View style={styles.emptyState}>
						<MaterialIcons name="event-busy" size={64} color="#9ca3af" />
						<Text style={styles.emptyTitle}>No {activeTab} bookings</Text>
						<Text style={styles.emptySubtitle}>
							{activeTab === "upcoming"
								? "New booking requests will appear here"
								: activeTab === "completed"
								? "Your completed bookings will appear here"
								: "Your cancelled bookings will appear here"}
						</Text>
					</View>
				) : (
					<View style={styles.bookingsList}>
						{filteredBookings.map(renderBookingCard)}
					</View>
				)}
			</ScrollView>

			{/* Review Modal */}
			<Modal visible={reviewModalVisible} animationType="slide" transparent onRequestClose={() => setReviewModalVisible(false)}>
				<View style={modalStyles.backdrop}>
					<View style={modalStyles.content}>
						<Text style={modalStyles.title}>Rate Customer</Text>
						<View style={{ alignItems: "center", marginVertical: 8 }}>
							<RatingStars rating={rating} onChange={setRating} />
						</View>
						<TextInput
							style={modalStyles.textArea}
							placeholder="Add a note (optional)"
							multiline
							value={reviewText}
							onChangeText={setReviewText}
						/>
						<View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
							<TouchableOpacity style={[modalStyles.btn, modalStyles.cancel]} onPress={() => setReviewModalVisible(false)} disabled={submitting}>
								<Text style={[modalStyles.btnText, { color: "#111827" }]}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity style={[modalStyles.btn, modalStyles.submit]} onPress={submitUserReview} disabled={submitting || rating < 1}>
								{submitting ? <ActivityIndicator color="#fff" /> : <Text style={modalStyles.btnText}>Submit</Text>}
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</View>
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
		fontSize: 14,
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
	bookingsList: {
		paddingHorizontal: 20,
		paddingBottom: 20,
	},
	bookingCard: {
		backgroundColor: "#ffffff",
		borderRadius: 16,
		padding: 20,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: "#e5e7eb",
		shadowColor: "#0f172a",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.02,
		shadowRadius: 3,
		elevation: 0,
	},
	bookingCardPressed: {
		transform: [{ scale: 0.99 }],
		opacity: 0.95,
	},
	bookingHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 20,
	},
	bookingInfo: {
		flex: 1,
	},
	headerActions: {
		flexDirection: "row",
		alignItems: "center",
	},
	serviceName: {
		fontSize: 18,
		fontWeight: "600",
		color: "#1f2937",
		marginBottom: 2,
	},
	bookingMeta: {
		fontSize: 11,
		color: "#94a3b8",
		textTransform: "uppercase",
		letterSpacing: 1,
	},
	statusBadge: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 5,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: "#e5e7eb",
		backgroundColor: "#f8fafc",
	},
	statusDot: {
		width: 8,
		height: 8,
		borderRadius: 8,
		marginRight: 6,
	},
	statusText: {
		fontSize: 11,
		fontWeight: "600",
		textTransform: "capitalize",
		letterSpacing: 0.2,
		color: "#475569",
	},
	viewButton: {
		marginLeft: 12,
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 999,
		backgroundColor: "#4338ca",
		shadowColor: "#312e81",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.12,
		shadowRadius: 3,
		elevation: 2,
	},
	viewButtonText: {
		color: "#f8fafc",
		fontSize: 13,
		fontWeight: "600",
		letterSpacing: 0.3,
		textTransform: "uppercase",
	},
	bookingBody: {
		marginBottom: 18,
	},
	detailRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 12,
	},
	detailRowLast: {
		marginBottom: 0,
	},
	detailIcon: {
		width: 32,
		height: 32,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
		backgroundColor: "#f1f5f9",
	},
	locationIcon: {
		backgroundColor: "#f1f5f9",
	},
	scheduleIcon: {
		backgroundColor: "#f1f5f9",
	},
	detailContent: {
		flex: 1,
	},
	detailLabel: {
		fontSize: 11,
		fontWeight: "600",
		color: "#94a3b8",
		textTransform: "uppercase",
		letterSpacing: 0.8,
	},
	detailValue: {
		fontSize: 15,
		color: "#111827",
		marginTop: 2,
		lineHeight: 20,
	},
	divider: {
		height: StyleSheet.hairlineWidth,
		backgroundColor: "#e5e7eb",
		marginVertical: 18,
	},
	amountRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	amountLabel: {
		fontSize: 11,
		color: "#94a3b8",
		textTransform: "uppercase",
		letterSpacing: 0.8,
	},
	amountValue: {
		fontSize: 18,
		fontWeight: "700",
		color: "#0f172a",
	},
	bookingActions: {
		flexDirection: "row",
		marginTop: 2,
	},
	primaryActionButton: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#4338ca",
		borderRadius: 999,
		paddingVertical: 12,
		paddingHorizontal: 18,
		marginRight: 12,
	},
	primaryActionText: {
		color: "#f8fafc",
		fontSize: 14,
		fontWeight: "600",
		marginLeft: 8,
		letterSpacing: 0.2,
		textTransform: "uppercase",
	},
	secondaryActionButton: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 12,
		paddingHorizontal: 18,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: "#e5e7eb",
		backgroundColor: "#f8fafc",
	},
	secondaryActionText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#475569",
		marginLeft: 6,
		textTransform: "uppercase",
		letterSpacing: 0.2,
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
});

const modalStyles = StyleSheet.create({
	backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "flex-end" },
	content: { backgroundColor: "#fff", padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
	title: { fontSize: 18, fontWeight: "700", color: "#111827" },
	textArea: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 12, minHeight: 90, textAlignVertical: "top", marginTop: 8, color: "#111827" },
	btn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: "center", justifyContent: "center" },
	cancel: { backgroundColor: "#f3f4f6" },
	submit: { backgroundColor: "#6366f1" },
	btnText: { color: "#fff", fontWeight: "700" },
});
