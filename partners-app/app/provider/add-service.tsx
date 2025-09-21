import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { apiService, CreateServiceRequest } from '../../src/services/api';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddServiceScreen() {
  const { user, isAuthenticated } = useAuth();
  const [form, setForm] = useState<CreateServiceRequest>({ name: '', price: 0, availability: true });
  const [loading, setLoading] = useState(false);

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
      const token = await AsyncStorage.getItem('access_token');
      if (!token) throw new Error('Missing access token');

      const res = await apiService.createService(token, {
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        price: Number(form.price), // keep as number
        serviceType: form.serviceType?.trim() || undefined,
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : undefined,
        availability: form.availability,
        timeSlots: form.timeSlots?.trim() || undefined,
      });

      if (!res.success) throw new Error(res.error || 'Failed to create');
      Alert.alert('Success', 'Service created');
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create service');
    } finally {
      setLoading(false);
    }
  };

  const nameOk = form.name.trim().length > 0;
  const priceOk = Number.isFinite(Number(form.price)) && Number(form.price) >= 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Service</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        value={form.name}
        onChangeText={(t) => update('name', t)}
        style={styles.input}
        placeholder="e.g., AC Repair"
      />

      <Text style={styles.label}>Price ($)</Text>
      <TextInput
        value={String(form.price ?? '')}
        onChangeText={(t) => update('price', toNum(t))}
        keyboardType="numeric"
        style={styles.input}
        placeholder="e.g., 120"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        value={form.description || ''}
        onChangeText={(t) => update('description', t)}
        style={[styles.input, { height: 100 }]}
        multiline
        placeholder="Details"
      />

      <Text style={styles.label}>Service Type</Text>
      <TextInput
        value={form.serviceType || ''}
        onChangeText={(t) => update('serviceType', t)}
        style={styles.input}
        placeholder="e.g., repair"
      />

      <Text style={styles.label}>Duration (minutes)</Text>
      <TextInput
        value={form.durationMinutes ? String(form.durationMinutes) : ''}
        onChangeText={(t) => update('durationMinutes', toNum(t))}
        keyboardType="numeric"
        style={styles.input}
        placeholder="e.g., 90"
      />

      <Text style={styles.label}>Time Slots (comma separated)</Text>
      <TextInput
        value={form.timeSlots || ''}
        onChangeText={(t) => update('timeSlots', t)}
        style={styles.input}
        placeholder="10:00,14:00,18:00"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={submit}
        disabled={loading || !nameOk || !priceOk}
      >
        <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save Service'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 6 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  button: {
    marginTop: 20,
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    opacity: 1,
  },
  buttonText: { color: '#fff', fontWeight: '700' },
});
