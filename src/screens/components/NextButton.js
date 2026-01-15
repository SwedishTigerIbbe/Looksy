import React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import Svg, { G, Circle } from "react-native-svg";

const NextButton = ({ onPress }) => {
  const size = 80;
  const strokeWidth = 4;
  const center = size / 2;
  const radius = size / 2 - strokeWidth / 2;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${center}, ${center}`}>
          <Circle
            stroke="#E6E7EB"
            fill="none"
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
          />
          <Circle
            stroke="#D4AF37"
            fill="none"
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={Math.PI * 2 * radius}
            strokeDashoffset={0}
          />
        </G>
      </Svg>

      <Text style={styles.text}>Next</Text>
    </TouchableOpacity>
  );
};

export default NextButton;

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 100,
    backgroundColor: "#D4AF37",
    borderRadius: 60,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  text: {
    position: "absolute",
    fontSize: 16,
    fontWeight: "bold",
  },
});
