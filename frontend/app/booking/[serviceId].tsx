import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

interface DateSlot {
  date: string;
  displayDate: string;
  timeSlots: TimeSlot[];
}

const availableSlots: DateSlot[] = [
  {
    date: '2024-12-28',
    displayDate: 'Today',
    timeSlots: [
      { id: '1', time: '9:00 AM', available: false },
      { id: '2', time: '11:00 AM', available: true },
      { id: '3', time: '2:00 PM', available: true },
      { id: '4', time: '4:00 PM', available: false },
    ],
  },
  {
    date: '2024-12-29',
    displayDate: 'Tomorrow',
    timeSlots: [
      { id: '5', time: '9:00 AM', available: true },
      { id: '6', time: '11:00 AM', available: true },
      { id: '7', time: '2:00 PM', available: true },
      { id: '8', time: '4:00 PM', available: true },
    ],
  },
  {
    date: '2024-12-30',
    displayDate: 'Dec 30',
    timeSlots: [
      { id: '9', time: '9:00 AM', available: true },
      { id: '10', time: '11:00 AM', available: false },
      { id: '11', time: '2:00 PM', available: true },
      { id: '12', time: '4:00 PM', available: true },
    ],
  },
];

const serviceOptions = [
  { id: 'regular', name: 'Regular Cleaning', duration: '2-3 hours', price: 80 },
  { id: 'deep', name: 'Deep Cleaning', duration: '4-5 hours', price: 120 },
  { id: 'move', name: 'Move-in/out Cleaning', duration: '3-4 hours', price: 150 },
];

