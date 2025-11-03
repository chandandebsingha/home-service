import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	Text,
	StyleSheet,
	ScrollView,
	View,
	FlatList,
	Image,
	Dimensions,
	TouchableOpacity,
	NativeScrollEvent,
	NativeSyntheticEvent,
	Platform,
	Alert,
} from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../src/contexts/AuthContext";
import apiService, { Category, Address, Booking } from "../../src/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// UI-friendly category shape used in this component
type UICategory = {
	id: string;
	title: string;
	description?: string;
	icon: string;
	isEmoji?: boolean;
	color: string;
};

type SliderImage = { id: string; uri: string };
type Props = {
	images?: SliderImage[];
	height?: number;
	autoPlay?: boolean;
	intervalMs?: number;
	onIndexChange?: (index: number) => void;
	showDots?: boolean;
	rounded?: number;
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function HomeScreen({
	images = [
		// Sample online images for the slider
		{
			id: "1",
			uri: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
		},
		{
			id: "2",
			uri: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
		},
		{
			id: "3",
			uri: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
		},
		{
			id: "4",
			uri: "https://images.unsplash.com/photo-1527030280862-64139fba04ca?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2106&q=80",
		},
	],
	height = 240,
	autoPlay = true,
	intervalMs = 3000,
	onIndexChange,
	showDots = true,
	rounded = 12,
}: Props) {
	const { user, isAuthenticated, logout, isLoading } = useAuth();
	const [index, setIndex] = useState(0);
	const listRef = useRef<FlatList<SliderImage>>(null);
	const timer = useRef<ReturnType<typeof setInterval> | null>(null);

	// Display user's saved address in header
	const [headerAddress, setHeaderAddress] = useState<string>("");

	// Recent booking state
	const [recentBooking, setRecentBooking] = useState<Booking | null>(null);
	const [recentServiceName, setRecentServiceName] = useState<string>("");
	const [recentLoading, setRecentLoading] = useState<boolean>(false);
	const [recentError, setRecentError] = useState<string | null>(null);

	useEffect(() => {
		let mounted = true;
		const ADDR_KEY = "addresses_local_v1";
		const fmt = (a: Address) =>
			[
				a.street,
				a.apartment,
				[a.city, a.state, a.pinCode].filter(Boolean).join(", "),
				a.country,
			]
				.filter(Boolean)
				.join(", ");
		(async () => {
			try {
				const token = await AsyncStorage.getItem("access_token");
				let addrs: Address[] | undefined;
				if (token) {
					const res = await apiService.listMyAddresses(token);
					if (res.success && res.data) {
						addrs = res.data as Address[];
						await AsyncStorage.setItem(ADDR_KEY, JSON.stringify(addrs));
					}
				}
				if (!addrs) {
					const local = await AsyncStorage.getItem(ADDR_KEY);
					if (local) addrs = JSON.parse(local);
				}
				if (mounted && addrs && addrs.length) {
					const def = addrs.find((a) => a.isDefault) || addrs[0];
					setHeaderAddress(fmt(def));
				}
			} catch {
				// ignore
			}
		})();
		return () => {
			mounted = false;
		};
	}, []);

	const count = Array.isArray(images) ? images.length : 0;

	const goTo = useCallback(
		(i: number) => {
			if (!count) return;
			const next = (i + count) % count;
			listRef.current?.scrollToIndex({ index: next, animated: true });
		},
		[count]
	);

	// autoplay
	useEffect(() => {
		if (!autoPlay || count < 2) return;
		if (timer.current) clearInterval(timer.current);
		timer.current = setInterval(() => goTo(index + 1), intervalMs);
		return () => {
			if (timer.current) clearInterval(timer.current);
		};
	}, [autoPlay, intervalMs, index, goTo, count]);

	const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
		const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
		if (newIndex !== index) {
			setIndex(newIndex);
			onIndexChange?.(newIndex);
		}
	};

	const renderItem = ({ item }: { item: SliderImage }) => (
		<View style={styles.slideItem}>
			<TouchableOpacity activeOpacity={0.9} style={styles.slideContent}>
				<Image
					source={{ uri: item.uri }}
					style={styles.slideImage}
					resizeMode="cover"
				/>
			</TouchableOpacity>
		</View>
	);

	const [serviceCategories, setServiceCategories] = React.useState<
		UICategory[]
	>([
		// fallback sample in case API is unreachable
	]);
	const [categoriesLoading, setCategoriesLoading] = React.useState(false);
	const [categoriesError, setCategoriesError] = React.useState<string | null>(
		null
	);

	React.useEffect(() => {
		let mounted = true;
		setCategoriesLoading(true);
		apiService
			.listCategories()
			.then((res) => {
				if (!mounted) return;
				if (res.success && Array.isArray(res.data)) {
					// Map backend category shape to UI-friendly fields
					const mapped = res.data.map((c: Category) => {
						const emoji = (c as any).emoji ? String((c as any).emoji) : "";
						const iconField =
							emoji || (c.icon as string) || "cleaning-services";
						return {
							id: String(c.id),
							title: c.name || "",
							description: c.description || "",
							icon: iconField,
							color: (c.color as string) || "#3b82f6",
							isEmoji: Boolean(emoji),
						} as UICategory;
					});
					setServiceCategories(mapped);
				} else {
					setCategoriesError(res.error || "Failed to load categories");
				}
			})
			.catch((e) => {
				if (!mounted) return;
				setCategoriesError(e?.message || "Failed to load categories");
			})
			.finally(() => {
				if (!mounted) return;
				setCategoriesLoading(false);
			});
		return () => {
			mounted = false;
		};
	}, []);

	const handleCategoryPress = (categoryId: string) => {
		if (!isAuthenticated) {
			Alert.alert(
				"Authentication Required",
				"Please sign in to view services",
				[
					{ text: "Cancel", style: "cancel" },
					{ text: "Sign In", onPress: () => router.push("/auth/login") },
				]
			);
			return;
		}
		router.push(`/category/${categoryId}`);
	};

	const handleLogout = () => {
		Alert.alert("Sign Out", "Are you sure you want to sign out?", [
			{ text: "Cancel", style: "cancel" },
			{ text: "Sign Out", onPress: logout, style: "destructive" },
		]);
	};

	// Load most recent booking for the logged-in user
	useEffect(() => {
		let mounted = true;
		const fetchRecent = async () => {
			try {
				if (!isAuthenticated) return; // avoid prompting unauthenticated users
				setRecentLoading(true);
				setRecentError(null);
				const token = await AsyncStorage.getItem("access_token");
				if (!token) return;
				const res = await apiService.listMyBookings(token);
				if (!mounted) return;
				if (res.success && Array.isArray(res.data)) {
					const bookings = res.data as Booking[];
					if (!bookings.length) return;
					// Prefer latest completed booking; fallback to latest any
					const completed = bookings.filter((b) => b.status === "completed");
					const list = completed.length ? completed : bookings;
					const getTs = (b: Booking) => {
						// Prefer createdAt if present, else date
						const d = b.createdAt || b.date || "";
						const parsed = new Date(d);
						return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
					};
					const latest = list.reduce((p, c) => (getTs(c) > getTs(p) ? c : p));
					setRecentBooking(latest);
					// Fetch service name
					const sRes = await apiService.getService(latest.serviceId);
					if (!mounted) return;
					if (sRes.success && sRes.data) {
						setRecentServiceName((sRes.data as any)?.name || "");
					}
				} else {
					setRecentError(res.error || "Failed to load recent bookings");
				}
			} catch (e: any) {
				if (!mounted) return;
				setRecentError(e?.message || "Failed to load recent bookings");
			} finally {
				if (mounted) setRecentLoading(false);
			}
		};
		fetchRecent();
		return () => {
			mounted = false;
		};
	}, [isAuthenticated]);

	const formatDisplayDate = (b?: Booking | null) => {
		if (!b) return "";
		const dStr = b.date || b.createdAt || "";
		if (!dStr) return "";
		const d = new Date(dStr);
		if (isNaN(d.getTime())) return dStr;
		return d.toLocaleDateString(undefined, {
			month: "short",
			day: "numeric",
			year: "numeric",
		});
	};

	const capitalize = (s?: string) =>
		s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

	const handleRebookPress = () => {
		if (!isAuthenticated) {
			Alert.alert("Login Required", "Please sign in to book a service.", [
				{ text: "Cancel", style: "cancel" },
				{ text: "Sign In", onPress: () => router.push("/auth/login") },
			]);
			return;
		}
		if (recentBooking) {
			router.push(`/booking/${recentBooking.serviceId}`);
		} else {
			// If no recent booking, navigate user to explore services
			router.push("/search");
		}
	};

	// Show loading screen while checking authentication
	if (isLoading) {
		return (
			<View style={styles.container}>
				<View style={styles.loadingContainer}>
					<Text style={styles.loadingText}>Loading...</Text>
				</View>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<ScrollView
				style={styles.scrollView}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.scrollContent}
			>
				{/* Header with Location */}
				<View style={styles.header}>
					<TouchableOpacity
						style={styles.locationContainer}
						onPress={() => router.push("/addresses")}
						activeOpacity={0.7}
					>
						<MaterialIcons name="location-on" size={20} color="#1f2937" />
						<Text
							style={styles.locationText}
							numberOfLines={1}
							ellipsizeMode="tail"
						>
							{headerAddress || "Set your address"}
						</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.notificationButton}>
						<MaterialIcons
							name="notifications-none"
							size={24}
							color="#1f2937"
						/>
					</TouchableOpacity>
				</View>

				{/* Admin Controls */}
				{user?.role === "admin" && (
					<View style={styles.adminControls}>
						<TouchableOpacity
							onPress={() => router.push("/provider/add-service")}
							style={styles.adminButton}
						>
							<Text style={styles.adminButtonText}>Add Service</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => router.push("/admin/dashboard")}
							style={[styles.adminButton, { backgroundColor: "#0ea5e9" }]}
						>
							<Text style={styles.adminButtonText}>Dashboard</Text>
						</TouchableOpacity>
					</View>
				)}

				{/* Search Bar */}
				<TouchableOpacity
					style={styles.searchBar}
					onPress={() => router.push("/search")}
				>
					<MaterialIcons name="search" size={20} color="#9ca3af" />
					<Text style={styles.searchText}>
						Search for services and packages
					</Text>
				</TouchableOpacity>

				{/* Slider */}
				{count > 0 ? (
					<View style={styles.sliderContainer}>
						<FlatList
							ref={listRef}
							data={images}
							renderItem={renderItem}
							keyExtractor={(it) => it.id}
							horizontal
							pagingEnabled
							showsHorizontalScrollIndicator={false}
							onMomentumScrollEnd={onMomentumEnd}
							snapToInterval={SCREEN_WIDTH}
							decelerationRate="fast"
							bounces={false}
						/>
						{showDots && (
							<View style={styles.dotsWrap}>
								{images.map((_, i) => (
									<View
										key={i}
										style={[
											styles.dot,
											i === index ? styles.dotActive : styles.dotInactive,
											i !== 0 && { marginLeft: 6 },
										]}
									/>
								))}
							</View>
						)}
					</View>
				) : (
					<View style={styles.sliderPlaceholder}>
						<Text style={{ color: "#9ca3af" }}>No images</Text>
					</View>
				)}

				{/* Service Categories - Grid Layout */}
				<View style={styles.categoriesSection}>
					<View style={styles.categoryGrid}>
						{serviceCategories.map((category) => (
							<TouchableOpacity
								key={category.id}
								style={styles.categoryGridItem}
								onPress={() => handleCategoryPress(category.id)}
								activeOpacity={0.7}
							>
								<View style={styles.categoryIconWrapper}>
									{category.isEmoji ? (
										<Text style={styles.categoryEmoji}>{category.icon}</Text>
									) : (
										<MaterialIcons
											name={category.icon as any}
											size={36}
											color="#1f2937"
										/>
									)}
								</View>
								<Text style={styles.categoryGridTitle}>{category.title}</Text>
							</TouchableOpacity>
						))}
					</View>
				</View>

				{/* Recent Bookings */}
				<View style={styles.recentSection}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>Recent Bookings</Text>
						<TouchableOpacity onPress={() => router.push("/bookings")}>
							<Text style={styles.viewAllText}>View All</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.recentCard}>
						<View style={styles.recentInfo}>
							<Text style={styles.recentTitle}>
								{recentLoading
									? "Loading..."
									: recentServiceName ||
									  (recentBooking
											? "Your last service"
											: "No recent bookings yet")}
							</Text>
							<Text style={styles.recentDate}>
								{recentLoading
									? "Fetching details"
									: recentBooking
									? `${capitalize(recentBooking.status)} on ${formatDisplayDate(
											recentBooking
									  )}`
									: recentError
									? recentError
									: ""}
							</Text>
						</View>
						<TouchableOpacity
							style={styles.rebookButton}
							onPress={handleRebookPress}
							disabled={recentLoading}
						>
							<Text style={styles.rebookText}>Rebook</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#ffffff" },
	scrollView: { flex: 1 },
	scrollContent: { paddingBottom: 20 },
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingTop: 12,
		paddingBottom: 16,
		backgroundColor: "#ffffff",
	},
	locationContainer: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
		paddingRight: 16,
	},
	locationText: {
		marginLeft: 6,
		fontSize: 14,
		fontWeight: "600",
		color: "#1f2937",
		flex: 1,
		flexShrink: 1,
	},
	notificationButton: {
		padding: 8,
	},
	adminControls: {
		flexDirection: "row",
		gap: 8,
		paddingHorizontal: 20,
		marginBottom: 16,
	},
	adminButton: {
		paddingHorizontal: 12,
		paddingVertical: 8,
		backgroundColor: "#22c55e",
		borderRadius: 8,
	},
	adminButtonText: {
		color: "#fff",
		fontWeight: "700",
		fontSize: 14,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		fontSize: 18,
		color: "#6b7280",
	},
	searchBar: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#f3f4f6",
		marginHorizontal: 20,
		marginBottom: 20,
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderRadius: 12,
	},
	searchText: {
		marginLeft: 12,
		fontSize: 14,
		color: "#9ca3af",
		flex: 1,
	},
	sliderContainer: {
		marginBottom: 20,
		paddingHorizontal: 0,
	},
	slideItem: {
		width: SCREEN_WIDTH,
		paddingHorizontal: 20,
	},
	slideContent: {
		width: "100%",
		height: 200,
		borderRadius: 16,
		overflow: "hidden",
	},
	slideImage: {
		width: "100%",
		height: "100%",
	},
	sliderPlaceholder: {
		height: 200,
		marginHorizontal: 20,
		marginBottom: 20,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#f3f4f6",
		borderRadius: 16,
	},
	dotsWrap: {
		position: "absolute",
		bottom: 12,
		width: "100%",
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 12,
	},
	dot: {
		height: 8,
		borderRadius: 4,
	},
	dotActive: {
		width: 16,
		backgroundColor: "rgba(255,255,255,0.95)",
	},
	dotInactive: {
		width: 8,
		backgroundColor: "rgba(255,255,255,0.5)",
	},
	categoriesSection: {
		paddingHorizontal: 20,
		marginBottom: 24,
	},
	categoryGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
	},
	categoryGridItem: {
		width: "31%",
		aspectRatio: 1,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 16,
		// removed card look
		backgroundColor: "transparent",
		borderRadius: 0,
		shadowColor: "transparent",
		elevation: 0,
	},
	categoryIconWrapper: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: "#f3f4f6",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 8,
	},
	categoryEmoji: {
		fontSize: 32,
	},
	categoryGridTitle: {
		fontSize: 12,
		fontWeight: "600",
		color: "#1f2937",
		textAlign: "center",
		paddingHorizontal: 4,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: "#1f2937",
		marginBottom: 16,
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 16,
	},
	viewAllText: {
		fontSize: 14,
		color: "#6366f1",
		fontWeight: "600",
	},
	recentSection: {
		paddingHorizontal: 20,
	},
	recentCard: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 16,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	recentInfo: {
		flex: 1,
	},
	recentTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1f2937",
		marginBottom: 4,
	},
	recentDate: {
		fontSize: 14,
		color: "#6b7280",
	},
	rebookButton: {
		backgroundColor: "#6366f1",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
	},
	rebookText: {
		color: "#fff",
		fontSize: 14,
		fontWeight: "600",
	},
});
