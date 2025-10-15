import React, { useEffect, useState } from 'react';
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
import { apiService, Service } from '@/src/services/api';

const { width } = Dimensions.get('window');

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  serviceType: string;
}

interface ProviderDetail {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  price: number;
  experience: string;
  specialties: string[];
  availability: string;
  isVerified: boolean;
  responseTime: string;
  about: string;
  completedJobs: number;
  repeatCustomers: number;
  reviews: Review[];
  services: string[];
}

// Removed hardcoded provider details in favor of dynamic API data.

export default function ProviderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'services'>('about');
  const [service, setService] = useState<Service | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      const res = await apiService.getService(Number(id));
      if (res.success && res.data) setService(res.data);
    };
    load();
  }, [id]);
  
  if (!service) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Provider not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleBookNow = () => {
    router.push(`/booking/${service.id}`);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <MaterialIcons
        key={index}
        name="star"
        size={16}
        color={index < Math.floor(rating) ? '#fbbf24' : '#e5e7eb'}
      />
    ));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'about':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.aboutText}>{service.about}</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{service.completedJobs}</Text>
                <Text style={styles.statLabel}>Jobs Completed</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{service.repeatCustomers}%</Text>
                <Text style={styles.statLabel}>Repeat Customers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{service.experience}</Text>
                <Text style={styles.statLabel}>Experience</Text>
              </View>
            </View>

            <View style={styles.specialtiesSection}>
              <Text style={styles.sectionTitle}>Specialties</Text>
              <View style={styles.specialtiesContainer}>
                {service.specialties.map((specialty, index) => (
                  <View key={index} style={styles.specialtyTag}>
                    <Text style={styles.specialtyText}>{specialty}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        );
      
      case 'services':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Services Offered</Text>
            {service.timeSlots?.split(',').map((slot, index) => (
              <View key={index} style={styles.serviceItem}>
                <MaterialIcons name="check-circle" size={20} color="#10b981" />
                <Text style={styles.serviceText}>{slot.trim()}</Text>
              </View>
            ))}
          </View>
        );
      
      case 'reviews':
        return (
          <View style={styles.tabContent}>
            {service.reviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewUser}>
                    <Text style={styles.reviewUserName}>{review.userName}</Text>
                    <Text style={styles.reviewDate}>{review.date}</Text>
                  </View>
                  <View style={styles.reviewRating}>
                    {renderStars(review.rating)}
                  </View>
                </View>
                <Text style={styles.reviewServiceType}>Service: {review.serviceType}</Text>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))}
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Provider Header */}
        <View style={styles.providerHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{service.name.split(' ').map(n => n[0]).join('')}</Text>
          </View>
          
          <View style={styles.providerInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.providerName}>{service.name}</Text>
              {true && (
                <MaterialIcons name="verified" size={20} color="#10b981" />
              )}
            </View>
            
            <View style={styles.ratingContainer}>
              <View style={styles.stars}>{renderStars(5)}</View>
              <Text style={styles.ratingText}>
                5.0 (0 reviews)
              </Text>
            </View>
            
            <View style={styles.availability}>
              <MaterialIcons name="schedule" size={16} color="#10b981" />
              <Text style={styles.availabilityText}>{service.availability ? 'Available' : 'Unavailable'}</Text>
            </View>
            
            <View style={styles.responseTime}>
              <MaterialIcons name="chat" size={16} color="#6b7280" />
              <Text style={styles.responseTimeText}>Fast response</Text>
            </View>
          </View>
          
          <View style={styles.priceContainer}>
            <Text style={styles.price}>₹{service.price}</Text>
            <Text style={styles.priceLabel}>per service</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {(['about', 'services', 'reviews'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {renderContent()}
      </ScrollView>

      {/* Book Now Button */}
      <View style={styles.bookContainer}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <Text style={styles.bookButtonText}>Book Now - ₹{service.price}</Text>
        </TouchableOpacity>
      </View>
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
  providerHeader: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 20,
    alignItems: 'flex-start',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
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
    fontSize: 20,
    fontWeight: '700',
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
  availability: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  availabilityText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
    marginLeft: 4,
  },
  responseTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  responseTimeText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
  },
  priceLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  tabsContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#6366f1',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#6366f1',
    fontWeight: '600',
  },
  tabContent: {
    backgroundColor: '#fff',
    padding: 20,
  },
  aboutText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  specialtiesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  specialtiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specialtyTag: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  specialtyText: {
    fontSize: 14,
    color: '#0369a1',
    fontWeight: '500',
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  serviceText: {
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
  },
  reviewCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewUser: {
    flex: 1,
  },
  reviewUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewServiceType: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 15,
    color: '#4b5563',
    lineHeight: 22,
  },
  bookContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  bookButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});