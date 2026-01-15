import React from "react";
import Svg, { Text, Circle } from "react-native-svg";

const AIOutfitIcon = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Cirkel runt för stil */}
    {/* Text "AI" - centrerad i mitten */}
    <Text
      x="11.5"
      y="17" // Exakt mitt i SVG:en för perfekt centrering
      fontSize="18" // Lite större för bättre synlighet
      fontWeight="bold"
      fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" // Super-modern font-stack
      textAnchor="middle"
      fill={color}
      dominantBaseline="middle"
    >
      AI
    </Text>
  </Svg>
);

export default AIOutfitIcon;
