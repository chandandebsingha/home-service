import React, { useEffect, useMemo, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiService, Booking, Service } from "../../src/services/api";
import RatingStars from "../../src/components/RatingStars";

type BookingStatus = "upcoming" | "completed" | "cancelled";

export default function BookingsScreen() {
	const [activeTab, setActiveTab] = useState<"upcoming" | "completed">(
		"upcoming"
	);
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [loading, setLoading] = useState(true);
	const [serviceNames, setServiceNames] = useState<Record<number, Service>>({});
	const [reviewModalVisible, setReviewModalVisible] = useState(false);
	const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
	const [rating, setRating] = useState(0);
	const [reviewText, setReviewText] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [localReviews, setLocalReviews] = useState<Record<number, { rating: number; comment?: string; submittedAt: string }>>({});

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

				// load local submitted reviews to mark UI
				const stored = await AsyncStorage.getItem("booking_reviews");
				if (stored) {
					try {
						setLocalReviews(JSON.parse(stored));
					} catch {}
				}
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

	const isReviewed = (bookingId: number) => !!localReviews[bookingId];

	const openReview = (booking: Booking) => {
		setSelectedBooking(booking);
		const existing = localReviews[booking.id];
		setRating(existing?.rating || 0);
		setReviewText(existing?.comment || "");
		setReviewModalVisible(true);
	};

	const submitReview = async () => {
		if (!selectedBooking) return;
		if (rating < 1) return; // minimal validation
		setSubmitting(true);
		try {
			const token = await AsyncStorage.getItem("access_token");
			if (token) {
				// Attempt backend submission (non-blocking if backend lacks endpoint)
				await apiService.submitReview(token, {
					bookingId: selectedBooking.id,
					rating,
					comment: reviewText || undefined,
					serviceId: selectedBooking.serviceId,
					providerId: serviceNames[selectedBooking.serviceId]?.providerId,
				});
			}
			// Persist locally so the UI reflects submitted state
			const updated = {
				...localReviews,
				[selectedBooking.id]: {
					rating,
					comment: reviewText || undefined,
					submittedAt: new Date().toISOString(),
				},
			};
			setLocalReviews(updated);
			await AsyncStorage.setItem("booking_reviews", JSON.stringify(updated));
			setReviewModalVisible(false);
			setSelectedBooking(null);
		} finally {
			setSubmitting(false);
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

										{booking.status === "completed" && (
											<View style={{ marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
												{isReviewed(booking.id) ? (
													<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
														<RatingStars rating={localReviews[booking.id].rating} onChange={() => {}} size={20} disabled />
														<Text style={{ color: "#6b7280", fontSize: 12 }}>Reviewed</Text>
													</View>
												) : (
													<TouchableOpacity
														style={styles.reviewButton}
														onPress={() => openReview(booking)}
													>
														<Text style={styles.reviewButtonText}>Rate & Review</Text>
													</TouchableOpacity>
												)}
											</View>
										)}
									</View>
								</View>
							</TouchableOpacity>
						))}
					</View>
				)}
			</ScrollView>

			{/* Review Modal */}
			<Modal visible={reviewModalVisible} animationType="slide" transparent onRequestClose={() => setReviewModalVisible(false)}>
				<View style={styles.modalBackdrop}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Rate & Review</Text>
						<Text style={styles.modalSubtitle}>
							{selectedBooking ? (serviceNames[selectedBooking.serviceId]?.name || "Service") : ""}
						</Text>
						<View style={{ alignItems: "center", marginVertical: 8 }}>
							<RatingStars rating={rating} onChange={setRating} />
						</View>
						<TextInput
							style={styles.textArea}
							placeholder="Share your experience (optional)"
							multiline
							value={reviewText}
							onChangeText={setReviewText}
						/>
						<View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
							<TouchableOpacity style={[styles.modalBtn, styles.modalCancel]} onPress={() => setReviewModalVisible(false)} disabled={submitting}>
								<Text style={[styles.modalBtnText, { color: "#111827" }]}>Cancel</Text>
							</TouchableOpacity>
							<TouchableOpacity style={[styles.modalBtn, styles.modalSubmit]} onPress={submitReview} disabled={submitting || rating < 1}>
								{submitting ? (
									<ActivityIndicator color="#fff" />
								) : (
									<Text style={styles.modalBtnText}>Submit</Text>
								)}
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
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
	reviewButton: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 8,
		backgroundColor: "#6366f1",
	},
	reviewButtonSecondary: {
		backgroundColor: "#eef2ff",
	},
	reviewButtonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 13,
	},
	reviewButtonTextSecondary: {
		color: "#4f46e5",
	},
	modalBackdrop: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.3)",
		justifyContent: "flex-end",
	},
	modalContent: {
		backgroundColor: "#fff",
		padding: 16,
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: "#111827",
	},
	modalSubtitle: {
		fontSize: 14,
		color: "#6b7280",
		marginTop: 4,
	},
	textArea: {
		borderWidth: 1,
		borderColor: "#e5e7eb",
		borderRadius: 10,
		padding: 12,
		minHeight: 90,
		textAlignVertical: "top",
		marginTop: 8,
		color: "#111827",
	},
	modalBtn: {
		flex: 1,
		paddingVertical: 12,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
	},
	modalCancel: {
		backgroundColor: "#f3f4f6",
	},
	modalSubmit: {
		backgroundColor: "#6366f1",
	},
	modalBtnText: {
		color: "#fff",
		fontWeight: "700",
	},
});
