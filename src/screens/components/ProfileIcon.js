import React from "react";
import Svg, { Path } from "react-native-svg";

const ProfileIcon = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      stroke={color}
      strokeWidth={2}
    />
  </Svg>
);

export default ProfileIcon;
