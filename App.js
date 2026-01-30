import AsyncStorage from "@react-native-async-storage/async-storage";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  RecaptchaVerifier,
  sendEmailVerification,
  signInWithPhoneNumber,
} from "firebase/auth";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "./config/firebaseConfig";

// Screens
import AIOutfitBuilder from "./src/screens/AIOutfitBuilder";
import BuyPage from "./src/screens/BuyPage";
import Community from "./src/screens/Community";
import LoginScreen from "./src/screens/LoginScreen";
import ModelCreator from "./src/screens/ModelCreator";
import MyOutfits from "./src/screens/MyOutfits";
import Onboarding from "./src/screens/OnBoarding";
import Profile from "./src/screens/Profile";
import QuestionsScreen from "./src/screens/QuestionsScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import Scan from "./src/screens/Scan";

// Icon components du redan har
import BuyIcon from "./src/screens/components/BuyIcon";
import CommunityIcon from "./src/screens/components/CommunityIcon";
import MyOutfitsIcon from "./src/screens/components/MyOutfitsIcon";
import ProfileIcon from "./src/screens/components/ProfileIcon";

// Auth context
import { AuthProvider, useAuth } from "./context/AuthContext";

// Inline SVG för galge + kamera
import Svg, { Circle, Path } from "react-native-svg";

function HangerIcon({ width = 26, height = 26, color = "#222222" }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 18L12 12L20 18"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 12V10.5C12 9.7 12.5 9.3 13 9C13.6 8.6 14 8.3 14 7.5C14 6.7 13.3 6 12.3 6C11.4 6 10.7 6.6 10.6 7.4"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CameraIcon({ size = 28, color = "#ffffff" }) {
  // Klassisk liten kamera med objektiv [web:17][web:20]
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Kamerahus */}
      <Path
        d="M5 8.5C5 7.7 5.7 7 6.5 7H9L10.2 5.5H13.8L15 7H17.5C18.3 7 19 7.7 19 8.5V16C19 16.8 18.3 17.5 17.5 17.5H6.5C5.7 17.5 5 16.8 5 16V8.5Z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Objektiv */}
      <Circle cx="12" cy="12" r="3.2" stroke={color} strokeWidth={1.7} />
      {/* Liten indikator */}
      <Circle cx="8" cy="9" r="0.8" fill={color} />
    </Svg>
  );
}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/* ---------- BOTTOM TABS (HUVUDAPP) ---------- */

function MainTabs() {
  const navigation = useNavigation();

  return (
    <View style={styles.appBackground}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            const tintColor = focused ? "#FFC700" : "#4A4A4A";
            const iconSize = focused ? 28 : size;

            if (route.name === "BuyPage") {
              return (
                <BuyIcon
                  width={iconSize}
                  height={iconSize}
                  color={tintColor}
                />
              );
            }
            if (route.name === "Community") {
              return (
                <CommunityIcon
                  width={iconSize}
                  height={iconSize}
                  color={tintColor}
                />
              );
            }
            if (route.name === "AIOutfitBuilder") {
              // Mitten-tabben med galge
              return (
                <HangerIcon
                  width={iconSize + 1}
                  height={iconSize + 1}
                  color={tintColor}
                />
              );
            }
            if (route.name === "MyOutfits") {
              return (
                <MyOutfitsIcon
                  width={iconSize}
                  height={iconSize}
                  color={tintColor}
                />
              );
            }
            if (route.name === "Profile") {
              return (
                <ProfileIcon
                  width={iconSize}
                  height={iconSize}
                  color={tintColor}
                />
              );
            }
            return null;
          },
          tabBarActiveTintColor: "#FFC700",
          tabBarInactiveTintColor: "#4A4A4A",
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: true,
          tabBarLabelStyle: styles.tabBarLabel,
        })}
      >
        <Tab.Screen
          name="BuyPage"
          component={BuyPage}
          options={{ title: "Shop" }}
        />
        <Tab.Screen
          name="Community"
          component={Community}
          options={{ title: "Community" }}
        />
        <Tab.Screen
          name="AIOutfitBuilder"
          component={AIOutfitBuilder}
          options={{ title: "Outfits" }} // texten under galgen
        />
        <Tab.Screen
          name="MyOutfits"
          component={MyOutfits}
          options={{ title: "Saved" }}
        />
        <Tab.Screen
          name="Profile"
          component={Profile}
          options={{ title: "Profile" }}
        />
      </Tab.Navigator>

      {/* Svart kamera-knapp, tydlig kamera-ikon, ovanför navbar men inte nära galgen */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => navigation.navigate("Scan")}
        activeOpacity={0.9}
      >
        <CameraIcon size={26} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

/* ---------- VERIFIERINGSFALLBACK ---------- */

