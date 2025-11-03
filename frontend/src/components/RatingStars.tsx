import React from "react";
import { View, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface Props {
	rating: number;
	onChange: (value: number) => void;
	size?: number;
	disabled?: boolean;
}

export const RatingStars: React.FC<Props> = ({
	rating,
	onChange,
	size = 28,
	disabled,
}) => {
	return (
		<View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
			{[1, 2, 3, 4, 5].map((value) => (
				<TouchableOpacity
					key={value}
					onPress={() => !disabled && onChange(value)}
					activeOpacity={0.7}
					disabled={disabled}
				>
					<MaterialIcons
						name={value <= rating ? "star" : "star-border"}
						size={size}
						color={"#f59e0b"}
					/>
				</TouchableOpacity>
			))}
		</View>
	);
};

export default RatingStars;
