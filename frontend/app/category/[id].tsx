import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { apiService, Service } from '../../src/services/api';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categoryId = (id || '').toString();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      const res = await apiService.listServices(100, 0);
      if (!mounted) return;
      if (res.success && res.data) {
        const filtered = res.data.filter((s) =>
          categoryId ? (s.serviceType || '').toLowerCase() === categoryId.toLowerCase() : true
        );
        setServices(filtered);
      } else {
        setError(res.error || 'Failed to load services');
      }
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [categoryId]);

  if (!categoryId) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}> 
          <Text style={styles.dim}>Category not specified</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{categoryId.charAt(0).toUpperCase() + categoryId.slice(1)} Services</Text>
          <Text style={styles.subtitle}>
            {loading ? 'Loading…' : `${services.length} services available`}
          </Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.list}>
          {services.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={styles.card}
              activeOpacity={0.8}
              onPress={() => router.push(`/provider/${s.id}`)}
            >
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{s.name}</Text>
                  {!!s.description && (
                    <Text style={styles.description} numberOfLines={2}>{s.description}</Text>
                  )}
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.price}>₹{s.price}</Text>
                  <Text style={styles.priceHint}>per service</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <MaterialIcons name="schedule" size={16} color="#10b981" />
                  <Text style={styles.metaText}>{s.durationMinutes ? `${s.durationMinutes} mins` : 'Flexible'}</Text>
                </View>
                <View style={styles.metaItem}>
                  <MaterialIcons name="event-available" size={16} color="#10b981" />
                  <Text style={styles.metaText}>{s.availability ? 'Available' : 'Unavailable'}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.cta}
                onPress={(e) => {
                  e.stopPropagation();
                  router.push(`/booking/${s.id}`);
                }}
              >
                <Text style={styles.ctaText}>Book Now</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}

          {!loading && services.length === 0 && !error && (
            <View style={styles.center}>
              <Text style={styles.dim}>No services in this category yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollView: { flex: 1 },
  center: { padding: 24, alignItems: 'center', justifyContent: 'center' },
  dim: { color: '#6b7280' },
  header: { backgroundColor: '#fff', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  title: { fontSize: 22, fontWeight: '700', color: '#1f2937' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  errorBox: { backgroundColor: '#fee2e2', padding: 12, margin: 16, borderRadius: 8 },
  errorText: { color: '#b91c1c' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  name: { fontSize: 16, fontWeight: '700', color: '#111827' },
  description: { marginTop: 4, color: '#6b7280' },
  price: { fontSize: 18, fontWeight: '800', color: '#111827' },
  priceHint: { fontSize: 12, color: '#6b7280' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { marginLeft: 6, color: '#374151' },
  cta: { marginTop: 12, backgroundColor: '#6366f1', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  ctaText: { color: '#fff', fontWeight: '700' },
});