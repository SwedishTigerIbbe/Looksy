import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebaseConfig"; // Uppdatera sökvägen

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Inloggad!", "Välkommen tillbaka.");
      // Navigation hanteras automatiskt av auth-state
    } catch (error) {
      Alert.alert("Fel", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Logga in</Text>
      <TextInput
        style={styles.input}
        placeholder="E-post"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Lösenord"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Logga in</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>Har du inget konto? Registrera dig</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: "gold",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: { color: "black", fontSize: 16 },
  link: { color: "#007AFF", textAlign: "center", marginTop: 10 },
});

export default LoginScreen;
