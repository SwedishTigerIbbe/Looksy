import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native"; // Ny import för navigation
import {
  sendEmailVerification,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import { auth } from "./config/firebaseConfig"; // Uppdatera sökvägen till din Firebase-konfig

// Dina nya screens
import BuyPage from "./src/screens/BuyPage";
import AIOutfitBuilder from "./src/screens/AIOutfitBuilder";
import Profile from "./src/screens/Profile";
import Scan from "./src/screens/Scan";
import Community from "./src/screens/Community";
import MyOutfits from "./src/screens/MyOutfits";
import Onboarding from "./src/screens/OnBoarding";
import ModelCreator from "./src/screens/ModelCreator";

// Uppdaterade ikoner (inklusive ny gul ikon för AI Outfit Builder)
import BuyIcon from "./src/screens/components/BuyIcon"; // Skapa denna (se nedan)
import CommunityIcon from "./src/screens/components/CommunityIcon";
import AIOutfitIcon from "./src/screens/components/AIOutfitIcon"; // Gul ikon (se nedan)
import MyOutfitsIcon from "./src/screens/components/MyOutfitsIcon";
import ProfileIcon from "./src/screens/components/ProfileIcon";

// Nya importer för auth
import { AuthProvider, useAuth } from "./context/AuthContext"; // Uppdatera sökvägen till AuthContext.js
import LoginScreen from "./src/screens/LoginScreen"; // Uppdatera sökvägen
import RegisterScreen from "./src/screens/RegisterScreen"; // Uppdatera sökvägen
import QuestionsScreen from "./src/screens/QuestionsScreen"; // Uppdatera sökvägen

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const navigation = useNavigation(); // Använd hook för navigation

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        initialRouteName="AIOutfitBuilder"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let IconComponent;
            let iconSize = focused ? 30 : size; // Aktiv knapp blir större
            let iconColor = focused ? "gold" : color; // Guld för aktiva, utom för huvudsidan

            if (route.name === "BuyPage") {
              IconComponent = BuyIcon;
            } else if (route.name === "Community") {
              IconComponent = CommunityIcon;
            } else if (route.name === "AIOutfitBuilder") {
              // Permanent rund padding för huvudsidan, alltid
              return (
                <View style={styles.activeMainButton}>
                  <AIOutfitIcon
                    color={focused ? "black" : "black"}
                    size={iconSize}
                  />
                </View>
              );
            } else if (route.name === "MyOutfits") {
              IconComponent = MyOutfitsIcon;
            } else if (route.name === "Profile") {
              IconComponent = ProfileIcon;
            }

            return IconComponent ? (
              <IconComponent color={iconColor} size={iconSize} />
            ) : null;
          },
          tabBarActiveTintColor: "gold", // Guld för alla aktiva, utom huvudsidan som hanteras ovan
          tabBarInactiveTintColor: "black",
          tabBarStyle: {
            backgroundColor: "#fff",
            height: 90, // Lite större tabb
            paddingBottom: 5, // Extra padding för bättre utseende
            paddingTop: 8,
          },
          tabBarShowLabel: true, // Visa namn under ikonerna
          tabBarLabelStyle: {
            fontSize: 10, // Anpassa textstorlek
            marginTop: 15, // Lite mellanrum mellan ikon och text
          },
        })}
      >
        <Tab.Screen
          name="BuyPage"
          component={BuyPage}
          options={{ tabBarLabel: "Köp" }} // Anpassat namn
        />
        <Tab.Screen
          name="Community"
          component={Community}
          options={{ tabBarLabel: "Community" }}
        />
        <Tab.Screen
          name="AIOutfitBuilder"
          component={AIOutfitBuilder}
          options={{
            tabBarLabel: ({ focused }) => (
              <Text
                style={{
                  fontSize: focused ? 14 : 12, // större bara när aktiv (valfritt)
                  color: focused ? "gold" : "black",
                  marginTop: 13,
                  fontWeight: "500",
                }}
              >
                LooksyAI
              </Text>
            ),
          }}
        />
        <Tab.Screen
          name="MyOutfits"
          component={MyOutfits}
          options={{ tabBarLabel: "Mina Outfits" }}
        />
        <Tab.Screen
          name="Profile"
          component={Profile}
          options={{ tabBarLabel: "Profil" }}
        />
      </Tab.Navigator>

      {/* Flytande svart rund knapp för Scan */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate("Scan")} // Navigera till Scan-sidan
      >
        <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
          <Path
            d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
            stroke="white"
            strokeWidth={2}
          />
          <Path
            d="M9 12a3 3 0 1 0 6 0 3 3 0 0 0-6 0z"
            stroke="white"
            strokeWidth={2}
          />
        </Svg>
      </TouchableOpacity>
    </View>
  );
}

