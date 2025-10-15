import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Alert,
	RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/src/contexts/AuthContext';
import { apiService, Booking as ApiBooking } from '@/src/services/api';

type Booking = ApiBooking;
type BookingStatus = Booking['status'];

export default function PartnerBookingsScreen() {
    const { isAuthenticated, accessToken } = useAuth();
    const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
    const [bookings, setBookings] = useState<Booking[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {
		loadBookings();
	}, []);

    const loadBookings = async () => {
        try {
            setLoading(true);
            if (!isAuthenticated || !accessToken) {
                setBookings([]);
                return;
            }
            const res = await apiService.listMyBookings(accessToken);
            if (res.success && res.data) {
                setBookings(res.data);
            } else {
                Alert.alert('Error', res.error || 'Failed to load bookings');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

	const onRefresh = async () => {
		setRefreshing(true);
		await loadBookings();
		setRefreshing(false);
	};

    const handleUpdateStatus = (bookingId: number, status: BookingStatus) => {
        const label = status === 'completed' ? 'complete' : 'cancel';
        Alert.alert(
            'Confirm Action',
            `Are you sure you want to ${label} this booking?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: label.charAt(0).toUpperCase() + label.slice(1),
                    onPress: async () => {
                        try {
                            if (!accessToken) return;
                            const res = await apiService.updateBookingStatus(accessToken, bookingId, status);
                            if (res.success && res.data) {
                                setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: res.data!.status } : b));
                            } else {
                                Alert.alert('Error', res.error || 'Failed to update booking');
                            }
                        } catch {
                            Alert.alert('Error', 'Failed to update booking');
                        }
                    },
                },
            ]
        );
    };

    const filteredBookings = bookings.filter((booking) => booking.status === activeTab);

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

    const renderBookingCard = (booking: Booking) => (
		<View key={booking.id} style={styles.bookingCard}>
			<View style={styles.bookingHeader}>
				<View style={styles.bookingInfo}>
                    <Text style={styles.serviceName}>Booking #{booking.id}</Text>
                    <Text style={styles.customerName}>Service ID: {booking.serviceId}</Text>
				</View>
				<View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(booking.status)}15` }]}>
					<Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                        {booking.status}
					</Text>
				</View>
			</View>

			<View style={styles.bookingDetails}>
				<View style={styles.detailRow}>
					<MaterialIcons name="location-on" size={16} color="#6b7280" />
					<Text style={styles.detailText}>{booking.address}</Text>
				</View>
				<View style={styles.detailRow}>
					<MaterialIcons name="calendar-today" size={16} color="#6b7280" />
					<Text style={styles.detailText}>{booking.date} at {booking.time}</Text>
				</View>
				<View style={styles.detailRow}>
					<MaterialIcons name="attach-money" size={16} color="#6b7280" />
                    <Text style={styles.detailText}>${booking.price}</Text>
				</View>
			</View>

            {booking.status === 'upcoming' && (
				<View style={styles.bookingActions}>
					<TouchableOpacity
                        style={[styles.actionButton, styles.completeButton]}
                        onPress={() => handleUpdateStatus(booking.id, 'completed')}
					>
                        <MaterialIcons name="done" size={16} color="#fff" />
                        <Text style={styles.actionButtonText}>Mark Complete</Text>
					</TouchableOpacity>
					<TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => handleUpdateStatus(booking.id, 'cancelled')}
					>
						<MaterialIcons name="close" size={16} color="#fff" />
                        <Text style={styles.actionButtonText}>Cancel</Text>
					</TouchableOpacity>
				</View>
			)}

		</View>
	);

	if (!isAuthenticated) {
		return (
			<View style={styles.centerContainer}>
				<MaterialIcons name="lock" size={64} color="#9ca3af" />
				<Text style={styles.authMessage}>Please sign in to view your bookings</Text>
				<TouchableOpacity
					style={styles.signInButton}
					onPress={() => router.push('/auth/login')}
				>
					<Text style={styles.signInButtonText}>Sign In</Text>
				</TouchableOpacity>
			</View>
		);
	}

	return (
		<View style={styles.container}>
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
				<TouchableOpacity
                    style={[styles.tab, activeTab === 'cancelled' && styles.activeTab]}
                    onPress={() => setActiveTab('cancelled')}
				>
                    <Text style={[styles.tabText, activeTab === 'cancelled' && styles.activeTabText]}>
                        Cancelled
					</Text>
				</TouchableOpacity>
			</View>

			<ScrollView
				style={styles.scrollView}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
			>
				{loading ? (
					<View style={styles.centerContainer}>
						<Text style={styles.loadingText}>Loading bookings...</Text>
					</View>
				) : filteredBookings.length === 0 ? (
					<View style={styles.emptyState}>
						<MaterialIcons name="event-busy" size={64} color="#9ca3af" />
						<Text style={styles.emptyTitle}>No {activeTab} bookings</Text>
						<Text style={styles.emptySubtitle}>
							{activeTab === 'pending'
								? 'New booking requests will appear here'
								: activeTab === 'confirmed'
								? 'Your active bookings will appear here'
								: 'Your completed bookings will appear here'}
						</Text>
					</View>
				) : (
					<View style={styles.bookingsList}>
						{filteredBookings.map(renderBookingCard)}
					</View>
				)}
			</ScrollView>
		</View>
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
		fontSize: 14,
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
	customerName: {
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
		textTransform: 'capitalize',
	},
	bookingDetails: {
		marginBottom: 16,
	},
	detailRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		marginBottom: 8,
	},
	detailText: {
		fontSize: 14,
		color: '#4b5563',
		marginLeft: 8,
		flex: 1,
		lineHeight: 20,
	},
	bookingActions: {
		flexDirection: 'row',
		gap: 8,
	},
	actionButton: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
		flex: 1,
		justifyContent: 'center',
	},
	acceptButton: {
		backgroundColor: '#10b981',
	},
	rejectButton: {
		backgroundColor: '#ef4444',
	},
	startButton: {
		backgroundColor: '#3b82f6',
	},
	completeButton: {
		backgroundColor: '#6366f1',
	},
	actionButtonText: {
		color: '#fff',
		fontSize: 14,
		fontWeight: '600',
		marginLeft: 4,
	},
	centerContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 32,
	},
	authMessage: {
		fontSize: 16,
		color: '#6b7280',
		textAlign: 'center',
		marginTop: 16,
		marginBottom: 24,
	},
	signInButton: {
		backgroundColor: '#6366f1',
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
	},
	signInButtonText: {
		color: '#fff',
		fontWeight: '600',
		fontSize: 16,
	},
	loadingText: {
		fontSize: 16,
		color: '#6b7280',
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
});