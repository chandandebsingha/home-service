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
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../src/contexts/AuthContext";
import apiService, { Category } from "../../src/services/api";

// UI-friendly category shape used in this component
type UICategory = {
	id: string;
	title: string;
	description?: string;
	icon: string;
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
		<TouchableOpacity activeOpacity={0.9}>
			{/* Android needs overflow hidden to clip rounded corners */}
			<View
				style={{
					width: SCREEN_WIDTH,
					height,
					borderRadius: rounded,
					overflow: "hidden",
				}}
			>
				<Image
					source={{ uri: item.uri }}
					style={{ width: "100%", height: "100%" }}
					resizeMode="cover"
				/>
			</View>
		</TouchableOpacity>
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
					const mapped = res.data.map(
						(c: Category) =>
							({
								id: String(c.id),
								title: c.name || "",
								description: c.description || "",
								icon: (c.icon as string) || "cleaning-services",
								color: (c.color as string) || "#3b82f6",
							} as UICategory)
					);
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

	// Show loading screen while checking authentication
	if (isLoading) {
		return (
			<SafeAreaView style={styles.container}>
				<View style={styles.loadingContainer}>
					<Text style={styles.loadingText}>Loading...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView
				style={styles.scrollView}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.scrollContent}
			>
				{/* Header */}
				<View style={styles.header}>
					<View style={styles.headerTop}>
						<View>
							<Text style={styles.greeting}>
								Hello{user ? `, ${user.fullName.split(" ")[0]}` : ""}!
							</Text>
							<Text style={styles.subtitle}>
								What service do you need today?
							</Text>
						</View>
						{user?.role === "admin" && (
							<View style={{ flexDirection: "row", gap: 8 }}>
								<TouchableOpacity
									onPress={() => router.push("/provider/add-service")}
									style={{
										paddingHorizontal: 12,
										paddingVertical: 8,
										backgroundColor: "#22c55e",
										borderRadius: 8,
									}}
								>
									<Text style={{ color: "#fff", fontWeight: "700" }}>
										Add Service
									</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={() => router.push("/admin/dashboard")}
									style={{
										paddingHorizontal: 12,
										paddingVertical: 8,
										backgroundColor: "#0ea5e9",
										borderRadius: 8,
									}}
								>
									<Text style={{ color: "#fff", fontWeight: "700" }}>
										Dashboard
									</Text>
								</TouchableOpacity>
							</View>
						)}
					</View>
				</View>

				{/* Search Bar */}
				<TouchableOpacity style={styles.searchBar}>
					<MaterialIcons name="search" size={20} color="#9ca3af" />
					<Text style={styles.searchText}>Search for services</Text>
				</TouchableOpacity>

				{/* Slider */}
				{count > 0 ? (
					<View
						style={{
							position: "relative",
							marginHorizontal: 20,
							marginBottom: 20,
						}}
					>
						<FlatList
							ref={listRef}
							data={images}
							renderItem={renderItem}
							keyExtractor={(it) => it.id}
							horizontal
							pagingEnabled
							nestedScrollEnabled
							showsHorizontalScrollIndicator={false}
							onMomentumScrollEnd={onMomentumEnd}
							getItemLayout={(_, i) => ({
								length: SCREEN_WIDTH,
								offset: SCREEN_WIDTH * i,
								index: i,
							})}
							removeClippedSubviews={Platform.OS === "android"}
							windowSize={3}
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
					// Optional skeleton/placeholder state
					<View
						style={{
							height,
							marginHorizontal: 20,
							marginBottom: 20,
							justifyContent: "center",
							alignItems: "center",
							backgroundColor: "#f3f4f6",
							borderRadius: rounded,
						}}
					>
						<Text style={{ color: "#9ca3af" }}>No images</Text>
					</View>
				)}

				{/* Service Categories */}
				<View style={styles.categoriesSection}>
					<Text style={styles.sectionTitle}>All Services</Text>
					<View>
						{serviceCategories.map((category, idx) => (
							<TouchableOpacity
								key={category.id}
								style={[
									styles.categoryCard,
									{ borderLeftColor: category.color },
									idx !== 0 && { marginTop: 12 },
								]}
								onPress={() => handleCategoryPress(category.id)}
								activeOpacity={0.7}
							>
								<View style={styles.categoryContent}>
									<View
										style={[
											styles.iconContainer,
											{ backgroundColor: `${category.color}15` },
										]}
									>
										<MaterialIcons
											name={category.icon as any}
											size={32}
											color={category.color}
										/>
									</View>
									<View style={styles.categoryInfo}>
										<Text style={styles.categoryTitle}>{category.title}</Text>
										<Text style={styles.categoryDescription}>
											{category.description}
										</Text>
									</View>
									<MaterialIcons
										name="chevron-right"
										size={24}
										color="#9ca3af"
									/>
								</View>
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
							<Text style={styles.recentTitle}>House Cleaning</Text>
							<Text style={styles.recentDate}>Completed on Dec 15, 2024</Text>
						</View>
						<TouchableOpacity style={styles.rebookButton}>
							<Text style={styles.rebookText}>Rebook</Text>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#f8fafc" },
	scrollView: { flex: 1 },
	scrollContent: { paddingBottom: 20 },
	header: {
		padding: 20,
		backgroundColor: "#6366f1",
		borderBottomLeftRadius: 24,
		borderBottomRightRadius: 24,
	},
	headerTop: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
	},
	greeting: { fontSize: 24, fontWeight: "700", color: "#fff", marginBottom: 4 },
	subtitle: { fontSize: 16, color: "#e0e7ff" },
	logoutButton: {
		padding: 8,
		borderRadius: 8,
		backgroundColor: "rgba(255,255,255,0.2)",
	},
	loginButton: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
		backgroundColor: "rgba(255,255,255,0.2)",
	},
	loginButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
	loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
	loadingText: { fontSize: 18, color: "#6b7280" },
	searchBar: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		margin: 20,
		marginTop: -20,
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderRadius: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
	searchText: { marginLeft: 12, fontSize: 16, color: "#9ca3af", flex: 1 },
	dotsWrap: {
		position: "absolute",
		bottom: 12,
		width: "100%",
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 12,
	},
	dot: { height: 8, borderRadius: 4 },
	dotActive: { width: 16, backgroundColor: "rgba(255,255,255,0.95)" },
	dotInactive: { width: 8, backgroundColor: "rgba(255,255,255,0.5)" },
	categoriesSection: { padding: 20 },
	sectionTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: "#1f2937",
		marginBottom: 16,
	},
	categoryCard: {
		backgroundColor: "#fff",
		borderRadius: 12,
		borderLeftWidth: 4,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.05,
		shadowRadius: 4,
		elevation: 2,
	},
	categoryContent: { flexDirection: "row", alignItems: "center", padding: 16 },
	iconContainer: {
		width: 56,
		height: 56,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 16,
	},
	categoryInfo: { flex: 1 },
	categoryTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1f2937",
		marginBottom: 4,
	},
	categoryDescription: { fontSize: 14, color: "#6b7280" },
	recentSection: { padding: 20 },
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 16,
	},
	viewAllText: { fontSize: 14, color: "#6366f1", fontWeight: "600" },
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
	recentInfo: { flex: 1 },
	recentTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1f2937",
		marginBottom: 4,
	},
	recentDate: { fontSize: 14, color: "#6b7280" },
	rebookButton: {
		backgroundColor: "#6366f1",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
	},
	rebookText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});
