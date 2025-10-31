import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { apiService, Category, ServiceType, Service } from "../src/services/api";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [types, setTypes] = useState<ServiceType[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  // Load full catalogs once (client-side filtering)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [catRes, typeRes, svcRes] = await Promise.all([
          apiService.listCategories(),
          apiService.listServiceTypes(),
          apiService.listServices(200, 0),
        ]);
        if (!mounted) return;
        if (catRes.success && catRes.data) setCategories(catRes.data);
        if (typeRes.success && typeRes.data) setTypes(typeRes.data);
        if (svcRes.success && svcRes.data) setServices(svcRes.data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const q = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!q) return { categories: [], types: [], services: [] };
    const byName = (s?: string) => (s || "").toLowerCase().includes(q);
    return {
      categories: categories.filter((c) => byName(c.name)),
      types: types.filter((t) => byName(t.name)),
      services: services.filter((s) => byName(s.name) || byName(s.description || "")),
    };
  }, [q, categories, types, services]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services, categories, or types"
            value={query}
            onChangeText={setQuery}
            autoFocus
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.center}> 
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {/* Services */}
          {filtered.services.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Services</Text>
              {filtered.services.map((s) => (
                <TouchableOpacity
                  key={`svc-${s.id}`}
                  style={styles.item}
                  onPress={() => router.push(`/provider/${s.id}`)}
                >
                  <MaterialIcons name="build" size={18} color="#111827" />
                  <Text style={styles.itemText} numberOfLines={1}>{s.name}</Text>
                  <Text style={styles.itemMeta}>₹{s.price}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Categories */}
          {filtered.categories.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Categories</Text>
              {filtered.categories.map((c) => (
                <TouchableOpacity
                  key={`cat-${c.id}`}
                  style={styles.item}
                  onPress={() => router.push(`/category/${c.id}`)}
                >
                  <MaterialIcons name="category" size={18} color="#111827" />
                  <Text style={styles.itemText} numberOfLines={1}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Types */}
          {filtered.types.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Types</Text>
              {filtered.types.map((t) => (
                <TouchableOpacity
                  key={`type-${t.id}`}
                  style={styles.item}
                  onPress={() => router.push(`/category/${t.categoryId}/types/${t.id}`)}
                >
                  <MaterialIcons name="tune" size={18} color="#111827" />
                  <Text style={styles.itemText} numberOfLines={1}>{t.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {q && filtered.categories.length + filtered.types.length + filtered.services.length === 0 && (
            <View style={styles.center}> 
              <Text style={{ color: '#6b7280' }}>No results for "{query}"</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff' },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  searchInput: { marginLeft: 8, flex: 1, fontSize: 14, color: '#111827' },
  content: { padding: 16, paddingBottom: 40 },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 14, color: '#6b7280', marginBottom: 8, fontWeight: '600' },
  item: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemText: { flex: 1, color: '#111827', fontWeight: '600' },
  itemMeta: { color: '#6b7280', fontSize: 12 },
  center: { padding: 24, alignItems: 'center' },
});
