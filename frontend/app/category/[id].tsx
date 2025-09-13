import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface ServiceProvider {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  price: number;
  experience: string;
  specialties: string[];
  availability: string;
  profileImage?: string;
  isVerified: boolean;
  responseTime: string;
}

const categoryData: { [key: string]: { title: string; providers: ServiceProvider[] } } = {
  cleaning: {
    title: 'House Cleaning',
    providers: [
      {
        id: '1',
        name: 'Anisha',
        rating: 4.9,
        reviewCount: 127,
        price: 80,
        experience: '5 years',
        specialties: ['Deep Cleaning', 'Regular Cleaning', 'Move-in/out'],
        availability: 'Available Today',
        isVerified: true,
        responseTime: '10 mins',
      },
      {
        id: '2',
        name: 'Deepika Patel',
        rating: 4.8,
        reviewCount: 95,
        price: 75,
        experience: '3 years',
        specialties: ['Eco-friendly', 'Pet-friendly', 'Regular Cleaning'],
        availability: 'Available Tomorrow',
        isVerified: true,
        responseTime: '15 mins',
      },
      {
        id: '3',
        name: 'Nita Kumari',
        rating: 4.7,
        reviewCount: 82,
        price: 85,
        experience: '7 years',
        specialties: ['Deep Cleaning', 'Post-construction', 'Move-in/out'],
        availability: 'Available in 2 days',
        isVerified: false,
        responseTime: '30 mins',
      },
    ],
  },
  repairs: {
    title: 'Home Repairs',
    providers: [
      {
        id: '4',
        name: 'Manoj Kr. Ojha',
        rating: 4.9,
        reviewCount: 156,
        price: 120,
        experience: '10 years',
        specialties: ['Drywall', 'Door/Window', 'General Repairs'],
        availability: 'Available Today',
        isVerified: true,
        responseTime: '5 mins',
      },
      {
        id: '5',
        name: 'Prasanjit Ghosh',
        rating: 4.6,
        reviewCount: 78,
        price: 95,
        experience: '6 years',
        specialties: ['Furniture Assembly', 'Wall Mounting', 'Minor Repairs'],
        availability: 'Available Tomorrow',
        isVerified: true,
        responseTime: '20 mins',
      },
    ],
  },
  plumbing: {
    title: 'Plumbing Services',
    providers: [
      {
        id: '6',
        name: 'Bipul Raj',
        rating: 4.8,
        reviewCount: 134,
        price: 150,
        experience: '12 years',
        specialties: ['Leak Repair', 'Pipe Installation', 'Drain Cleaning'],
        availability: 'Available Today',
        isVerified: true,
        responseTime: '8 mins',
      },
    ],
  },
  electrical: {
    title: 'Electrical Services',
    providers: [
      {
        id: '7',
        name: 'Roshan Kumar',
        rating: 4.7,
        reviewCount: 112,
        price: 180,
        experience: '15 years',
        specialties: ['Wiring', 'Outlet Installation', 'Light Fixtures'],
        availability: 'Available Tomorrow',
        isVerified: true,
        responseTime: '12 mins',
      },
    ],
  },
  painting: {
    title: 'Painting Services',
    providers: [
      {
        id: '8',
        name: 'Rohit Tripathi',
        rating: 4.6,
        reviewCount: 89,
        price: 200,
        experience: '8 years',
        specialties: ['Interior Painting', 'Exterior Painting', 'Touch-ups'],
        availability: 'Available in 3 days',
        isVerified: true,
        responseTime: '25 mins',
      },
    ],
  },
  carpentry: {
    title: 'Carpentry Services',
    providers: [
      {
        id: '9',
        name: 'Gourav Taneja',
        rating: 4.5,
        reviewCount: 67,
        price: 160,
        experience: '9 years',
        specialties: ['Custom Furniture', 'Cabinet Repair', 'Wood Work'],
        availability: 'Available in 2 days',
        isVerified: false,
        responseTime: '45 mins',
      },
    ],
  },
};

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'availability'>('rating');
  
  const categoryInfo = categoryData[id as string];
  
  if (!categoryInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Category not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleProviderPress = (providerId: string) => {
    router.push(`/provider/${providerId}`);
  };

  const sortedProviders = [...categoryInfo.providers].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'price':
        return a.price - b.price;
      case 'availability':
        return a.availability.localeCompare(b.availability);
      default:
        return 0;
    }
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <MaterialIcons
        key={index}
        name="star"
        size={14}
        color={index < Math.floor(rating) ? '#fbbf24' : '#e5e7eb'}
      />
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.categoryTitle}>{categoryInfo.title}</Text>
          <Text style={styles.providerCount}>
            {categoryInfo.providers.length} professionals available
          </Text>
        </View>

        {/* Sort Options */}
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortOptions}>
            {(['rating', 'price', 'availability'] as const).map((option) => (
              <TouchableOpacity
                key={option}
                style={[styles.sortButton, sortBy === option && styles.activeSortButton]}
                onPress={() => setSortBy(option)}
              >
                <Text
                  style={[styles.sortButtonText, sortBy === option && styles.activeSortButtonText]}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Providers List */}
        <View style={styles.providersList}>
          {sortedProviders.map((provider) => (
            <TouchableOpacity
              key={provider.id}
              style={styles.providerCard}
              onPress={() => handleProviderPress(provider.id)}
              activeOpacity={0.7}
            >
              <View style={styles.providerHeader}>
                <View style={styles.providerInfo}>
                  <View style={styles.nameContainer}>
                    <Text style={styles.providerName}>{provider.name}</Text>
                    {provider.isVerified && (
                      <MaterialIcons name="verified" size={16} color="#10b981" />
                    )}
                  </View>
                  <View style={styles.ratingContainer}>
                    <View style={styles.stars}>{renderStars(provider.rating)}</View>
                    <Text style={styles.ratingText}>
                      {provider.rating} ({provider.reviewCount} reviews)
                    </Text>
                  </View>
                  <Text style={styles.experience}>{provider.experience} experience</Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.price}>₹{provider.price}</Text>
                  <Text style={styles.priceLabel}>per service</Text>
                </View>
              </View>

              <View style={styles.specialtiesContainer}>
                {provider.specialties.slice(0, 3).map((specialty, index) => (
                  <View key={index} style={styles.specialtyTag}>
                    <Text style={styles.specialtyText}>{specialty}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.providerFooter}>
                <View style={styles.availabilityContainer}>
                  <MaterialIcons name="schedule" size={16} color="#10b981" />
                  <Text style={styles.availabilityText}>{provider.availability}</Text>
                </View>
                <View style={styles.responseContainer}>
                  <MaterialIcons name="chat" size={16} color="#6b7280" />
                  <Text style={styles.responseText}>Responds in {provider.responseTime}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.bookButton}
                onPress={(e) => {
                  e.stopPropagation();
                  router.push(`/booking/${provider.id}`);
                }}
              >
                <Text style={styles.bookButtonText}>Book Now</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  providerCount: {
    fontSize: 16,
    color: '#6b7280',
  },
  sortContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sortLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  sortOptions: {
    flexDirection: 'row',
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 12,
  },
  activeSortButton: {
    backgroundColor: '#6366f1',
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeSortButtonText: {
    color: '#fff',
  },
  providersList: {
    padding: 20,
  },
  providerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  providerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  providerInfo: {
    flex: 1,
    marginRight: 16,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  providerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  experience: {
    fontSize: 14,
    color: '#6b7280',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  priceLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  specialtyTag: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  specialtyText: {
    fontSize: 12,
    color: '#0369a1',
    fontWeight: '500',
  },
  providerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availabilityText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
    marginLeft: 4,
  },
  responseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  responseText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  bookButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});