function VerificationFallbackScreen() {
  const { user, setIsVerified, checkVerificationStatus } = useAuth();
  const [verificationMethod, setVerificationMethod] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [verificationCode, setVerificationCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  const handleSendVerification = async () => {
    if (!verificationMethod) {
      Alert.alert("Fel", "Välj en verifieringsmetod.");
      return;
    }

    try {
      if (verificationMethod === "email") {
        await sendEmailVerification(auth.currentUser);
        Alert.alert(
          "Verifiering skickad",
          "Kontrollera din e‑post och klicka på länken."
        );
      } else if (verificationMethod === "phone") {
        if (!phoneNumber) {
          Alert.alert("Fel", "Ange ditt telefonnummer.");
          return;
        }

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
      Alert.alert("Fel", `Kunde inte skicka verifiering: ${error.message}`);
    }
  };

  const confirmCode = async () => {
    if (!verificationCode) {
      Alert.alert("Fel", "Ange verifieringskoden.");
      return;
    }

    try {
      if (confirmationResult) {
        await confirmationResult.confirm(verificationCode);
        setIsVerified(true);
        Alert.alert("Verifierad!", "Du är nu verifierad.");
      }
    } catch (error) {
      Alert.alert("Fel", `Ogiltig kod: ${error.message}`);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.centeredScreen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Väntar på verifiering</Text>
      <Text style={styles.subtitle}>
        Kontrollera din e‑post eller välj telefon för SMS‑kod.
      </Text>

      <View style={{ height: 20 }} />

      <TouchableOpacity
        style={[
          styles.button,
          verificationMethod === "email" && styles.buttonGhost,
        ]}
        onPress={() => setVerificationMethod("email")}
      >
        <Text style={styles.buttonText}>Verifiera via e‑post</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          verificationMethod === "phone" && styles.buttonGhost,
        ]}
        onPress={() => setVerificationMethod("phone")}
      >
        <Text style={styles.buttonText}>Verifiera via telefon</Text>
      </TouchableOpacity>

      {verificationMethod === "phone" && (
        <TextInput
          style={styles.input}
          placeholder="Telefonnummer"
          placeholderTextColor="#999"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
      )}

      <TouchableOpacity
        style={styles.buttonPrimary}
        onPress={handleSendVerification}
      >
        <Text style={styles.buttonPrimaryText}>Skicka verifiering</Text>
      </TouchableOpacity>

      {confirmationResult && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Verifieringskod"
            placeholderTextColor="#999"
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="number-pad"
          />
          <TouchableOpacity style={styles.buttonPrimary} onPress={confirmCode}>
            <Text style={styles.buttonPrimaryText}>Bekräfta kod</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        style={[styles.buttonGhostFull, { marginTop: 10 }]}
        onPress={checkVerificationStatus}
      >
        <Text style={styles.buttonGhostFullText}>Kontrollera status</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

/* ---------- NAVIGERING / FLOWS ---------- */

function AppNavigator() {
  const { user, loading, hasAnsweredQuestions, isVerified } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      const onboarding = await AsyncStorage.getItem("hasSeenOnboarding");
      setHasCompletedOnboarding(onboarding === "true");
    };
    checkOnboarding();
  }, []);

  if (loading) {
    return (
      <View style={styles.centeredScreen}>
        <Text style={styles.title}>LooksyAI</Text>
        <Text style={styles.subtitle}>Laddar personliga rekommendationer...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!hasCompletedOnboarding ? (
        <Stack.Screen name="Onboarding" component={Onboarding} />
      ) : !user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : user && (user.emailVerified || isVerified) && !hasAnsweredQuestions ? (
        <Stack.Screen name="Questions" component={QuestionsScreen} />
      ) : user && hasAnsweredQuestions ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Scan" component={Scan} />
          <Stack.Screen name="ModelCreator" component={ModelCreator} />
        </>
      ) : (
        <Stack.Screen
          name="VerificationFallback"
          component={VerificationFallbackScreen}
        />
      )}
    </Stack.Navigator>
  );
}

/* ---------- ROOT APP ---------- */

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  appBackground: {
    flex: 1,
    backgroundColor: "#F5F5F7", // ljus, nära vit/grå
  },

  centeredScreen: {
    flex: 1,
    backgroundColor: "#F5F5F7",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111111",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#6D6D6D",
    textAlign: "center",
  },

  tabBar: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 18,
    height: 72,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 0,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },
  tabBarLabel: {
    fontSize: 11,
    marginBottom: 6,
    fontWeight: "500",
  },

  // Svart kamera-knapp, över navbar men långt över galge-ikonen
  scanButton: {
    position: "absolute",
    bottom: 110, // tillräckligt högt för att inte overlappa mitten-tabben
    alignSelf: "center",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
    elevation: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },

  button: {
    backgroundColor: "#E2E2E6",
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 5,
    minWidth: 230,
  },
  buttonGhost: {
    borderWidth: 1,
    borderColor: "#FFC700",
  },
  buttonText: {
    fontWeight: "500",
    color: "#111111",
  },
  buttonPrimary: {
    backgroundColor: "#FFC700",
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    minWidth: 230,
  },
  buttonPrimaryText: {
    fontWeight: "600",
    color: "#111111",
  },
  buttonGhostFull: {
    borderWidth: 1,
    borderColor: "#C0C0C4",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: "center",
    minWidth: 230,
  },
  buttonGhostFullText: {
    color: "#3C3C3C",
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D4D4D8",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginVertical: 6,
    borderRadius: 10,
    width: 260,
    backgroundColor: "#FFFFFF",
    color: "#111111",
  },
});
