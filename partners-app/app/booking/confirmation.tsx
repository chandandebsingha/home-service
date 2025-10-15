import React from 'react';
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

export default function BookingConfirmationScreen() {
  const params = useLocalSearchParams();
  
  const bookingId = `UC${Date.now().toString().slice(-6)}`;

  const handleGoToBookings = () => {
    router.push('/bookings');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Success Header */}
        <View style={styles.successHeader}>
          <View style={styles.successIconContainer}>
            <MaterialIcons name="check-circle" size={80} color="#10b981" />
          </View>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSubtitle}>Your service has been successfully booked</Text>
          <Text style={styles.bookingId}>Booking ID: {bookingId}</Text>
        </View>

        {/* Booking Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Booking Details</Text>
          
          <View style={styles.detailCard}>
            <View style={styles.detailRow}>
              <MaterialIcons name="cleaning-services" size={20} color="#6366f1" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Service</Text>
                <Text style={styles.detailValue}>{params.service}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons name="calendar-today" size={20} color="#6366f1" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>{params.date} at {params.time}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <MaterialIcons name="location-on" size={20} color="#6366f1" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Address</Text>
                <Text style={styles.detailValue}>{params.address}</Text>
              </View>
            </View>

            {params.specialInstructions && (
              <View style={styles.detailRow}>
                <MaterialIcons name="note" size={20} color="#6366f1" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Special Instructions</Text>
                  <Text style={styles.detailValue}>{params.specialInstructions}</Text>
                </View>
              </View>
            )}

            <View style={[styles.detailRow, styles.priceRow]}>
              <MaterialIcons name="attach-money" size={20} color="#10b981" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Total Amount</Text>
                <Text style={styles.priceText}>₹{params.price}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* What's Next */}
        <View style={styles.nextStepsContainer}>
          <Text style={styles.sectionTitle}>What's Next?</Text>
          
          <View style={styles.stepItem}>
            <View style={styles.stepIcon}>
              <MaterialIcons name="message" size={24} color="#6366f1" />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Confirmation Message</Text>
              <Text style={styles.stepDescription}>
                You'll receive a confirmation message shortly with all the details
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepIcon}>
              <MaterialIcons name="person" size={24} color="#6366f1" />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Professional Assignment</Text>
              <Text style={styles.stepDescription}>
                We'll assign the best professional for your service
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={styles.stepIcon}>
              <MaterialIcons name="schedule" size={24} color="#6366f1" />
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Service Reminder</Text>
              <Text style={styles.stepDescription}>
                You'll get a reminder 1 hour before your scheduled service
              </Text>
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.contactContainer}>
          <Text style={styles.sectionTitle}>Need Help?</Text>
          <View style={styles.contactCard}>
            <Text style={styles.contactText}>
              If you have any questions or need to make changes to your booking, 
              feel free to contact us:
            </Text>
            
            <TouchableOpacity style={styles.contactButton}>
              <MaterialIcons name="phone" size={20} color="#6366f1" />
              <Text style={styles.contactButtonText}>Call Support</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.contactButton}>
              <MaterialIcons name="chat" size={20} color="#6366f1" />
              <Text style={styles.contactButtonText}>Live Chat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleGoToBookings}
        >
          <Text style={styles.secondaryButtonText}>View Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleGoHome}
        >
          <Text style={styles.primaryButtonText}>Back to Home</Text>
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
  successHeader: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  bookingId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  detailsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  priceRow: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 16,
    marginBottom: 0,
  },
  detailContent: {
    flex: 1,
    marginLeft: 16,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  priceText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#10b981',
  },
  nextStepsContainer: {
    padding: 20,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  contactContainer: {
    padding: 20,
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  contactText: {
    fontSize: 16,
    color: '#4b5563',
    lineHeight: 24,
    marginBottom: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6366f1',
    marginLeft: 12,
  },
  buttonContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});