import React, { useRef, useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Box } from "@react-three/drei";
import { GLView } from "expo-gl";

// Enkel 3D-modell komponent
const HumanModel = ({ skinColor, hairColor }) => {
  const meshRef = useRef();

  useFrame(() => {
    // Rotera modellen lätt
    meshRef.current.rotation.y += 0.01;
  });

  return (
    <group ref={meshRef}>
      {/* Huvud */}
      <Sphere position={[0, 1.5, 0]} args={[0.5]} material-color={skinColor} />
      {/* Kropp */}
      <Box
        position={[0, 0, 0]}
        args={[0.8, 1.2, 0.4]}
        material-color={skinColor}
      />
      {/* Hår */}
      <Sphere position={[0, 2, 0]} args={[0.3]} material-color={hairColor} />
    </group>
  );
};

const ModelCreator = () => {
  const [skinColor, setSkinColor] = useState("#ffdbac");
  const [hairColor, setHairColor] = useState("#000000");

  const saveModel = () => {
    alert("Modell sparad! (Implementera lagring senare)");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Anpassa din 3D-modell</Text>
      <View style={styles.canvasContainer}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          onCreated={({ gl }) => {
            console.log("Canvas created:", gl);
          }}
          onError={(error) => console.log("Canvas error:", error)}
        >
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <HumanModel skinColor={skinColor} hairColor={hairColor} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
          />
        </Canvas>
      </View>
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.colorButton}
          onPress={() => setSkinColor("#8d5524")}
        >
          <Text>Mörk hud</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.colorButton}
          onPress={() => setHairColor("#ff0000")}
        >
          <Text>Rött hår</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={saveModel}>
        <Text style={styles.saveText}>Spara modell</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  title: { fontSize: 20, textAlign: "center", margin: 10 },
  canvasContainer: { flex: 1, margin: 10 },
  controls: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },
  colorButton: { backgroundColor: "gold", padding: 10, borderRadius: 5 },
  saveButton: {
    backgroundColor: "green",
    padding: 15,
    margin: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: { color: "white", fontSize: 18 },
});

export default ModelCreator;
