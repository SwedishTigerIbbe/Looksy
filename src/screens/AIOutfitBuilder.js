import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native"; // Om du använder React Navigation

const AIOutfitBuilder = () => {
  const navigation = useNavigation();

  const handleCreateModel = () => {
    // Navigera till 3D-skaparen
    navigation.navigate("ModelCreator");
    console.log("Navigating to ModelCreator");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Outfit Creator</Text>
      <TouchableOpacity style={styles.button} onPress={handleCreateModel}>
        <Text style={styles.buttonText}>Skapa din 3D-modell</Text>
      </TouchableOpacity>
      <Text style={styles.description}>
        Skapa en anpassningsbar 3D-modell som liknar dig, för att se
        AI-genererade outfits!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  button: {
    backgroundColor: "gold",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  buttonText: { color: "black", fontSize: 18 },
  description: { textAlign: "center", fontSize: 16 },
});

export default AIOutfitBuilder;