export default function BookingScreen() {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('regular');
  const [address, setAddress] = useState<string>('123 Main St, Apt 4B');
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [currentStep, setCurrentStep] = useState<number>(1);

  const selectedServiceOption = serviceOptions.find(s => s.id === selectedService);
  const totalPrice = selectedServiceOption?.price || 80;

  const handleContinue = () => {
    if (currentStep === 1) {
      if (!selectedService) {
        Alert.alert('Service Required', 'Please select a service type');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!selectedDate || !selectedTime) {
        Alert.alert('Time Required', 'Please select a date and time');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!address.trim()) {
        Alert.alert('Address Required', 'Please enter your address');
        return;
      }
      handleBooking();
    }
  };

  const handleBooking = () => {
    const selectedDateSlot = availableSlots.find(slot => slot.date === selectedDate);
    const selectedTimeSlot = selectedDateSlot?.timeSlots.find(slot => slot.id === selectedTime);
    
    const bookingDetails = {
      serviceId,
      service: selectedServiceOption?.name,
      date: selectedDateSlot?.displayDate,
      time: selectedTimeSlot?.time,
      address,
      specialInstructions,
      price: totalPrice,
    };

    router.push({
      pathname: '/booking/confirmation',
      params: bookingDetails,
    });
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((step) => (
        <View key={step} style={styles.stepContainer}>
          <View style={[styles.stepCircle, currentStep >= step && styles.activeStepCircle]}>
            <Text style={[styles.stepText, currentStep >= step && styles.activeStepText]}>
              {step}
            </Text>
          </View>
          {step < 3 && <View style={[styles.stepLine, currentStep > step && styles.activeStepLine]} />}
        </View>
      ))}
    </View>
  );

  const renderServiceSelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Service</Text>
      <Text style={styles.stepSubtitle}>Choose the type of service you need</Text>
      
      {serviceOptions.map((service) => (
        <TouchableOpacity
          key={service.id}
          style={[
            styles.serviceOption,
            selectedService === service.id && styles.selectedServiceOption,
          ]}
          onPress={() => setSelectedService(service.id)}
          activeOpacity={0.7}
        >
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.serviceDuration}>{service.duration}</Text>
          </View>
          <View style={styles.servicePrice}>
            <Text style={styles.priceText}>${service.price}</Text>
          </View>
          {selectedService === service.id && (
            <MaterialIcons name="check-circle" size={24} color="#10b981" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderTimeSelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Select Date & Time</Text>
      <Text style={styles.stepSubtitle}>When would you like the service?</Text>
      
      {availableSlots.map((dateSlot) => (
        <View key={dateSlot.date} style={styles.dateSection}>
          <Text style={styles.dateTitle}>{dateSlot.displayDate}</Text>
          <View style={styles.timeSlotsContainer}>
            {dateSlot.timeSlots.map((timeSlot) => (
              <TouchableOpacity
                key={timeSlot.id}
                style={[
                  styles.timeSlot,
                  !timeSlot.available && styles.unavailableTimeSlot,
                  selectedTime === timeSlot.id && styles.selectedTimeSlot,
                ]}
                onPress={() => {
                  if (timeSlot.available) {
                    setSelectedDate(dateSlot.date);
                    setSelectedTime(timeSlot.id);
                  }
                }}
                disabled={!timeSlot.available}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.timeSlotText,
                    !timeSlot.available && styles.unavailableTimeSlotText,
                    selectedTime === timeSlot.id && styles.selectedTimeSlotText,
                  ]}
                >
                  {timeSlot.time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  const renderAddressAndDetails = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Address & Details</Text>
      <Text style={styles.stepSubtitle}>Where should we provide the service?</Text>
      
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Service Address</Text>
        <TextInput
          style={styles.textInput}
          value={address}
          onChangeText={setAddress}
          placeholder="Enter your address"
          multiline
        />
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Special Instructions (Optional)</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={specialInstructions}
          onChangeText={setSpecialInstructions}
          placeholder="Any special instructions or notes"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.bookingSummary}>
        <Text style={styles.summaryTitle}>Booking Summary</Text>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Service:</Text>
          <Text style={styles.summaryValue}>{selectedServiceOption?.name}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Duration:</Text>
          <Text style={styles.summaryValue}>{selectedServiceOption?.duration}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Date & Time:</Text>
          <Text style={styles.summaryValue}>
            {availableSlots.find(s => s.date === selectedDate)?.displayDate}{' '}
            at {availableSlots.find(s => s.date === selectedDate)?.timeSlots.find(t => t.id === selectedTime)?.time}
          </Text>
        </View>
        <View style={[styles.summaryItem, styles.totalItem]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>${totalPrice}</Text>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderServiceSelection();
      case 2:
        return renderTimeSelection();
      case 3:
        return renderAddressAndDetails();
      default:
        return null;
    }
  };

  const getButtonText = () => {
    switch (currentStep) {
      case 1:
        return 'Continue to Date & Time';
      case 2:
        return 'Continue to Details';
      case 3:
        return `Book Now - $${totalPrice}`;
      default:
        return 'Continue';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {renderStepIndicator()}
        
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderCurrentStep()}
        </ScrollView>

        <View style={styles.buttonContainer}>
          {currentStep > 1 && (
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setCurrentStep(currentStep - 1)}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.continueButton, currentStep > 1 && styles.continueButtonSmall]}
            onPress={handleContinue}
          >
            <Text style={styles.continueButtonText}>{getButtonText()}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  keyboardView: {
    flex: 1,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeStepCircle: {
    backgroundColor: '#6366f1',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeStepText: {
    color: '#fff',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 8,
  },
  activeStepLine: {
    backgroundColor: '#6366f1',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  stepContent: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  serviceOption: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedServiceOption: {
    borderColor: '#6366f1',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  serviceDuration: {
    fontSize: 14,
    color: '#6b7280',
  },
  servicePrice: {
    marginRight: 12,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  dateSection: {
    marginBottom: 24,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeSlot: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    minWidth: 80,
    alignItems: 'center',
  },
  selectedTimeSlot: {
    borderColor: '#6366f1',
    backgroundColor: '#f0f9ff',
  },
  unavailableTimeSlot: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  selectedTimeSlotText: {
    color: '#6366f1',
    fontWeight: '600',
  },
  unavailableTimeSlotText: {
    color: '#9ca3af',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  bookingSummary: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  totalItem: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
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
  backButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  continueButton: {
    flex: 2,
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonSmall: {
    flex: 2,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});