import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Ny import
import { Picker } from "@react-native-picker/picker";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";

// Enkel hårdkodad lista över länder
const countries = [
  { code: "SE", name: "Sverige" },
  { code: "US", name: "USA" },
  { code: "GB", name: "Storbritannien" },
  // Lägg till fler
];

// Hårdkodad lista över upptagna användarnamn (för demo – ersätt med Firestore-query)
const takenUsernames = ["admin", "testuser"];

const RegisterScreen = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [gender, setGender] = useState("");
  const [day, setDay] = useState("1");
  const [month, setMonth] = useState("1");
  const [year, setYear] = useState("2000");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verificationMethod, setVerificationMethod] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  const { setUser, setIsVerified } = useAuth(); // Anta att setIsVerified finns i AuthContext
  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.emailVerified) {
        // För email: Spara data och navigera endast när verifierad
        await saveUserDataToFirestore(user.uid);
        // Sätt hasAnsweredQuestions till false för nya användare
        await AsyncStorage.setItem("questionsAnswered", "false");
        navigation.reset({
          index: 0,
          routes: [{ name: "Questions" }],
        });
      }
    });
    return unsubscribe;
  }, [navigation]);

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) =>
    (currentYear - i).toString()
  );

  const checkUsernameUniqueness = async (username) => {
    // Simulera kontroll mot hårdkodad lista
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(!takenUsernames.includes(username.toLowerCase()));
      }, 500);
    });
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const calculateAge = () => {
    const birthDate = new Date(`${year}-${month}-${day}`);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const saveUserDataToFirestore = async (uid) => {
    try {
      await setDoc(doc(db, "users", uid), {
        firstName,
        lastName,
        phoneNumber,
        country,
        city,
        address,
        postalCode,
        gender,
        age: calculateAge(),
        username,
        email,
        createdAt: new Date(),
      });
      console.log("Användardata sparad i Firestore");
    } catch (error) {
      console.error("Fel vid sparning i Firestore:", error);
      Alert.alert("Fel", "Kunde inte spara data. Försök igen.");
    }
  };

  const handleRegister = async () => {
    if (
      !firstName ||
      !lastName ||
      !phoneNumber ||
      !country ||
      !city ||
      !address ||
      !postalCode ||
      !gender ||
      !username ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert("Fel", "Alla fält måste fyllas i.");
      return;
    }

    const age = calculateAge();
    if (age < 13) {
      Alert.alert("Fel", "Du måste vara minst 13 år gammal.");
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert(
        "Fel",
        "Lösenordet måste innehålla minst 8 tecken, en stor bokstav, en liten bokstav och ett nummer."
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Fel", "Lösenorden matchar inte.");
      return;
    }

    const isUnique = await checkUsernameUniqueness(username);
    if (!isUnique) {
      Alert.alert(
        "Fel",
        `Användarnamnet "${username}" är redan upptaget. Välj ett annat.`
      );
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      setUser(userCredential.user);
      setShowVerificationModal(true); // Visa modal efter lyckad registrering
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        Alert.alert(
          "Fel",
          "E-postadressen finns redan. Försök logga in istället.",
          [
            { text: "OK" },
            { text: "Logga in", onPress: () => navigation.navigate("Login") },
          ]
        );
      } else {
        Alert.alert("Fel", error.message);
      }
    }
  };

  const handleVerification = async () => {
    if (!verificationMethod) {
      Alert.alert("Fel", "Välj en verifieringsmetod.");
      return;
    }

    try {
      if (verificationMethod === "email") {
        await sendEmailVerification(auth.currentUser);
        Alert.alert(
          "Verifiering skickad",
          "Kontrollera din e-post och klicka på länken. Öppna appen igen efter verifiering för att fortsätta."
        );
        setShowVerificationModal(false);
        // Timeout för påminnelse
        setTimeout(() => {
          if (!auth.currentUser?.emailVerified) {
            Alert.alert(
              "Påminnelse",
              "Verifiera din e-post för att fortsätta. Öppna appen igen efter verifiering."
            );
          }
        }, 300000); // 5 minuter
      } else if (verificationMethod === "phone") {
        const recaptchaVerifier = new RecaptchaVerifier(
          "recaptcha-container",
          {},
          auth
        );
        const result = await signInWithPhoneNumber(
          auth,
          phoneNumber,
          recaptchaVerifier
        );
        setConfirmationResult(result);
        Alert.alert("Kod skickad", "Ange koden från SMS:et.");
      }
    } catch (error) {
      Alert.alert("Fel", error.message);
    }
  };

  const confirmVerificationCode = async () => {
    if (!verificationCode) {
      Alert.alert("Fel", "Ange verifieringskoden.");
      return;
    }

    try {
      if (verificationMethod === "phone" && confirmationResult) {
        const result = await confirmationResult.confirm(verificationCode);
        setUser(result.user);
        setIsVerified(true); // Sätt verifierad för telefon
        await saveUserDataToFirestore(result.user.uid);
        // Sätt hasAnsweredQuestions till false för nya användare
        await AsyncStorage.setItem("questionsAnswered", "false");
        setShowVerificationModal(false);
        navigation.reset({
          index: 0,
          routes: [{ name: "Questions" }],
        });
        Alert.alert("Verifierad!", "Ditt konto har skapats och verifierats.");
      }
    } catch (error) {
      Alert.alert("Fel", "Ogiltig kod. Försök igen.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Registrera dig</Text>

        <TextInput
          style={styles.input}
          placeholder="Förnamn"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          style={styles.input}
          placeholder="Efternamn"
          value={lastName}
          onChangeText={setLastName}
        />
        <TextInput
          style={styles.input}
          placeholder="Telefonnummer"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />

        <Picker
          selectedValue={country}
          onValueChange={setCountry}
          style={styles.picker}
        >
          <Picker.Item label="Välj land" value="" />
          {countries.map((c) => (
            <Picker.Item key={c.code} label={c.name} value={c.code} />
          ))}
        </Picker>

        <TextInput
          style={styles.input}
          placeholder="Ort"
          value={city}
          onChangeText={setCity}
        />
        <TextInput
          style={styles.input}
          placeholder="Adress"
          value={address}
          onChangeText={setAddress}
        />
        <TextInput
          style={styles.input}
          placeholder="Postnummer"
          value={postalCode}
          onChangeText={setPostalCode}
        />

        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === "Man" && styles.selectedGender,
            ]}
            onPress={() => setGender("Man")}
          >
            <Text style={styles.genderText}>Man</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === "Kvinna" && styles.selectedGender,
            ]}
            onPress={() => setGender("Kvinna")}
          >
            <Text style={styles.genderText}>Kvinna</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.ageContainer}>
          <Picker
            selectedValue={day}
            onValueChange={setDay}
            style={styles.smallPicker}
          >
            {days.map((d) => (
              <Picker.Item key={d} label={d} value={d} />
            ))}
          </Picker>
          <Picker
            selectedValue={month}
            onValueChange={setMonth}
            style={styles.smallPicker}
          >
            {months.map((m) => (
              <Picker.Item key={m} label={m} value={m} />
            ))}
          </Picker>
          <Picker
            selectedValue={year}
            onValueChange={setYear}
            style={styles.smallPicker}
          >
            {years.map((y) => (
              <Picker.Item key={y} label={y} value={y} />
            ))}
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Användarnamn (unikt)"
          value={username}
          onChangeText={setUsername}
        />
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
        <TextInput
          style={styles.input}
          placeholder="Bekräfta lösenord"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Registrera</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.link}>Har du redan ett konto? Logga in</Text>
        </TouchableOpacity>

        <Modal visible={showVerificationModal} animationType="slide">
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Välj verifieringsmetod</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setVerificationMethod("email")}
            >
              <Text>Verifiera via e-post</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setVerificationMethod("phone")}
            >
              <Text>Verifiera via telefon</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleVerification}
            >
              <Text>Skicka kod</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Ange verifieringskod"
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={styles.button}
              onPress={confirmVerificationCode}
            >
              <Text style={styles.buttonText}>Bekräfta kod</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowVerificationModal(false)}>
              <Text style={styles.link}>Avbryt</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        <View id="recaptcha-container" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    paddingBottom: 100,
  },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  picker: { borderWidth: 1, borderColor: "#ddd", marginBottom: 10 },
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  genderButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  selectedGender: { backgroundColor: "gold" },
  genderText: { fontSize: 16 },
  ageContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  smallPicker: { flex: 1, marginHorizontal: 5 },
  button: {
    backgroundColor: "gold",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: { color: "black", fontSize: 16 },
  link: { color: "#007AFF", textAlign: "center", marginTop: 10 },
  modalContainer: { flex: 1, justifyContent: "center", padding: 20 },
  modalTitle: { fontSize: 20, marginBottom: 20, textAlign: "center" },
  modalButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
  },
});

export default RegisterScreen;
