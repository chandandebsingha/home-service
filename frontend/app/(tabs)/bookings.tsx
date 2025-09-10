import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

type BookingStatus = 'upcoming' | 'completed' | 'cancelled';

interface Booking {
  id: string;
  serviceName: string;
  providerName: string;
  date: string;
  time: string;
  status: BookingStatus;
  price: number;
  address: string;
  rating?: number;
}

const mockBookings: Booking[] = [
  {
    id: '1',
    serviceName: 'House Cleaning',
    providerName: 'Dipika Roy',
    date: 'Dec 28, 2024',
    time: '10:00 AM',
    status: 'upcoming',
    price: 80,
    address: '123 Main St, Apt 4B',
  },
  {
    id: '2',
    serviceName: 'Plumbing Repair',
    providerName: 'Varun Singh',
    date: 'Dec 25, 2024',
    time: '2:00 PM',
    status: 'upcoming',
    price: 120,
    address: '123 Main St, Apt 4B',
  },
  {
    id: '3',
    serviceName: 'House Cleaning',
    providerName: 'Dipika Roy',
    date: 'Dec 15, 2024',
    time: '10:00 AM',
    status: 'completed',
    price: 80,
    address: '123 Main St, Apt 4B',
    rating: 5,
  },
  {
    id: '4',
    serviceName: 'Electrical Work',
    providerName: 'Ravi Kumar',
    date: 'Dec 10, 2024',
    time: '3:00 PM',
    status: 'completed',
    price: 150,
    address: '123 Main St, Apt 4B',
    rating: 4,
  },
];

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');

  const filteredBookings = mockBookings.filter((booking) => {
    if (activeTab === 'upcoming') {
      return booking.status === 'upcoming';
    }
    return booking.status === 'completed';
  });

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'upcoming':
        return '#3b82f6';
      case 'completed':
        return '#10b981';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <MaterialIcons
        key={index}
        name="star"
        size={16}
        color={index < rating ? '#fbbf24' : '#e5e7eb'}
      />
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="event-busy" size={64} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No {activeTab} bookings</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'upcoming'
                ? 'Book a service to see it here'
                : 'Your completed bookings will appear here'}
            </Text>
          </View>
        ) : (
          <View style={styles.bookingsList}>
            {filteredBookings.map((booking) => (
              <View key={booking.id} style={styles.bookingCard}>
                <View style={styles.bookingHeader}>
                  <View style={styles.bookingInfo}>
                    <Text style={styles.serviceName}>{booking.serviceName}</Text>
                    <Text style={styles.providerName}>{booking.providerName}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(booking.status)}15` },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.bookingDetails}>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="calendar-today" size={16} color="#6b7280" />
                    <Text style={styles.detailText}>
                      {booking.date} at {booking.time}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="location-on" size={16} color="#6b7280" />
                    <Text style={styles.detailText}>{booking.address}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="attach-money" size={16} color="#6b7280" />
                    <Text style={styles.detailText}>${booking.price}</Text>
                  </View>
                  {booking.rating && (
                    <View style={styles.detailRow}>
                      <View style={styles.ratingContainer}>
                        {renderStars(booking.rating)}
                        <Text style={styles.ratingText}>({booking.rating}.0)</Text>
                      </View>
                    </View>
                  )}
                </View>

                <View style={styles.bookingActions}>
                  {booking.status === 'upcoming' ? (
                    <>
                      <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>Reschedule</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
                        <Text style={[styles.actionButtonText, styles.cancelButtonText]}>
                          Cancel
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <>
                      <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>Rebook</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>Write Review</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#6366f1',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
    marginTop: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  bookingsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  bookingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bookingInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookingDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 8,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 8,
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  cancelButton: {
    backgroundColor: '#fef2f2',
  },
  cancelButtonText: {
    color: '#dc2626',
  },
});