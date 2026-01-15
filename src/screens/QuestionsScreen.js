import React, { useState, useEffect } from "react"; // Lägg till useEffect
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../../config/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";

const QuestionsScreen = () => {
  const [style, setStyle] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");

  const { user, setHasAnsweredQuestions } = useAuth();

  // Visa alert när skärmen laddas (efter registrering)
  useEffect(() => {
    Alert.alert(
      "Registrerad!",
      "Ditt konto har skapats. Fyll i frågorna nedan."
    );
  }, []);

  const handleSubmit = async () => {
    if (!style || !gender || !age) {
      Alert.alert("Fel", "Fyll i alla frågor.");
      return;
    }

    try {
      console.log("Sparar frågor för användare:", user.uid);

      // Spara svaren kopplade till användaren
      await setDoc(doc(db, "userProfiles", user.uid), {
        style,
        gender,
        age: parseInt(age),
        timestamp: new Date(),
      });

      // Markera som klart i AsyncStorage
      await AsyncStorage.setItem("questionsAnswered", "true");

      // Uppdatera state i AuthContext → navigatorn visar MainTabs
      setHasAnsweredQuestions(true);

      Alert.alert("Sparat!", "Dina svar har sparats.");
    } catch (error) {
      console.error("Fel vid sparande:", error);
      Alert.alert("Fel", "Kunde inte spara.");
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Berätta om dig själv</Text>

        <TextInput
          style={styles.input}
          placeholder="Vad är din stil? (t.ex. Casual, Elegant)"
          value={style}
          onChangeText={setStyle}
        />

        <TextInput
          style={styles.input}
          placeholder="Vad är ditt kön? (t.ex. Man, Kvinna, Annat)"
          value={gender}
          onChangeText={setGender}
        />

        <TextInput
          style={styles.input}
          placeholder="Din ålder"
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Spara och fortsätt</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: "gold",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: { color: "black", fontSize: 18 },
});

export default QuestionsScreen;