// Uppdaterad VerificationFallbackScreen med knapp för att kontrollera status
function VerificationFallbackScreen() {
  const { user, setIsVerified, checkVerificationStatus } = useAuth(); // Lägg till checkVerificationStatus
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
      console.log("Försöker skicka verifiering via:", verificationMethod);
      if (verificationMethod === "email") {
        await sendEmailVerification(auth.currentUser);
        console.log("Email-verifiering skickad till:", auth.currentUser.email);
        Alert.alert(
          "Verifiering skickad",
          "Kontrollera din e-post och klicka på länken. Öppna appen igen efter verifiering."
        );
      } else if (verificationMethod === "phone") {
        if (!phoneNumber) {
          Alert.alert("Fel", "Ange ditt telefonnummer.");
          return;
        }
        console.log("Försöker skicka SMS till:", phoneNumber);
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
        console.log("SMS skickat till:", phoneNumber);
        Alert.alert("Kod skickad", "Ange koden från SMS:et.");
      }
    } catch (error) {
      console.error("Fel vid sändning:", error);
      Alert.alert("Fel", `Kunde inte skicka verifiering: ${error.message}`);
    }
  };

  const confirmCode = async () => {
    if (!verificationCode) {
      Alert.alert("Fel", "Ange verifieringskoden.");
      return;
    }

    try {
      console.log("Bekräftar kod:", verificationCode);
      if (confirmationResult) {
        await confirmationResult.confirm(verificationCode);
        setIsVerified(true);
        console.log("Verifiering lyckades");
        Alert.alert("Verifierad!", "Du är nu verifierad.");
      }
    } catch (error) {
      console.error("Fel vid bekräftelse:", error);
      Alert.alert("Fel", `Ogiltig kod: ${error.message}`);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text style={{ fontSize: 18, marginBottom: 20, textAlign: "center" }}>
          Väntar på verifiering... Kontrollera din e-post eller ange kod.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setVerificationMethod("email")}
        >
          <Text>Verifiera via e-post</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => setVerificationMethod("phone")}
        >
          <Text>Verifiera via telefon</Text>
        </TouchableOpacity>
        {verificationMethod === "phone" && (
          <TextInput
            style={styles.input}
            placeholder="Telefonnummer"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
        )}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSendVerification}
        >
          <Text>Skicka verifiering</Text>
        </TouchableOpacity>
        {confirmationResult && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Ange verifieringskod"
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.button} onPress={confirmCode}>
              <Text>Bekräfta kod</Text>
            </TouchableOpacity>
          </>
        )}
        {/* Ny knapp för att kontrollera status manuellt */}
        <TouchableOpacity
          style={styles.button}
          onPress={checkVerificationStatus}
        >
          <Text>Kontrollera verifieringsstatus</Text>
        </TouchableOpacity>
        <View id="recaptcha-container" />
      </View>
    </KeyboardAvoidingView>
  );
}

function AppNavigator() {
  const { user, loading, hasAnsweredQuestions, isVerified } = useAuth(); // Lägg till isVerified
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      const onboarding = await AsyncStorage.getItem("hasSeenOnboarding");
      setHasCompletedOnboarding(onboarding === "true");
    };
    checkOnboarding();
  }, []);

  console.log(
    "AppNavigator rendering - user:",
    user,
    "hasAnsweredQuestions:",
    hasAnsweredQuestions,
    "isVerified:",
    isVerified, // Ny logg för verifiering
    "loading:",
    loading
  );

  if (loading) return <Text>Laddar...</Text>;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!hasCompletedOnboarding ? (
        <Stack.Screen name="OnBoarding" component={Onboarding} />
      ) : !user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : user &&
        (user.emailVerified || isVerified) &&
        !hasAnsweredQuestions ? (
        <Stack.Screen name="Questions" component={QuestionsScreen} />
      ) : user && hasAnsweredQuestions ? (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Scan" component={Scan} />
          <Stack.Screen name="ModelCreator" component={ModelCreator} />
        </>
      ) : (
        // Fallback: Användaren är inloggad men inte verifierad – visa förbättrad skärm
        <Stack.Screen
          name="VerificationFallback"
          component={VerificationFallbackScreen}
        />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    bottom: 100, // Ovanför navigationen (justera om nödvändigt)
    right: 20,
    backgroundColor: "black",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, // Skugga för Android
    shadowColor: "#000", // Skugga för iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  activeMainButton: {
    backgroundColor: "gold", // Vit bakgrund
    borderRadius: 25, // Rund padding
    padding: 8, // Padding runt ikonen
    elevation: 3, // Skugga för Android
    shadowColor: "#000", // Skugga för iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  button: {
    backgroundColor: "gold",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 5,
    width: 200,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    width: 200,
  },
});
