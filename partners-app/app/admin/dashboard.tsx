import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../../src/config/api';
import { useAuth } from '../../src/contexts/AuthContext';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (!token) { setError('Not authenticated'); return; }
        const res = await fetch(getApiUrl('/admin/stats'), { headers: { Authorization: `Bearer ${token}` } });
        const json = await res.json();
        if (!mounted) return;
        if (!res.ok || !json.success) {
          setError(json.error || 'Failed to load stats');
        } else {
          setStats(json.data);
        }
      } catch (e: any) {
        if (mounted) setError(e.message || 'Failed to load stats');
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (user?.role !== 'admin') {
    return (
      <View style={styles.center}> 
        <Text>Admin access required</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.heading}>Admin Dashboard</Text>
      {error && (
        <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>
      )}
      <View style={styles.cards}>
        <View style={styles.card}><Text style={styles.cardTitle}>Users</Text><Text style={styles.cardValue}>{stats?.counts?.users ?? '-'}</Text></View>
        <View style={styles.card}><Text style={styles.cardTitle}>Services</Text><Text style={styles.cardValue}>{stats?.counts?.services ?? '-'}</Text></View>
        <View style={styles.card}><Text style={styles.cardTitle}>Bookings</Text><Text style={styles.cardValue}>{stats?.counts?.bookings ?? '-'}</Text></View>
      </View>

      <Text style={styles.subheading}>Recent Bookings</Text>
      {(stats?.recent?.bookings || []).map((b: any) => (
        <View key={b.id} style={styles.listItem}>
          <Text style={styles.itemTitle}>Booking #{b.id}</Text>
          <Text style={styles.itemMeta}>{b.date} {b.time} • ₹{b.price}</Text>
        </View>
      ))}

      <Text style={styles.subheading}>Recent Services</Text>
      {(stats?.recent?.services || []).map((s: any) => (
        <View key={s.id} style={styles.listItem}>
          <Text style={styles.itemTitle}>{s.name}</Text>
          <Text style={styles.itemMeta}>₹{s.price} • {s.serviceType || 'general'}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heading: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
  subheading: { fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 8 },
  errorBox: { backgroundColor: '#fee2e2', borderRadius: 8, padding: 12, marginBottom: 12 },
  errorText: { color: '#b91c1c' },
  cards: { flexDirection: 'row', gap: 12 },
  card: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center' },
  cardTitle: { fontSize: 14, color: '#6b7280' },
  cardValue: { fontSize: 22, fontWeight: '800', marginTop: 6 },
  listItem: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8 },
  itemTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  itemMeta: { color: '#6b7280', marginTop: 2 },
});
