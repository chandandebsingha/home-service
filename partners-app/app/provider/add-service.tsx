import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Alert,
	ScrollView,
} from "react-native";
import { useAuth } from "../../src/contexts/AuthContext";
import { apiService, CreateServiceRequest } from "../../src/services/api";
import { getApiUrl } from "../../src/config/environment";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface ServiceType {
	id: number;
	name: string;
	description: string;
	categoryId: number;
	createdAt: string;
	updatedAt: string;
}

export default function AddServiceScreen() {
    const { isAuthenticated, accessToken } = useAuth();
    const { id } = useLocalSearchParams<{ id?: string }>();
	const [form, setForm] = useState<CreateServiceRequest & { serviceTypeId?: number }>({
		name: "",
		price: 0,
		availability: true,
	});
	const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
	const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                
                // Load service types
                if (accessToken) {
                    const serviceTypesRes = await fetch(getApiUrl('/services/meta/types'), {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    const serviceTypesData = await serviceTypesRes.json();
                    if (serviceTypesData.success) {
                        setServiceTypes(serviceTypesData.data || []);
                    }
                }

                // Load service data if editing
                if (id) {
                    const res = await apiService.getService(Number(id));
                    if (res.success && res.data) {
                        setForm({
                            name: res.data.name || "",
                            description: res.data.description,
                            price: res.data.price,
                            serviceType: res.data.serviceType,
                            serviceTypeId: res.data.serviceTypeId,
                            durationMinutes: res.data.durationMinutes,
                            availability: res.data.availability,
                            timeSlots: res.data.timeSlots,
                        });
                    }
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id, accessToken]);

	if (!isAuthenticated) {
		return (
			<View style={styles.center}>
				<Text style={{ fontSize: 16 }}>Please sign in to add services</Text>
			</View>
		);
	}

	const update = (key: keyof CreateServiceRequest, value: any) =>
		setForm((f) => ({ ...f, [key]: value }));

	const toNum = (v: string) => {
		const n = Number(v);
		return Number.isFinite(n) ? n : 0;
	};

    const submit = async () => {
		try {
			setLoading(true);
			const token = await AsyncStorage.getItem("access_token");
			if (!token) throw new Error("Missing access token");

            if (!form.serviceTypeId) {
                Alert.alert("Error", "Please select a service type");
                return;
            }

            const payload: CreateServiceRequest = {
                name: form.name.trim(),
                description: form.description?.trim() || undefined,
                price: Number(form.price),
                serviceType: form.serviceType?.trim() || undefined,
                serviceTypeId: form.serviceTypeId,
                durationMinutes: form.durationMinutes
                    ? Number(form.durationMinutes)
                    : undefined,
                availability: form.availability,
                timeSlots: form.timeSlots?.trim() || undefined,
            };

            const res = id
                ? await apiService.updateMyService(token, Number(id), payload)
                : await apiService.createService(token, payload);

            if (!res.success) throw new Error(res.error || (id ? "Failed to update" : "Failed to create"));
            Alert.alert("Success", id ? "Service updated" : "Service created");
			router.back();
        } catch (e: any) {
            Alert.alert("Error", e.message || (id ? "Failed to update service" : "Failed to create service"));
		} finally {
			setLoading(false);
		}
	};

	const nameOk = form.name.trim().length > 0;
	const priceOk =
		Number.isFinite(Number(form.price)) && Number(form.price) >= 0;
	const serviceTypeOk = !!form.serviceTypeId;

	return (
		<ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>{id ? 'Edit Service' : 'Add Service'}</Text>

			<Text style={styles.label}>Name</Text>
			<TextInput
				value={form.name}
				onChangeText={(t) => update("name", t)}
				style={styles.input}
				placeholder="e.g., AC Repair"
			/>

			<Text style={styles.label}>Price ($)</Text>
			<TextInput
				value={String(form.price ?? "")}
				onChangeText={(t) => update("price", toNum(t))}
				keyboardType="numeric"
				style={styles.input}
				placeholder="e.g., 120"
			/>

			<Text style={styles.label}>Description</Text>
			<TextInput
				value={form.description || ""}
				onChangeText={(t) => update("description", t)}
				style={[styles.input, { height: 100 }]}
				multiline
				placeholder="Details"
			/>

			<Text style={styles.label}>Service Type *</Text>
			<View style={styles.dropdownContainer}>
				{serviceTypes.map((serviceType) => (
					<TouchableOpacity
						key={serviceType.id}
						style={[
							styles.dropdownItem,
							form.serviceTypeId === serviceType.id && styles.dropdownItemSelected
						]}
						onPress={() => update("serviceTypeId", serviceType.id)}
					>
						<Text style={[
							styles.dropdownItemText,
							form.serviceTypeId === serviceType.id && styles.dropdownItemTextSelected
						]}>
							{serviceType.name}
						</Text>
					</TouchableOpacity>
				))}
			</View>

			<Text style={styles.label}>Duration (minutes)</Text>
			<TextInput
				value={form.durationMinutes ? String(form.durationMinutes) : ""}
				onChangeText={(t) => update("durationMinutes", toNum(t))}
				keyboardType="numeric"
				style={styles.input}
				placeholder="e.g., 90"
			/>

			<Text style={styles.label}>Time Slots (comma separated)</Text>
			<TextInput
				value={form.timeSlots || ""}
				onChangeText={(t) => update("timeSlots", t)}
				style={styles.input}
				placeholder="10:00,14:00,18:00"
			/>

			<TouchableOpacity
				style={styles.button}
				onPress={submit}
				disabled={loading || !nameOk || !priceOk || !serviceTypeOk}
			>
                <Text style={styles.buttonText}>{loading ? "Saving..." : (id ? 'Update Service' : 'Save Service')}</Text>
			</TouchableOpacity>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { padding: 20 },
	center: { flex: 1, alignItems: "center", justifyContent: "center" },
	title: { fontSize: 22, fontWeight: "700", marginBottom: 16 },
	label: { fontSize: 14, fontWeight: "600", marginTop: 12, marginBottom: 6 },
	input: {
		backgroundColor: "#fff",
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
		borderWidth: 1,
		borderColor: "#e5e7eb",
	},
	button: {
		marginTop: 20,
		backgroundColor: "#22c55e",
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: "center",
		opacity: 1,
	},
	buttonText: { color: "#fff", fontWeight: "700" },
	dropdownContainer: {
		backgroundColor: "#fff",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#e5e7eb",
		maxHeight: 200,
	},
	dropdownItem: {
		paddingHorizontal: 12,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#f3f4f6",
	},
	dropdownItemSelected: {
		backgroundColor: "#f0f9ff",
		borderLeftWidth: 3,
		borderLeftColor: "#3b82f6",
	},
	dropdownItemText: {
		fontSize: 16,
		color: "#374151",
	},
	dropdownItemTextSelected: {
		color: "#1e40af",
		fontWeight: "600",
	},
});
