import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/src/contexts/AuthContext';
import { apiService, ProviderProfile, CreateProviderProfileRequest, Occupation } from '@/src/services/api';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function EditProfileScreen() {
  const { user, accessToken, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [occupations, setOccupations] = useState<Occupation[]>([]);
  const [form, setForm] = useState<CreateProviderProfileRequest>({
    occupationId: undefined,
    businessName: '',
    businessAddress: '',
    phoneNumber: '',
    experience: '',
    skills: [],
    certifications: [],
    bio: '',
  });

  useEffect(() => {
    const load = async () => {
      if (!isAuthenticated || !accessToken) { setLoading(false); return; }
      try {
        setLoading(true);
        const [occRes, profRes] = await Promise.all([
          apiService.listPublicOccupations(),
          apiService.getProviderProfile(accessToken),
        ]);

        if (occRes.success && occRes.data) setOccupations(occRes.data);

        if (profRes.success && profRes.data) {
          const p = profRes.data;
          setProfile(p);
          setForm({
            occupationId: p.occupationId || undefined,
            businessName: p.businessName || '',
            businessAddress: p.businessAddress || '',
            phoneNumber: p.phoneNumber || '',
            experience: p.experience || '',
            skills: (p.skills as any) || [],
            certifications: (p.certifications as any) || [],
            bio: p.bio || '',
          });
        } else {
          // No profile: prefill from auth user where sensible
          setProfile(null);
          setForm((prev) => ({ ...prev }));
        }
      } catch (e) {
        // noop
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [accessToken, isAuthenticated]);

  const updateField = (key: keyof CreateProviderProfileRequest, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const parseList = (text: string) => text.split(',').map((s) => s.trim()).filter(Boolean);

  const handleSave = async () => {
    if (!accessToken) return;
    // If occupations exist, enforce selection; otherwise allow empty
    if ((occupations?.length || 0) > 0 && !form.occupationId) {
      Alert.alert('Missing field', 'Please select an occupation.');
      return;
    }
    setSaving(true);
    const payload: any = {
      ...form,
      skills: form.skills || [],
      certifications: form.certifications || [],
    };
    if (!form.occupationId) delete payload.occupationId;
    const res = profile
      ? await apiService.updateProviderProfile(accessToken, payload)
      : await apiService.createProviderProfile(accessToken, payload);
    setSaving(false);
    if (!res.success) {
      Alert.alert('Error', res.error || 'Failed to save profile');
      return;
    }
    Alert.alert('Saved', 'Profile updated successfully', [{ text: 'OK', onPress: () => router.back() }]);
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}><View style={styles.center}><Text>Please sign in</Text></View></SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}><View style={styles.center}><ActivityIndicator /><Text style={{marginTop:8,color:'#6b7280'}}>Loading...</Text></View></SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Edit Profile</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={user?.fullName || ''} editable={false} />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={user?.email || ''} editable={false} />

          <Text style={styles.label}>Occupation</Text>
          {occupations.length === 0 ? (
            <Text style={{ color: '#6b7280', marginBottom: 8 }}>No occupations available. You can add later.</Text>
          ) : (
            <View style={styles.chipsRow}>
              {occupations.map((o) => (
                <TouchableOpacity
                  key={o.id}
                  style={[styles.chip, form.occupationId === o.id && styles.chipActive]}
                  onPress={() => updateField('occupationId', o.id)}
                >
                  <Text style={form.occupationId === o.id ? styles.chipTextActive : styles.chipText}>{o.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>Business Name</Text>
          <TextInput style={styles.input} value={form.businessName || ''} onChangeText={(t)=>updateField('businessName', t)} placeholder="Business name" />

          <Text style={styles.label}>Business Address</Text>
          <TextInput style={styles.input} value={form.businessAddress || ''} onChangeText={(t)=>updateField('businessAddress', t)} placeholder="Address" />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput style={styles.input} value={form.phoneNumber || ''} onChangeText={(t)=>updateField('phoneNumber', t)} placeholder="Phone" keyboardType="phone-pad" />

          <Text style={styles.label}>Experience</Text>
          <TextInput style={styles.input} value={form.experience || ''} onChangeText={(t)=>updateField('experience', t)} placeholder="e.g. 3 years" />

          <Text style={styles.label}>Skills (comma separated)</Text>
          <TextInput style={styles.input} value={(form.skills||[]).join(', ')} onChangeText={(t)=>updateField('skills', parseList(t))} placeholder="e.g. plumbing, ac repair" />

          <Text style={styles.label}>Certifications (comma separated)</Text>
          <TextInput style={styles.input} value={(form.certifications||[]).join(', ')} onChangeText={(t)=>updateField('certifications', parseList(t))} placeholder="e.g. ISO 9001" />

          <Text style={styles.label}>Bio</Text>
          <TextInput style={[styles.input,{height:90}]} value={form.bio || ''} onChangeText={(t)=>updateField('bio', t)} placeholder="About your business" multiline />

          <TouchableOpacity style={[styles.saveBtn, saving && {opacity:0.7}]} onPress={handleSave} disabled={saving}>
            <MaterialIcons name="save" size={18} color="#fff" />
            <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#f9fafb' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f3f4f6', marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: '#eef2ff' },
  chipText: { color: '#374151' },
  chipTextActive: { color: '#4f46e5', fontWeight: '600' },
  saveBtn: { marginTop: 16, backgroundColor: '#6366f1', borderRadius: 10, paddingVertical: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  saveText: { color: '#fff', fontWeight: '700' },
});
