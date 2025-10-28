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
import { router } from 'expo-router';
import { useAuth } from '@/src/contexts/AuthContext';
import { apiService, Service as ApiServiceType } from '@/src/services/api';

type Service = ApiServiceType & { status?: 'active' | 'inactive'; category?: string };

export default function ServicesScreen() {
	const { user, isAuthenticated, accessToken } = useAuth();
	const [services, setServices] = useState<Service[]>([]);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	useEffect(() => {
		loadServices();
	}, []);

    const loadServices = async () => {
        try {
            setLoading(true);
            if (!isAuthenticated || !accessToken) {
                setServices([]);
                return;
            }
            const res = await apiService.listMyServices(accessToken);
            if (res.success && res.data) {
                setServices(res.data);
            } else {
                console.error('Failed to load services:', res.error);
                Alert.alert('Error', res.error || 'Failed to load services');
            }
        } catch (error) {
            console.error('Error loading services:', error);
            Alert.alert('Error', 'Failed to load services');
        } finally {
            setLoading(false);
        }
    };

	const onRefresh = async () => {
		setRefreshing(true);
		await loadServices();
		setRefreshing(false);
	};

	const toggleServiceStatus = (serviceId: string) => {
		setServices(prev =>
			prev.map(service =>
				service.id === serviceId
					? {
							...service,
							status: service.status === 'active' ? 'inactive' : 'active',
					  }
					: service
			)
		);
	};

    const deleteService = (serviceId: number | string) => {
		Alert.alert(
			'Delete Service',
			'Are you sure you want to delete this service?',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					style: 'destructive',
                    onPress: async () => {
                        try {
                            if (!accessToken) return;
                            const res = await apiService.deleteMyService(accessToken, Number(serviceId));
                            if (res.success) {
                                setServices(prev => prev.filter(service => String(service.id) !== String(serviceId)));
                            } else {
                                Alert.alert('Error', res.error || 'Failed to delete service');
                            }
                        } catch {
                            Alert.alert('Error', 'Failed to delete service');
                        }
                    },
				},
			]
		);
	};

	const renderServiceCard = (service: Service) => (
		<View key={service.id} style={styles.serviceCard}>
			<View style={styles.serviceHeader}>
				<View style={styles.serviceInfo}>
					<Text style={styles.serviceName}>{service.name}</Text>
					<Text style={styles.serviceCategory}>{service.category}</Text>
				</View>
				<View style={styles.serviceActions}>
					<TouchableOpacity
						style={[
							styles.statusButton,
							service.status === 'active'
								? styles.activeButton
								: styles.inactiveButton,
						]}
						onPress={() => toggleServiceStatus(service.id)}
					>
						<Text
							style={[
								styles.statusText,
								service.status === 'active'
									? styles.activeText
									: styles.inactiveText,
							]}
						>
							{service.status}
						</Text>
					</TouchableOpacity>
				</View>
			</View>
			<Text style={styles.serviceDescription}>{service.description}</Text>
			<View style={styles.serviceFooter}>
				<Text style={styles.servicePrice}>₹ {service.price}</Text>
				<View style={styles.actionButtons}>
					<TouchableOpacity
						style={styles.editButton}
                    onPress={() => router.push(`/provider/add-service?id=${service.id}`)}
					>
						<MaterialIcons name="edit" size={20} color="#6366f1" />
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.deleteButton}
						onPress={() => deleteService(service.id)}
					>
						<MaterialIcons name="delete" size={20} color="#ef4444" />
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);

	if (!isAuthenticated) {
		return (
			<View style={styles.centerContainer}>
				<MaterialIcons name="lock" size={64} color="#9ca3af" />
				<Text style={styles.authMessage}>Please sign in to manage your services</Text>
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
			<View style={styles.header}>
				<Text style={styles.headerTitle}>My Services</Text>
				<TouchableOpacity
					style={styles.addButton}
					onPress={() => router.push('/provider/add-service')}
				>
					<MaterialIcons name="add" size={24} color="#fff" />
					<Text style={styles.addButtonText}>Add Service</Text>
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
						<Text style={styles.loadingText}>Loading services...</Text>
					</View>
				) : services.length === 0 ? (
					<View style={styles.centerContainer}>
						<MaterialIcons name="build" size={64} color="#9ca3af" />
						<Text style={styles.emptyMessage}>No services added yet</Text>
						<TouchableOpacity
							style={styles.addFirstButton}
							onPress={() => router.push('/provider/add-service')}
						>
							<Text style={styles.addFirstButtonText}>Add Your First Service</Text>
						</TouchableOpacity>
					</View>
				) : (
					<View style={styles.servicesList}>
						{services.map(renderServiceCard)}
					</View>
				)}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f9fafb',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: 16,
		backgroundColor: '#fff',
		borderBottomWidth: 1,
		borderBottomColor: '#e5e7eb',
	},
	headerTitle: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#1f2937',
	},
	addButton: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#6366f1',
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
	},
	addButtonText: {
		color: '#fff',
		fontWeight: '600',
		marginLeft: 4,
	},
	scrollView: {
		flex: 1,
	},
	servicesList: {
		padding: 16,
	},
	serviceCard: {
		backgroundColor: '#fff',
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.1,
		shadowRadius: 3.84,
		elevation: 5,
	},
	serviceHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: 8,
	},
	serviceInfo: {
		flex: 1,
	},
	serviceName: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#1f2937',
		marginBottom: 4,
	},
	serviceCategory: {
		fontSize: 14,
		color: '#6b7280',
		backgroundColor: '#f3f4f6',
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 4,
		alignSelf: 'flex-start',
	},
	serviceActions: {
		marginLeft: 12,
	},
	statusButton: {
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 12,
	},
	activeButton: {
		backgroundColor: '#dcfce7',
	},
	inactiveButton: {
		backgroundColor: '#fee2e2',
	},
	statusText: {
		fontSize: 12,
		fontWeight: '600',
		textTransform: 'capitalize',
	},
	activeText: {
		color: '#166534',
	},
	inactiveText: {
		color: '#dc2626',
	},
	serviceDescription: {
		fontSize: 14,
		color: '#6b7280',
		lineHeight: 20,
		marginBottom: 12,
	},
	serviceFooter: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	servicePrice: {
		fontSize: 18,
		fontWeight: 'bold',
		color: '#059669',
	},
	actionButtons: {
		flexDirection: 'row',
		gap: 8,
	},
	editButton: {
		padding: 8,
		borderRadius: 6,
		backgroundColor: '#f3f4f6',
	},
	deleteButton: {
		padding: 8,
		borderRadius: 6,
		backgroundColor: '#fef2f2',
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
	emptyMessage: {
		fontSize: 16,
		color: '#6b7280',
		textAlign: 'center',
		marginTop: 16,
		marginBottom: 24,
	},
	addFirstButton: {
		backgroundColor: '#6366f1',
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 8,
	},
	addFirstButtonText: {
		color: '#fff',
		fontWeight: '600',
		fontSize: 16,
	},
});
