import React from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	BackHandler,
} from "react-native";

interface Props {
	visible: boolean;
}

const VerificationPendingOverlay: React.FC<Props> = ({ visible }) => {
	if (!visible) return null;
	return (
		<View style={styles.overlay} pointerEvents="auto">
			<View style={styles.card}>
				<Text style={styles.title}>Waiting for admin verification</Text>
				<Text style={styles.subtitle}>
					Your profile has been submitted. You’ll be able to use all features
					once an admin approves your account.
				</Text>
				<TouchableOpacity
					style={styles.button}
					onPress={() => BackHandler.exitApp()}
				>
					<Text style={styles.buttonText}>Close</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	overlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0,0,0,0.45)",
		alignItems: "center",
		justifyContent: "center",
		padding: 16,
		zIndex: 1000,
	},
	card: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 20,
		width: "100%",
	},
	title: { fontSize: 18, fontWeight: "700", color: "#111827", marginBottom: 8 },
	subtitle: { fontSize: 14, color: "#6b7280", marginBottom: 16 },
	button: {
		backgroundColor: "#6366f1",
		borderRadius: 10,
		paddingVertical: 12,
		alignItems: "center",
	},
	buttonText: { color: "#fff", fontWeight: "700" },
});

export default VerificationPendingOverlay;
