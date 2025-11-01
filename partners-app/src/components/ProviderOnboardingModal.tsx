import React, { useEffect, useState } from "react";
import {
	Modal,
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	Alert,
	ActivityIndicator,
	BackHandler,
} from "react-native";
import {
	apiService,
	CreateProviderProfileRequest,
	Occupation,
} from "@/src/services/api";
import { useAuth } from "@/src/contexts/AuthContext";

interface Props {
	visible: boolean;
	onSubmitted: () => void;
}

const ProviderOnboardingModal: React.FC<Props> = ({ visible, onSubmitted }) => {
	const { accessToken } = useAuth();
	const [loading, setLoading] = useState(false);
	const [loadingOccupations, setLoadingOccupations] = useState(false);
	const [occupations, setOccupations] = useState<Occupation[]>([]);
	const [form, setForm] = useState<CreateProviderProfileRequest>({
		occupationId: 0,
		businessName: "",
		businessAddress: "",
		phoneNumber: "",
		experience: "",
		skills: [],
		certifications: [],
		bio: "",
	});

	// Address form fields
	const [street, setStreet] = useState("");
	const [apartment, setApartment] = useState("");
	const [landmark, setLandmark] = useState("");
	const [city, setCity] = useState("");
	const [stateVal, setStateVal] = useState("");
	const [pinCode, setPinCode] = useState("");
	const [country, setCountry] = useState("");
	const [latitude, setLatitude] = useState("");
	const [longitude, setLongitude] = useState("");

	useEffect(() => {
		if (visible) {
			loadOccupations();
		}
	}, [visible]);

	// Intercept Android hardware back button while modal is open
	useEffect(() => {
		if (!visible) return;
		const sub = BackHandler.addEventListener("hardwareBackPress", () => {
			Alert.alert(
				"Action required",
				"Please complete your business profile to continue."
			);
			return true; // prevent default back behavior
		});
		return () => sub.remove();
	}, [visible]);

	const loadOccupations = async () => {
		setLoadingOccupations(true);
		const res = await apiService.listPublicOccupations();
		if (res.success && res.data) {
			const items = res.data;
			setOccupations(items);
			if (items.length > 0) {
				setForm((f) => ({ ...f, occupationId: items[0].id }));
			}
		} else {
			Alert.alert("Error", res.error || "Failed to load occupations");
		}
		setLoadingOccupations(false);
	};

	const updateField = (key: keyof CreateProviderProfileRequest, value: any) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	const parseCommaList = (text?: string) =>
		text
			? text
					.split(",")
					.map((s) => s.trim())
					.filter(Boolean)
			: [];

	const handleSubmit = async () => {
		if (!accessToken) return;
		// If occupations list exists, require selection; if empty, allow submit without occupation
		if ((occupations?.length || 0) > 0 && !form.occupationId) {
			Alert.alert("Missing field", "Please select an occupation.");
			return;
		}

		// Validate address fields
		if (
			!street.trim() ||
			!city.trim() ||
			!stateVal.trim() ||
			!pinCode.trim() ||
			!country.trim()
		) {
			Alert.alert(
				"Missing address",
				"Please fill required address fields: street, city, state, pin code and country."
			);
			return;
		}

		setLoading(true);

		try {
			// First, create the address
			const addressPayload = {
				street: street.trim(),
				apartment: apartment.trim() || undefined,
				landmark: landmark.trim() || undefined,
				city: city.trim(),
				state: stateVal.trim(),
				pinCode: pinCode.trim(),
				country: country.trim(),
				latitude: latitude ? Number(latitude) : undefined,
				longitude: longitude ? Number(longitude) : undefined,
				isDefault: true, // Set as default address for the provider
			};

			const addressRes = await apiService.createAddress(
				accessToken,
				addressPayload
			);

			if (!addressRes.success || !addressRes.data) {
				Alert.alert(
					"Address creation failed",
					addressRes.error || "Could not create address"
				);
				setLoading(false);
				return;
			}

			const addressId = addressRes.data.id;

			// Then, create the provider profile with addressId
			const payload: any = {
				...form,
				addressId, // Include the address ID
				skills: form.skills || [],
				certifications: form.certifications || [],
			};
			// Remove old businessAddress field
			delete payload.businessAddress;

			if (!form.occupationId) delete payload.occupationId;

			const res = await apiService.createProviderProfile(accessToken, payload);
			setLoading(false);

			if (!res.success) {
				Alert.alert("Submit failed", res.error || "Could not submit details");
				return;
			}

			Alert.alert("Submitted", "Your details were submitted for verification.");
			onSubmitted();
		} catch (error: any) {
			setLoading(false);
			Alert.alert("Error", error.message || "An error occurred");
		}
	};

	return (
		<Modal
			visible={visible}
			transparent
			animationType="slide"
			onRequestClose={() => {
				Alert.alert(
					"Action required",
					"Please complete your business profile to continue."
				);
			}}
			presentationStyle="fullScreen"
		>
			<View style={styles.overlay}>
				<View style={styles.card}>
					<Text style={styles.title}>Complete your business profile</Text>
					<Text style={styles.subtitle}>
						Provide details so we can verify your partner account.
					</Text>

					{loadingOccupations ? (
						<View style={{ padding: 16, alignItems: "center" }}>
							<ActivityIndicator />
							<Text style={{ marginTop: 8, color: "#6b7280" }}>Loading...</Text>
						</View>
					) : (
						<ScrollView style={{ maxHeight: 420 }}>
							{/* Occupation (simple select via buttons for RN basic) */}
							<Text style={styles.label}>Occupation</Text>
							{occupations.length === 0 ? (
								<View style={{ paddingVertical: 8 }}>
									<Text style={{ color: "#6b7280" }}>
										No occupations are available yet. You can submit your
										profile and add this later.
									</Text>
								</View>
							) : (
								<View style={styles.chipsRow}>
									{occupations.map((occ) => (
										<TouchableOpacity
											key={occ.id}
											style={[
												styles.chip,
												form.occupationId === occ.id && styles.chipActive,
											]}
											onPress={() => updateField("occupationId", occ.id)}
										>
											<Text
												style={
													form.occupationId === occ.id
														? styles.chipTextActive
														: styles.chipText
												}
											>
												{occ.name}
											</Text>
										</TouchableOpacity>
									))}
								</View>
							)}

							<Text style={styles.label}>Business name</Text>
							<TextInput
								style={styles.input}
								placeholder="e.g. Spark Cleaners"
								value={form.businessName}
								onChangeText={(t) => updateField("businessName", t)}
							/>

							{/* Business Address Section */}
							<Text
								style={[
									styles.label,
									{ marginTop: 16, fontSize: 15, fontWeight: "700" },
								]}
							>
								Business Address
							</Text>

							<Text style={styles.label}>Street *</Text>
							<TextInput
								style={styles.input}
								placeholder="Street / Address line"
								value={street}
								onChangeText={setStreet}
							/>

							<Text style={styles.label}>Apartment / Suite</Text>
							<TextInput
								style={styles.input}
								placeholder="Apt, Suite, Building"
								value={apartment}
								onChangeText={setApartment}
							/>

							<Text style={styles.label}>Landmark</Text>
							<TextInput
								style={styles.input}
								placeholder="Near ..."
								value={landmark}
								onChangeText={setLandmark}
							/>

							<Text style={styles.label}>City *</Text>
							<TextInput
								style={styles.input}
								placeholder="City"
								value={city}
								onChangeText={setCity}
							/>

							<Text style={styles.label}>State *</Text>
							<TextInput
								style={styles.input}
								placeholder="State"
								value={stateVal}
								onChangeText={setStateVal}
							/>

							<Text style={styles.label}>Pin Code *</Text>
							<TextInput
								style={styles.input}
								placeholder="Pin code"
								keyboardType="numeric"
								value={pinCode}
								onChangeText={setPinCode}
							/>

							<Text style={styles.label}>Country *</Text>
							<TextInput
								style={styles.input}
								placeholder="Country"
								value={country}
								onChangeText={setCountry}
							/>

							<View style={{ flexDirection: "row", gap: 8 }}>
								<View style={{ flex: 1 }}>
									<Text style={styles.label}>Latitude</Text>
									<TextInput
										style={styles.input}
										placeholder="12.9716"
										keyboardType="numeric"
										value={latitude}
										onChangeText={setLatitude}
									/>
								</View>
								<View style={{ flex: 1 }}>
									<Text style={styles.label}>Longitude</Text>
									<TextInput
										style={styles.input}
										placeholder="77.5946"
										keyboardType="numeric"
										value={longitude}
										onChangeText={setLongitude}
									/>
								</View>
							</View>

							<Text style={styles.label}>Phone number</Text>
							<TextInput
								style={styles.input}
								placeholder="Contact phone"
								keyboardType="phone-pad"
								value={form.phoneNumber}
								onChangeText={(t) => updateField("phoneNumber", t)}
							/>

							<Text style={styles.label}>Experience</Text>
							<TextInput
								style={styles.input}
								placeholder="e.g. 3 years"
								value={form.experience}
								onChangeText={(t) => updateField("experience", t)}
							/>

							<Text style={styles.label}>Skills (comma separated)</Text>
							<TextInput
								style={styles.input}
								placeholder="e.g. plumbing, painting"
								value={(form.skills || []).join(", ")}
								onChangeText={(t) => updateField("skills", parseCommaList(t))}
							/>

							<Text style={styles.label}>Certifications (comma separated)</Text>
							<TextInput
								style={styles.input}
								placeholder="e.g. ISO 9001"
								value={(form.certifications || []).join(", ")}
								onChangeText={(t) =>
									updateField("certifications", parseCommaList(t))
								}
							/>

							<Text style={styles.label}>Bio</Text>
							<TextInput
								style={[styles.input, { height: 80 }]}
								placeholder="Tell customers about your business"
								multiline
								value={form.bio}
								onChangeText={(t) => updateField("bio", t)}
							/>
						</ScrollView>
					)}

					<View style={styles.actions}>
						<TouchableOpacity
							style={[styles.button, styles.primary]}
							onPress={handleSubmit}
							disabled={loading || loadingOccupations}
						>
							<Text style={styles.primaryText}>
								{loading ? "Submitting..." : "Submit"}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.4)",
		justifyContent: "center",
		padding: 16,
	},
	card: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 16,
	},
	title: { fontSize: 18, fontWeight: "700", color: "#111827" },
	subtitle: { fontSize: 14, color: "#6b7280", marginTop: 4, marginBottom: 12 },
	label: {
		fontSize: 14,
		fontWeight: "600",
		color: "#374151",
		marginTop: 12,
		marginBottom: 6,
	},
	input: {
		borderWidth: 1,
		borderColor: "#e5e7eb",
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		backgroundColor: "#f9fafb",
	},
	chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
	chip: {
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 16,
		backgroundColor: "#f3f4f6",
		marginRight: 8,
		marginBottom: 8,
	},
	chipActive: { backgroundColor: "#eef2ff" },
	chipText: { color: "#374151" },
	chipTextActive: { color: "#4f46e5", fontWeight: "600" },
	actions: {
		flexDirection: "row",
		justifyContent: "flex-end",
		gap: 8,
		marginTop: 12,
	},
	button: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8 },
	secondary: { backgroundColor: "#f3f4f6" },
	primary: { backgroundColor: "#6366f1" },
	secondaryText: { color: "#111827", fontWeight: "600" },
	primaryText: { color: "#fff", fontWeight: "700" },
});

export default ProviderOnboardingModal;
