import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiService, Address, CreateAddressRequest } from "../src/services/api";
import { useAuth } from "../src/contexts/AuthContext";

const LOCAL_KEY = "addresses_local_v1";

export default function AddressesScreen() {
  useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // form state
  const [street, setStreet] = useState("");
  const [apartment, setApartment] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [country, setCountry] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      return token;
    } catch {
      return null;
    }
  };

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (token) {
        const res = await apiService.listMyAddresses(token);
        if (res.success && res.data) {
          setAddresses(res.data as Address[]);
          await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(res.data));
        } else {
          // fallback to local
          const local = await AsyncStorage.getItem(LOCAL_KEY);
          if (local) setAddresses(JSON.parse(local));
        }
      } else {
        const local = await AsyncStorage.getItem(LOCAL_KEY);
        if (local) setAddresses(JSON.parse(local));
      }
    } catch {
      const local = await AsyncStorage.getItem(LOCAL_KEY);
      if (local) setAddresses(JSON.parse(local));
    } finally {
      setLoading(false);
    }
  };

  const onSave = async () => {
    if (
      !street.trim() ||
      !city.trim() ||
      !stateVal.trim() ||
      !pinCode.trim() ||
      !country.trim()
    ) {
      Alert.alert(
        "Validation",
        "Please fill required fields: street, city, state, pin code and country"
      );
      return;
    }

    const payload: CreateAddressRequest = {
      street: street.trim(),
      apartment: apartment.trim() || undefined,
      landmark: landmark.trim() || undefined,
      city: city.trim(),
      state: stateVal.trim(),
      pinCode: pinCode.trim(),
      country: country.trim(),
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      isDefault,
    };

    setLoading(true);
    try {
      const token = await getToken();
      if (token) {
        if (editingId) {
          const res = await apiService.updateAddress(
            token,
            editingId,
            payload as any
          );
          if (res.success && res.data) {
            const updatedAddr = res.data as Address;
            const updated = addresses.map((a) =>
              a.id === updatedAddr.id ? updatedAddr : a
            );
            setAddresses(updated);
            await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
            Alert.alert("Success", "Address updated");
            resetForm();
            setShowForm(false);
            setEditingId(null);
            return;
          }
        } else {
          const res = await apiService.createAddress(token, payload as any);
          if (res.success && res.data) {
            const newAddr = res.data as Address;
            const updated = [newAddr, ...addresses];
            setAddresses(updated);
            await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
            Alert.alert("Success", "Address saved");
            resetForm();
            setShowForm(false);
            return;
          }
        }
        // if API failed, fallthrough to local save
      }

      // fallback local save (create only)
      if (!editingId) {
        const localAddr: Address = {
          id: Date.now(),
          street: payload.street,
          apartment: payload.apartment || undefined,
          landmark: payload.landmark || undefined,
          city: payload.city,
          state: payload.state,
          pinCode: payload.pinCode,
          country: payload.country,
          latitude: payload.latitude as any,
          longitude: payload.longitude as any,
          isDefault: payload.isDefault || false,
          createdAt: new Date().toISOString(),
        };

        const updated = [localAddr, ...addresses];
        setAddresses(updated);
        await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
        Alert.alert(
          "Saved locally",
          "Address saved locally (backend not available)"
        );
        resetForm();
        setShowForm(false);
      } else {
        Alert.alert("Error", "Failed to update address");
      }
    } catch {
      Alert.alert("Error", "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStreet("");
    setApartment("");
    setLandmark("");
    setCity("");
    setStateVal("");
    setPinCode("");
    setCountry("");
    setLatitude("");
    setLongitude("");
    setIsDefault(false);
    setEditingId(null);
  };

  const onEdit = (addr: Address) => {
    setEditingId(addr.id || null);
    setStreet(addr.street || "");
    setApartment(addr.apartment || "");
    setLandmark(addr.landmark || "");
    setCity(addr.city || "");
    setStateVal(addr.state || "");
    setPinCode(addr.pinCode || "");
    setCountry(addr.country || "");
    setLatitude(addr.latitude ? String(Number(addr.latitude)) : "");
    setLongitude(addr.longitude ? String(Number(addr.longitude)) : "");
    setIsDefault(!!addr.isDefault);
    setShowForm(true);
  };

  const onDelete = async (addr: Address) => {
    Alert.alert("Delete", "Are you sure you want to delete this address?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            const token = await getToken();
            if (token && addr.id) {
              const res = await apiService.deleteAddress(token, addr.id);
              if (res.success) {
                const updated = addresses.filter((a) => a.id !== addr.id);
                setAddresses(updated);
                await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
                Alert.alert("Deleted", "Address deleted");
                return;
              }
            }

            // fallback local delete
            const updated = addresses.filter((a) => a.id !== addr.id);
            setAddresses(updated);
            await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
            Alert.alert("Deleted locally", "Address removed locally");
          } catch {
            Alert.alert("Error", "Failed to delete address");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Addresses</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm((s) => !s)}
        >
          <MaterialIcons
            name={showForm ? "close" : "add"}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.label}>Street *</Text>
            <TextInput
              style={styles.input}
              value={street}
              onChangeText={setStreet}
              placeholder="Street / Address line"
            />

            <Text style={styles.label}>Apartment / Suite</Text>
            <TextInput
              style={styles.input}
              value={apartment}
              onChangeText={setApartment}
              placeholder="Apt, Suite, Building"
            />

            <Text style={styles.label}>Landmark</Text>
            <TextInput
              style={styles.input}
              value={landmark}
              onChangeText={setLandmark}
              placeholder="Near ..."
            />

            <Text style={styles.label}>City *</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="City"
            />

            <Text style={styles.label}>State *</Text>
            <TextInput
              style={styles.input}
              value={stateVal}
              onChangeText={setStateVal}
              placeholder="State"
            />

            <Text style={styles.label}>Pin Code *</Text>
            <TextInput
              style={styles.input}
              value={pinCode}
              onChangeText={setPinCode}
              placeholder="Pin code"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Country *</Text>
            <TextInput
              style={styles.input}
              value={country}
              onChangeText={setCountry}
              placeholder="Country"
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Latitude</Text>
                <TextInput
                  style={styles.input}
                  value={latitude}
                  onChangeText={setLatitude}
                  placeholder="12.9716"
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Longitude</Text>
                <TextInput
                  style={styles.input}
                  value={longitude}
                  onChangeText={setLongitude}
                  placeholder="77.5946"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.label}>Set as default</Text>
              <Switch value={isDefault} onValueChange={setIsDefault} />
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={onSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveText}>Save Address</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.listContainer}>
          {loading && !showForm ? (
            <ActivityIndicator />
          ) : addresses.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No addresses saved yet.</Text>
            </View>
          ) : (
            addresses.map((a) => (
              <View style={styles.addressCard} key={String(a.id)}>
                <View style={styles.addressRow}>
                  <Text style={styles.addressStreet}>{a.street}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    {a.isDefault ? (
                      <Text style={styles.defaultBadge}>Default</Text>
                    ) : null}
                    <TouchableOpacity
                      onPress={() => onEdit(a)}
                      style={{ marginLeft: 8, marginRight: 4 }}
                    >
                      <MaterialIcons name="edit" size={18} color="#2563eb" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => onDelete(a)}>
                      <MaterialIcons name="delete" size={18} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.addressMeta}>
                  {[a.apartment, a.landmark].filter(Boolean).join(", ")}
                </Text>
                <Text style={styles.addressMeta}>
                  {[a.city, a.state, a.pinCode].filter(Boolean).join(", ")}
                </Text>
                <Text style={styles.addressMeta}>{a.country}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
  },
  title: { fontSize: 18, fontWeight: "700", color: "#111827" },
  addButton: { backgroundColor: "#6366f1", padding: 8, borderRadius: 8 },
  content: { padding: 16 },
  formCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  label: { fontSize: 13, color: "#374151", marginBottom: 6, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  formActions: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  saveButton: {
    backgroundColor: "#10b981",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveText: { color: "#fff", fontWeight: "600" },
  listContainer: {},
  empty: { padding: 20, alignItems: "center" },
  emptyText: { color: "#6b7280" },
  addressCard: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  addressStreet: { fontSize: 16, fontWeight: "600", color: "#111827" },
  addressMeta: { color: "#6b7280", marginTop: 4 },
  defaultBadge: {
    backgroundColor: "#f0fdf4",
    color: "#065f46",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: "600",
  },
  addressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  row: { flexDirection: "row", alignItems: "center" },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },
});
