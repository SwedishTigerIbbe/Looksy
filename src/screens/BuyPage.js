import React from "react";
import { View, Text, StyleSheet } from "react-native";

const BuyPage = () => {
  return (
    <View style={styles.container}>
      <Text>Köp sida</Text>
      <Text>
        Här kan du se saknade plagg och få rekommendationer från nätet.
      </Text>
      {/* Lägg till din logik här, t.ex. lista över saknade plagg och länkar till köp */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default BuyPage;
