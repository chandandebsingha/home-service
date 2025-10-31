import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Alert,
	TextInput,
	KeyboardAvoidingView,
	Platform,
	Keyboard,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiService } from "../../src/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Address as SavedAddress, Service } from "../../src/services/api";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

const ADDRESSES_LOCAL_KEY = "addresses_local_v1";

interface TimeSlot {
	id: string;
	time: string;
	available: boolean;
}

interface DateSlot {
	date: string;
	displayDate: string;
	timeSlots: TimeSlot[];
}

// fallback times if service doesn't provide timeSlots
const DEFAULT_TIMES = ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"];

export default function BookingScreen() {
	const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
	const [service, setService] = useState<Service | null>(null);
	const [loadingService, setLoadingService] = useState<boolean>(true);
	const [selectedDate, setSelectedDate] = useState<string>("");
	const [selectedTime, setSelectedTime] = useState<string>("");
	const [address, setAddress] = useState<string>("");
	const [specialInstructions, setSpecialInstructions] = useState<string>("");
	// Two-step flow: 1) Date & Time, 2) Address & Details
	const [currentStep, setCurrentStep] = useState<number>(1);
	const [submitting, setSubmitting] = useState(false);

	// Load user's saved address (default if available) when step 2 is reached or on mount
	useEffect(() => {
		// Try to load immediately so the field shows auto-filled
		loadAndApplySavedAddress();
	}, []);

	const formatAddress = (a: SavedAddress) =>
		[
			a.street,
			a.apartment,
			a.landmark,
			[a.city, a.state, a.pinCode].filter(Boolean).join(", "),
			a.country,
		]
			.filter(Boolean)
			.join(", ");

	const loadAndApplySavedAddress = async () => {
		try {
			const token = await AsyncStorage.getItem("access_token");
			let addresses: SavedAddress[] | undefined;
			if (token) {
				const res = await apiService.listMyAddresses(token);
				if (res.success && res.data) {
					addresses = res.data as SavedAddress[];
					// cache locally for later
					await AsyncStorage.setItem(
						ADDRESSES_LOCAL_KEY,
						JSON.stringify(addresses)
					);
				}
			}
			if (!addresses) {
				const local = await AsyncStorage.getItem(ADDRESSES_LOCAL_KEY);
				if (local) addresses = JSON.parse(local);
			}
			if (addresses && addresses.length > 0) {
				const def =
					addresses.find((a) => a.isDefault) || (addresses[0] as SavedAddress);
				if (def) setAddress(formatAddress(def));
			}
		} catch {
			// ignore silently; user can still type address
		}
	};

	// Refresh address whenever this screen regains focus (after editing in Manage Addresses)
	useFocusEffect(
		useCallback(() => {
			loadAndApplySavedAddress();
			return () => {};
		}, [])
	);

	const totalPrice = service?.price ?? 80;

	// Fetch selected service details
	useEffect(() => {
		let isMounted = true;
		(async () => {
			try {
				if (!serviceId) return;
				const res = await apiService.getService(Number(serviceId));
				if (isMounted && res.success && res.data) {
					setService(res.data as Service);
				}
			} finally {
				if (isMounted) setLoadingService(false);
			}
		})();
		return () => {
			isMounted = false;
		};
	}, [serviceId]);

	// Build two fixed time windows per day: 6AM-11:30AM and 12:30PM-6PM
	const buildSlots = (): DateSlot[] => {
		const windows = ["6AM - 11:30AM", "12:30PM - 6PM"]; // per requirement
		const days = [0, 1, 2];
		return days.map((offset, idx) => {
			const d = new Date();
			d.setDate(d.getDate() + offset);
			const iso = d.toISOString().slice(0, 10);
			const displayDate =
				idx === 0
					? "Today"
					: idx === 1
					? "Tomorrow"
					: d.toLocaleString(undefined, { month: "short", day: "numeric" });
			const timeSlots: TimeSlot[] = windows.map((w, i) => ({
				id: `${iso}-${i}`,
				time: w,
				available: true,
			}));
			return { date: iso, displayDate, timeSlots } as DateSlot;
		});
	};

	const slots = useMemo(() => buildSlots(), []);

	const formatDuration = (minutes?: number) => {
		if (!minutes) return "";
		const h = Math.floor(minutes / 60);
		const m = minutes % 60;
		if (h && m) return `${h}h ${m}m`;
		if (h) return `${h}h`;
		return `${m}m`;
	};

	const handleContinue = () => {
		if (currentStep === 1) {
			if (!selectedDate || !selectedTime) {
				Alert.alert("Time Required", "Please select a date and time");
				return;
			}
			setCurrentStep(2);
		} else if (currentStep === 2) {
			if (!address.trim()) {
				Alert.alert(
					"Address Required",
					"Please add your address in Manage Addresses.",
					[
						{ text: "Cancel", style: "cancel" },
						{
							text: "Open Addresses",
							onPress: () => router.push("/addresses"),
						},
					]
				);
				return;
			}
			handleBooking();
		}
	};

	const handleBooking = async () => {
		try {
			setSubmitting(true);
			const selectedDateSlot = slots.find((slot) => slot.date === selectedDate);
			const selectedTimeSlot = selectedDateSlot?.timeSlots.find(
				(slot) => slot.id === selectedTime
			);
			const token = await AsyncStorage.getItem("access_token");
			if (!token) {
				Alert.alert("Login Required", "Please sign in to book a service.");
				return;
			}
			const price = totalPrice;
			const payload = {
				serviceId: Number(serviceId),
				date: selectedDateSlot?.date || "",
				time: selectedTimeSlot?.time || "",
				address,
				specialInstructions: specialInstructions || undefined,
				price: Number(price),
			};
			const res = await apiService.createBooking(token, payload);
			if (!res.success) {
				throw new Error(res.error || "Failed to create booking");
			}
			router.replace("/(tabs)/bookings");
		} catch (e: any) {
			Alert.alert("Error", e.message || "Failed to create booking");
		} finally {
			setSubmitting(false);
		}
	};

	const renderStepIndicator = () => (
		<View style={styles.stepIndicator}>
			{[1, 2].map((step) => (
				<View key={step} style={styles.stepContainer}>
					<View
						style={[
							styles.stepCircle,
							currentStep >= step && styles.activeStepCircle,
						]}
					>
						<Text
							style={[
								styles.stepText,
								currentStep >= step && styles.activeStepText,
							]}
						>
							{step}
						</Text>
					</View>
					{step < 2 && (
						<View
							style={[
								styles.stepLine,
								currentStep > step && styles.activeStepLine,
							]}
						/>
					)}
				</View>
			))}
		</View>
	);

	// Removed the service selection step to streamline the flow

	const renderTimeSelection = () => (
		<View style={styles.stepContent}>
			<Text style={styles.stepTitle}>Select Date & Time</Text>
			<Text style={styles.stepSubtitle}>When would you like the service?</Text>

			{slots.map((dateSlot: DateSlot) => (
				<View key={dateSlot.date} style={styles.dateSection}>
					<Text style={styles.dateTitle}>{dateSlot.displayDate}</Text>
					<View style={styles.timeSlotsContainer}>
						{dateSlot.timeSlots.map((timeSlot: TimeSlot) => (
							<TouchableOpacity
								key={timeSlot.id}
								style={[
									styles.timeSlot,
									!timeSlot.available && styles.unavailableTimeSlot,
									selectedTime === timeSlot.id && styles.selectedTimeSlot,
								]}
								onPress={() => {
									if (timeSlot.available) {
										setSelectedDate(dateSlot.date);
										setSelectedTime(timeSlot.id);
									}
								}}
								disabled={!timeSlot.available}
								activeOpacity={0.7}
							>
								<Text
									style={[
										styles.timeSlotText,
										!timeSlot.available && styles.unavailableTimeSlotText,
										selectedTime === timeSlot.id && styles.selectedTimeSlotText,
									]}
								>
									{timeSlot.time}
								</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>
			))}
		</View>
	);

	const renderAddressAndDetails = () => (
		<View style={styles.stepContent}>
			<Text style={styles.stepTitle}>Address & Details</Text>
			<Text style={styles.stepSubtitle}>
				Where should we provide the service?
			</Text>

			<View style={styles.inputSection}>
				<Text style={styles.inputLabel}>Service Address</Text>
				{address?.trim() ? (
					<>
						<TextInput
							style={styles.textInput}
							value={address}
							editable={false}
							selectTextOnFocus={false}
							multiline
						/>
						<TouchableOpacity
							style={{ marginTop: 8 }}
							onPress={() => router.push("/addresses")}
						>
							<Text style={{ color: "#6366f1", fontWeight: "600" }}>
								Change in Manage Addresses
							</Text>
						</TouchableOpacity>
					</>
				) : (
					<TouchableOpacity
						style={styles.addAddressButton}
						onPress={() => router.push("/addresses")}
					>
						<MaterialIcons name="add" size={18} color="#6366f1" />
						<Text style={styles.addAddressText}>Add Address</Text>
					</TouchableOpacity>
				)}
			</View>

			<View style={styles.inputSection}>
				<Text style={styles.inputLabel}>Special Instructions (Optional)</Text>
				<TextInput
					style={[styles.textInput, styles.textArea]}
					value={specialInstructions}
					onChangeText={setSpecialInstructions}
					placeholder="Any special instructions or notes"
					multiline
					numberOfLines={4}
				/>
			</View>

			<View style={styles.bookingSummary}>
				<Text style={styles.summaryTitle}>Booking Summary</Text>
				<View style={styles.summaryItem}>
					<Text style={styles.summaryLabel}>Service:</Text>
					<Text style={styles.summaryValue}>
						{service?.name || "Selected Service"}
					</Text>
				</View>
				<View style={styles.summaryItem}>
					<Text style={styles.summaryLabel}>Duration:</Text>
					<Text style={styles.summaryValue}>
						{formatDuration(service?.durationMinutes)}
					</Text>
				</View>
				<View style={styles.summaryItem}>
					<Text style={styles.summaryLabel}>Date & Time:</Text>
					<Text style={styles.summaryValue}>
						{slots.find((s: DateSlot) => s.date === selectedDate)?.displayDate}{" "}
						at{" "}
						{
							slots
								.find((s: DateSlot) => s.date === selectedDate)
								?.timeSlots.find((t: TimeSlot) => t.id === selectedTime)?.time
						}
					</Text>
				</View>
				<View style={[styles.summaryItem, styles.totalItem]}>
					<Text style={styles.totalLabel}>Total:</Text>
					<Text style={styles.totalValue}>₹{totalPrice}</Text>
				</View>
			</View>
		</View>
	);

	const renderCurrentStep = () => {
		switch (currentStep) {
			case 1:
				return renderTimeSelection();
			case 2:
				return renderAddressAndDetails();
			default:
				return null;
		}
	};

	const getButtonText = () => {
		switch (currentStep) {
			case 1:
				return "Continue to Details";
			case 2:
				return submitting ? "Booking..." : `Book Now - ₹ ${totalPrice}`;
			default:
				return "Continue";
		}
	};

	return (
		<SafeAreaView style={styles.container} edges={["left", "right", "bottom"]}>
			<KeyboardAvoidingView
				style={styles.keyboardView}
				behavior={"padding"}
				keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })}
			>
				{renderStepIndicator()}

				<ScrollView
					style={styles.scrollView}
					contentInsetAdjustmentBehavior="never"
					keyboardShouldPersistTaps="handled"
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.scrollContent}
				>
					{renderCurrentStep()}
				</ScrollView>

				<View style={styles.buttonContainer}>
					{currentStep > 1 && (
						<TouchableOpacity
							style={styles.backButton}
							onPress={() => setCurrentStep(currentStep - 1)}
						>
							<Text style={styles.backButtonText}>Back</Text>
						</TouchableOpacity>
					)}
					<TouchableOpacity
						style={[
							styles.continueButton,
							currentStep > 1 && styles.continueButtonSmall,
						]}
						onPress={handleContinue}
						disabled={submitting}
					>
						<Text style={styles.continueButtonText}>{getButtonText()}</Text>
					</TouchableOpacity>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f8fafc",
	},
	keyboardView: {
		flex: 1,
	},
	stepIndicator: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 20,
		backgroundColor: "#fff",
	},
	stepContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	stepCircle: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: "#e5e7eb",
		alignItems: "center",
		justifyContent: "center",
	},
	activeStepCircle: {
		backgroundColor: "#6366f1",
	},
	stepText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#6b7280",
	},
	activeStepText: {
		color: "#fff",
	},
	stepLine: {
		width: 40,
		height: 2,
		backgroundColor: "#e5e7eb",
		marginHorizontal: 8,
	},
	activeStepLine: {
		backgroundColor: "#6366f1",
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingBottom: 20,
	},
	stepContent: {
		padding: 20,
	},
	stepTitle: {
		fontSize: 24,
		fontWeight: "700",
		color: "#1f2937",
		marginBottom: 8,
	},
	stepSubtitle: {
		fontSize: 16,
		color: "#6b7280",
		marginBottom: 24,
	},
	serviceOption: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 16,
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 12,
		borderWidth: 2,
		borderColor: "transparent",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	selectedServiceOption: {
		borderColor: "#6366f1",
	},
	serviceInfo: {
		flex: 1,
	},
	serviceName: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1f2937",
		marginBottom: 4,
	},
	serviceDuration: {
		fontSize: 14,
		color: "#6b7280",
	},
	servicePrice: {
		marginRight: 12,
	},
	priceText: {
		fontSize: 18,
		fontWeight: "700",
		color: "#1f2937",
	},
	dateSection: {
		marginBottom: 24,
	},
	dateTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#1f2937",
		marginBottom: 12,
	},
	timeSlotsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
	},
	timeSlot: {
		backgroundColor: "#fff",
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 8,
		borderWidth: 2,
		borderColor: "#e5e7eb",
		minWidth: 80,
		alignItems: "center",
	},
	selectedTimeSlot: {
		borderColor: "#6366f1",
		backgroundColor: "#f0f9ff",
	},
	unavailableTimeSlot: {
		backgroundColor: "#f9fafb",
		borderColor: "#e5e7eb",
	},
	timeSlotText: {
		fontSize: 14,
		fontWeight: "500",
		color: "#1f2937",
	},
	selectedTimeSlotText: {
		color: "#6366f1",
		fontWeight: "600",
	},
	unavailableTimeSlotText: {
		color: "#9ca3af",
	},
	inputSection: {
		marginBottom: 20,
	},
	inputLabel: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1f2937",
		marginBottom: 8,
	},
	textInput: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 16,
		fontSize: 16,
		color: "#1f2937",
		borderWidth: 1,
		borderColor: "#e5e7eb",
	},
	textArea: {
		height: 100,
		textAlignVertical: "top",
	},
	addAddressButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		borderWidth: 1,
		borderColor: "#e5e7eb",
		borderRadius: 12,
		paddingVertical: 14,
		paddingHorizontal: 16,
		backgroundColor: "#fff",
	},
	addAddressText: {
		color: "#6366f1",
		fontWeight: "600",
		fontSize: 16,
	},
	bookingSummary: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 20,
		marginTop: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 3,
	},
	summaryTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#1f2937",
		marginBottom: 16,
	},
	summaryItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 12,
	},
	summaryLabel: {
		fontSize: 14,
		color: "#6b7280",
	},
	summaryValue: {
		fontSize: 14,
		fontWeight: "500",
		color: "#1f2937",
	},
	totalItem: {
		borderTopWidth: 1,
		borderTopColor: "#e5e7eb",
		paddingTop: 12,
		marginTop: 8,
	},
	totalLabel: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1f2937",
	},
	totalValue: {
		fontSize: 18,
		fontWeight: "700",
		color: "#1f2937",
	},
	buttonContainer: {
		backgroundColor: "#fff",
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderTopWidth: 1,
		borderTopColor: "#e5e7eb",
		flexDirection: "row",
		gap: 12,
	},
	backButton: {
		flex: 1,
		backgroundColor: "#f3f4f6",
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: "center",
	},
	backButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#374151",
	},
	continueButton: {
		flex: 2,
		backgroundColor: "#6366f1",
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: "center",
	},
	continueButtonSmall: {
		flex: 2,
	},
	continueButtonText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#fff",
	},
});
