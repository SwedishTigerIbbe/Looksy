import React from "react";
import Svg, { Path } from "react-native-svg";

const BuyIcon = ({ color, size }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5H19M7 13v8a2 2 0 002 2h10a2 2 0 002-2v-3"
      stroke={color}
      strokeWidth={2}
    />
  </Svg>
);

export default BuyIcon;
