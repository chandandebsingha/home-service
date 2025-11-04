import React, { useEffect, useMemo, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	ActivityIndicator,
	TouchableOpacity,
	Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { apiService, Booking, Service } from "@/src/services/api";
import { useAuth } from "@/src/contexts/AuthContext";

export default function BookingDetailsScreen() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const router = useRouter();
	const { isAuthenticated, accessToken } = useAuth();

	const [booking, setBooking] = useState<Booking | null>(null);
	const [services, setServices] = useState<Service[]>([]);
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);
	// OTP UI removed

	useEffect(() => {
		const fetchBooking = async () => {
			if (!id || Array.isArray(id)) {
				Alert.alert("Invalid booking", "No booking selected.");
				setLoading(false);
				return;
			}

			if (!isAuthenticated || !accessToken) {
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				const [bookingsRes, servicesRes] = await Promise.all([
					apiService.listPartnerBookings(accessToken),
					apiService.listMyServices(accessToken),
				]);

				if (servicesRes.success && servicesRes.data) {
					setServices(servicesRes.data);
				}

				if (bookingsRes.success && bookingsRes.data) {
					const current = bookingsRes.data.find(
						(item) => item.id === Number(id)
					);
					setBooking(current ?? null);
					if (!current) {
						Alert.alert("Not found", "We could not locate that booking.");
					}
				} else {
					Alert.alert(
						"Error",
						bookingsRes.error ||
							bookingsRes.message ||
							"Failed to load booking."
					);
				}
			} catch (error: any) {
				Alert.alert(
					"Error",
					error?.message || "Something went wrong while loading this booking."
				);
			} finally {
				setLoading(false);
			}
		};

		fetchBooking();
	}, [id, isAuthenticated, accessToken]);

	const serviceName = useMemo(() => {
		if (!booking) return "";
		const service = services.find((item) => item.id === booking.serviceId);
		return service?.name || `Service #${booking.serviceId}`;
	}, [services, booking]);

	const formatCurrency = (value?: number | string) => {
		if (value == null) return "-";
		const numeric = typeof value === "string" ? Number(value) : value;
		if (!Number.isFinite(numeric)) {
			return typeof value === "string" ? value : value.toString();
		}
		return `₹ ${numeric.toLocaleString("en-IN")}`;
	};

	const formatDate = (value?: string) => {
		if (!value) return "-";
		const parsed = new Date(value);
		if (Number.isNaN(parsed.getTime())) {
			return value;
		}
		return parsed.toLocaleString();
	};

	const getStatusColor = (status: Booking["status"]) => {
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

	const handleComplete = async () => {
		if (!booking || !accessToken) return;
		try {
			setSubmitting(true);
			const res = await apiService.verifyPartnerBookingCompletion(
				accessToken,
				booking.id
			);
			if (res.success && res.data) {
				setBooking(res.data);
				Alert.alert("Success", "Booking marked as completed.");
			} else {
				Alert.alert("Error", res.error || "Failed to complete booking.");
			}
		} catch (err: any) {
			Alert.alert("Error", err?.message || "Failed to complete booking.");
		} finally {
			setSubmitting(false);
		}
	};

	if (!isAuthenticated) {
		return (
			<View style={styles.centerContainer}>
				<MaterialIcons name="lock" size={64} color="#9ca3af" />
				<Text style={styles.centerTitle}>Sign in required</Text>
				<Text style={styles.centerSubtitle}>
					Please sign in to review your booking details.
				</Text>
				<Link href="/auth/login" asChild>
					<TouchableOpacity style={styles.primaryButton}>
						<Text style={styles.primaryButtonText}>Sign In</Text>
					</TouchableOpacity>
				</Link>
			</View>
		);
	}

	if (loading) {
		return (
			<View style={styles.centerContainer}>
				<ActivityIndicator size="large" color="#6366f1" />
				<Text style={styles.centerSubtitle}>Loading booking details...</Text>
			</View>
		);
	}

	if (!booking) {
		return (
			<View style={styles.centerContainer}>
				<MaterialIcons name="event-busy" size={64} color="#cbd5f5" />
				<Text style={styles.centerTitle}>Booking not found</Text>
				<Text style={styles.centerSubtitle}>
					We could not find the booking you were looking for.
				</Text>
				<TouchableOpacity
					style={styles.primaryButton}
					onPress={() => router.back()}
				>
					<Text style={styles.primaryButtonText}>Go Back</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<ScrollView style={styles.container} contentContainerStyle={styles.content}>
			<TouchableOpacity
				style={styles.backButton}
				activeOpacity={0.8}
				onPress={() => router.back()}
			>
				<MaterialIcons name="arrow-back" size={20} color="#4338ca" />
				<Text style={styles.backButtonText}>Back</Text>
			</TouchableOpacity>

			<View style={styles.card}>
				<View style={styles.cardHeader}>
					<View style={{ flex: 1 }}>
						<Text style={styles.cardTitle}>{serviceName}</Text>
						<Text style={styles.cardSubtitle}>Ref #{booking.id}</Text>
					</View>
					<View style={styles.statusChip}>
						<View
							style={[
								styles.statusDot,
								{ backgroundColor: getStatusColor(booking.status) },
							]}
						/>
						<Text style={styles.statusLabel}>
							{booking.status.replace(/-/g, " ")}
						</Text>
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionLabel}>Schedule</Text>
					<View style={styles.sectionRow}>
						<MaterialIcons name="calendar-today" size={18} color="#4338ca" />
						<Text style={styles.sectionValue}>
							{booking.date} · {booking.time}
						</Text>
					</View>
					<View style={styles.sectionRow}>
						<MaterialIcons name="schedule" size={18} color="#4338ca" />
						<Text style={styles.sectionValue}>
							Created {formatDate(booking.createdAt)}
						</Text>
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionLabel}>Address</Text>
					<View style={styles.sectionRow}>
						<MaterialIcons name="location-on" size={18} color="#4338ca" />
						<Text style={styles.sectionValue}>{booking.address}</Text>
					</View>
				</View>

				<View style={styles.section}>
					<Text style={styles.sectionLabel}>Special Instructions</Text>
					<Text style={styles.sectionValue}>
						{booking.specialInstructions?.trim() ||
							"No special instructions provided."}
					</Text>
				</View>

				{/* Minimal payout row (replaces the previous inside card) */}
				<View style={styles.amountRow}>
					<Text style={styles.amountLabel}>Expected payout</Text>
					<Text style={styles.amountValue}>
						{formatCurrency(booking.price)}
					</Text>
				</View>

				{booking.status === "upcoming" && (
					<TouchableOpacity
						style={styles.completeButton}
						activeOpacity={0.9}
						onPress={handleComplete}
						disabled={submitting}
					>
						<MaterialIcons name="done" size={18} color="#f8fafc" />
						<Text style={styles.completeButtonText}>
							{submitting ? "Working..." : "Complete"}
						</Text>
					</TouchableOpacity>
				)}

				<View style={styles.sectionDivider} />

				<View style={styles.metaRow}>
					<View style={styles.metaColumn}>
						<Text style={styles.metaLabel}>Customer ID</Text>
						<Text style={styles.metaValue}>#{booking.userId}</Text>
					</View>
					<View style={styles.metaColumn}>
						<Text style={styles.metaLabel}>Service ID</Text>
						<Text style={styles.metaValue}>#{booking.serviceId}</Text>
					</View>
				</View>
			</View>

			{/* OTP UI removed */}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f8fafc",
	},
	content: {
		padding: 20,
		paddingBottom: 40,
	},
	backButton: {
		flexDirection: "row",
		alignItems: "center",
		alignSelf: "flex-start",
		paddingVertical: 6,
		paddingHorizontal: 10,
		borderRadius: 999,
		backgroundColor: "#eef2ff",
		marginBottom: 16,
	},
	backButtonText: {
		marginLeft: 6,
		color: "#4338ca",
		fontWeight: "600",
		letterSpacing: 0.2,
		textTransform: "uppercase",
	},
	card: {
		backgroundColor: "#fff",
		borderRadius: 18,
		padding: 20,
		borderWidth: 1,
		borderColor: "#e5e7eb",
		shadowColor: "#0f172a",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.03,
		shadowRadius: 4,
		elevation: 1,
	},
	cardHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 20,
	},
	cardTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: "#111827",
		marginBottom: 4,
	},
	cardSubtitle: {
		fontSize: 12,
		color: "#94a3b8",
		letterSpacing: 1,
		textTransform: "uppercase",
	},
	statusChip: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 14,
		paddingVertical: 6,
		borderRadius: 999,
		borderWidth: 1,
		borderColor: "#e2e8f0",
		backgroundColor: "#f8fafc",
	},
	statusDot: {
		width: 8,
		height: 8,
		borderRadius: 999,
		marginRight: 6,
	},
	statusLabel: {
		fontSize: 12,
		fontWeight: "600",
		textTransform: "capitalize",
		color: "#475569",
	},
	section: {
		marginBottom: 20,
	},
	sectionLabel: {
		fontSize: 13,
		fontWeight: "700",
		color: "#475569",
		textTransform: "uppercase",
		letterSpacing: 0.8,
		marginBottom: 10,
	},
	sectionRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		marginBottom: 12,
	},
	sectionValue: {
		flex: 1,
		marginLeft: 10,
		fontSize: 15,
		lineHeight: 22,
		color: "#1f2937",
	},
	summaryBox: {
		padding: 16,
		borderRadius: 14,
		backgroundColor: "#eef2ff",
		borderWidth: 1,
		borderColor: "#c7d2fe",
		alignItems: "center",
	},
	summaryLabel: {
		fontSize: 12,
		color: "#6366f1",
		textTransform: "uppercase",
		letterSpacing: 0.8,
	},
	summaryValue: {
		marginTop: 6,
		fontSize: 22,
		fontWeight: "700",
		color: "#312e81",
	},
	// Minimal payout row styles
	amountRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 8,
	},
	amountLabel: {
		fontSize: 12,
		color: "#94a3b8",
		textTransform: "uppercase",
		letterSpacing: 0.8,
	},
	amountValue: {
		fontSize: 18,
		fontWeight: "700",
		color: "#0f172a",
	},
	completeButton: {
		marginTop: 16,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#111827",
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 999,
	},
	completeButtonText: {
		color: "#f8fafc",
		fontSize: 14,
		fontWeight: "700",
		textTransform: "uppercase",
		marginLeft: 8,
		letterSpacing: 0.3,
	},
	sectionDivider: {
		height: StyleSheet.hairlineWidth,
		backgroundColor: "#e2e8f0",
		marginVertical: 20,
	},
	metaRow: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	metaColumn: {
		flex: 1,
	},
	metaLabel: {
		fontSize: 11,
		textTransform: "uppercase",
		color: "#94a3b8",
		marginBottom: 4,
	},
	metaValue: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1f2937",
	},
	centerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 32,
		backgroundColor: "#f8fafc",
	},
	centerTitle: {
		marginTop: 16,
		fontSize: 20,
		fontWeight: "700",
		color: "#1f2937",
	},
	centerSubtitle: {
		marginTop: 10,
		fontSize: 15,
		color: "#6b7280",
		textAlign: "center",
		lineHeight: 22,
	},
	primaryButton: {
		marginTop: 20,
		backgroundColor: "#4338ca",
		paddingVertical: 12,
		paddingHorizontal: 28,
		borderRadius: 10,
	},
	primaryButtonText: {
		color: "#f8fafc",
		fontSize: 15,
		fontWeight: "600",
		letterSpacing: 0.2,
		textTransform: "uppercase",
	},
	otpModal: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.4)",
		justifyContent: "center",
		padding: 24,
	},
	otpCard: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 20,
	},
	otpTitle: {
		fontSize: 16,
		fontWeight: "700",
		color: "#111827",
	},
	otpHint: {
		marginTop: 6,
		color: "#6b7280",
	},
	otpInput: {
		marginTop: 14,
		borderWidth: 1,
		borderColor: "#e5e7eb",
		borderRadius: 10,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 16,
		letterSpacing: 4,
	},
	otpResend: {
		alignSelf: "flex-start",
		paddingVertical: 8,
	},
	otpResendText: {
		color: "#4338ca",
		fontWeight: "700",
	},
	otpActions: {
		marginTop: 16,
		flexDirection: "row",
	},
	otpCancel: {
		flex: 1,
		borderWidth: 1,
		borderColor: "#e5e7eb",
		borderRadius: 10,
		paddingVertical: 12,
		alignItems: "center",
		marginRight: 10,
		backgroundColor: "#f8fafc",
	},
	otpCancelText: {
		color: "#475569",
		fontWeight: "600",
	},
	otpConfirm: {
		flex: 1,
		backgroundColor: "#4338ca",
		borderRadius: 10,
		paddingVertical: 12,
		alignItems: "center",
	},
	otpConfirmText: {
		color: "#f8fafc",
		fontWeight: "700",
		textTransform: "uppercase",
		letterSpacing: 0.3,
	},
});
