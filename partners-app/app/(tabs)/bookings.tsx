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

interface IncomingBooking {
	id: string;
	serviceName: string;
	customerName: string;
	customerPhone: string;
	customerEmail: string;
	address: string;
	date: string;
	time: string;
	status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
	amount: number;
	notes?: string;
	createdAt: string;
}

type BookingStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';

export default function PartnerBookingsScreen() {
	const { user, isAuthenticated } = useAuth();
	const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'completed'>('pending');
	const [bookings, setBookings] = useState<IncomingBooking[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	// Mock data for demonstration
	const mockBookings: IncomingBooking[] = [
		{
			id: '1',
			serviceName: 'House Cleaning',
			customerName: 'John Doe',
			customerPhone: '+1 234-567-8900',
			customerEmail: 'john@example.com',
			address: '123 Main St, City, State',
			date: '2024-01-25',
			time: '10:00 AM',
			status: 'pending',
			amount: 150,
			notes: 'Please clean the kitchen thoroughly',
			createdAt: '2024-01-20T10:30:00Z',
		},
		{
			id: '2',
			serviceName: 'Plumbing Repair',
			customerName: 'Jane Smith',
			customerPhone: '+1 234-567-8901',
			customerEmail: 'jane@example.com',
			address: '456 Oak Ave, City, State',
			date: '2024-01-24',
			time: '2:00 PM',
			status: 'confirmed',
			amount: 200,
			notes: 'Kitchen sink is leaking',
			createdAt: '2024-01-19T14:20:00Z',
		},
		{
			id: '3',
			serviceName: 'Electrical Work',
			customerName: 'Mike Johnson',
			customerPhone: '+1 234-567-8902',
			customerEmail: 'mike@example.com',
			address: '789 Pine St, City, State',
			date: '2024-01-23',
			time: '9:00 AM',
			status: 'completed',
			amount: 300,
			notes: 'Install new light fixtures',
			createdAt: '2024-01-18T09:15:00Z',
		},
		{
			id: '4',
			serviceName: 'Painting Service',
			customerName: 'Sarah Wilson',
			customerPhone: '+1 234-567-8903',
			customerEmail: 'sarah@example.com',
			address: '321 Elm St, City, State',
			date: '2024-01-26',
			time: '11:00 AM',
			status: 'pending',
			amount: 400,
			notes: 'Paint living room and bedroom',
			createdAt: '2024-01-21T16:45:00Z',
		},
	];

	useEffect(() => {
		loadBookings();
	}, []);

	const loadBookings = async () => {
		try {
			setLoading(true);
			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 1000));
			setBookings(mockBookings);
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

	const handleBookingAction = (bookingId: string, action: 'accept' | 'reject' | 'start' | 'complete') => {
		const actionText = action === 'accept' ? 'accept' : action === 'reject' ? 'reject' : action === 'start' ? 'start' : 'complete';
		
		Alert.alert(
			'Confirm Action',
			`Are you sure you want to ${actionText} this booking?`,
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: actionText.charAt(0).toUpperCase() + actionText.slice(1),
					onPress: () => {
						setBookings(prev =>
							prev.map(booking =>
								booking.id === bookingId
									? {
											...booking,
											status: action === 'accept' ? 'confirmed' : 
													action === 'reject' ? 'cancelled' :
													action === 'start' ? 'in-progress' : 'completed',
									  }
									: booking
							)
						);
					},
				},
			]
		);
	};

	const filteredBookings = bookings.filter((booking) => {
		switch (activeTab) {
			case 'pending':
				return booking.status === 'pending';
			case 'confirmed':
				return booking.status === 'confirmed' || booking.status === 'in-progress';
			case 'completed':
				return booking.status === 'completed' || booking.status === 'cancelled';
			default:
				return true;
		}
	});

	const getStatusColor = (status: BookingStatus) => {
		switch (status) {
			case 'pending':
				return '#f59e0b';
			case 'confirmed':
				return '#3b82f6';
			case 'in-progress':
				return '#8b5cf6';
			case 'completed':
				return '#10b981';
			case 'cancelled':
				return '#ef4444';
			default:
				return '#6b7280';
		}
	};

	const renderBookingCard = (booking: IncomingBooking) => (
		<View key={booking.id} style={styles.bookingCard}>
			<View style={styles.bookingHeader}>
				<View style={styles.bookingInfo}>
					<Text style={styles.serviceName}>{booking.serviceName}</Text>
					<Text style={styles.customerName}>{booking.customerName}</Text>
				</View>
				<View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(booking.status)}15` }]}>
					<Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
						{booking.status.replace('-', ' ')}
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
					<MaterialIcons name="phone" size={16} color="#6b7280" />
					<Text style={styles.detailText}>{booking.customerPhone}</Text>
				</View>
				<View style={styles.detailRow}>
					<MaterialIcons name="attach-money" size={16} color="#6b7280" />
					<Text style={styles.detailText}>${booking.amount}</Text>
				</View>
				{booking.notes && (
					<View style={styles.detailRow}>
						<MaterialIcons name="note" size={16} color="#6b7280" />
						<Text style={styles.detailText}>{booking.notes}</Text>
					</View>
				)}
			</View>

			{booking.status === 'pending' && (
				<View style={styles.bookingActions}>
					<TouchableOpacity
						style={[styles.actionButton, styles.acceptButton]}
						onPress={() => handleBookingAction(booking.id, 'accept')}
					>
						<MaterialIcons name="check" size={16} color="#fff" />
						<Text style={styles.actionButtonText}>Accept</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[styles.actionButton, styles.rejectButton]}
						onPress={() => handleBookingAction(booking.id, 'reject')}
					>
						<MaterialIcons name="close" size={16} color="#fff" />
						<Text style={styles.actionButtonText}>Reject</Text>
					</TouchableOpacity>
				</View>
			)}

			{booking.status === 'confirmed' && (
				<View style={styles.bookingActions}>
					<TouchableOpacity
						style={[styles.actionButton, styles.startButton]}
						onPress={() => handleBookingAction(booking.id, 'start')}
					>
						<MaterialIcons name="play-arrow" size={16} color="#fff" />
						<Text style={styles.actionButtonText}>Start Work</Text>
					</TouchableOpacity>
				</View>
			)}

			{booking.status === 'in-progress' && (
				<View style={styles.bookingActions}>
					<TouchableOpacity
						style={[styles.actionButton, styles.completeButton]}
						onPress={() => handleBookingAction(booking.id, 'complete')}
					>
						<MaterialIcons name="done" size={16} color="#fff" />
						<Text style={styles.actionButtonText}>Mark Complete</Text>
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
					style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
					onPress={() => setActiveTab('pending')}
				>
					<Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
						Pending
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.tab, activeTab === 'confirmed' && styles.activeTab]}
					onPress={() => setActiveTab('confirmed')}
				>
					<Text style={[styles.tabText, activeTab === 'confirmed' && styles.activeTabText]}>
						Active
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