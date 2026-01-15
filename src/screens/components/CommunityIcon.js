import React from "react";
import Svg, { Path } from "react-native-svg";

const CommunityIcon = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Stor stjärna i mitten */}
    <Path
      d="M12 10 L13.5 14 L18 15.5 L13.5 17 L12 21 L10.5 17 L6 15.5 L10.5 14 Z"
      stroke={color}
      strokeWidth={1.5}
      fill={color}
    />
    {/* Mindre stjärna till höger (längre upp och längre bort) */}
    <Path
      d="M18 4 L19 6 L21 7 L19 8 L18 10 L17 8 L15 7 L17 6 Z"
      stroke={color}
      strokeWidth={1.2}
      fill={color}
    />
    {/* Liten stjärna ovanför, längre upp och mer till vänster */}
    <Path
      d="M8 2 L8.5 3 L10 3.5 L8.5 4 L8 5 L7.5 4 L6 3.5 L7.5 3 Z"
      stroke={color}
      strokeWidth={1}
      fill={color}
    />
  </Svg>
);

export default CommunityIcon;
