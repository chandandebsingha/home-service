import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { AuthProvider } from '../src/contexts/AuthContext';

export default function RootLayout() {
  // Enforce a readable default text color regardless of device theme
  useEffect(() => {
    const prev = (Text as any).defaultProps?.style;
    (Text as any).defaultProps = {
      ...((Text as any).defaultProps || {}),
      style: [{ color: '#111111' }, prev].filter(Boolean),
    };
  }, []);

  return (
    <AuthProvider>
      {/* Partners app uses darker surfaces in places; keep status icons light */}
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#000',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/login" options={{ title: 'Sign In', headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ title: 'Sign Up', headerShown: false }} />
        <Stack.Screen name="category/[id]" options={{ title: 'Services' }} />
        <Stack.Screen name="provider/[id]" options={{ title: 'Service Provider' }} />
        <Stack.Screen name="provider/add-service" options={{ title: 'Add Service' }} />
        <Stack.Screen name="booking/[serviceId]" options={{ title: 'Book Service' }} />
        <Stack.Screen name="booking/confirmation" options={{ title: 'Booking Confirmed' }} />
        <Stack.Screen name="bookings/[id]" options={{ title: 'Booking Details' }} />
      </Stack>
    </AuthProvider>
  );
}