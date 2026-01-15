import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAnsweredQuestions, setHasAnsweredQuestions] = useState(false);
  const [isVerified, setIsVerified] = useState(false); // Ny flagga för verifiering (särskilt för telefon)

  // Lägg till denna funktion i AuthContext
  const checkVerificationStatus = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      await currentUser.reload(); // Uppdatera användaren från Firebase
      if (currentUser.emailVerified) {
        console.log("Verifiering bekräftad manuellt");
        // Uppdatera state och navigera
        setUser(currentUser);
        // Navigation hanteras av AppNavigator
      } else {
        Alert.alert(
          "Inte verifierad",
          "Försök igen eller kontrollera din e-post."
        );
      }
    }
  };

  // Lägg till i provider-value: checkVerificationStatus

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const answered = await AsyncStorage.getItem("questionsAnswered");

        // Sätt hasAnsweredQuestions endast om användaren är verifierad OCH har svarat frågor
        if ((currentUser.emailVerified || isVerified) && answered === "true") {
          setHasAnsweredQuestions(true);
        } else {
          setHasAnsweredQuestions(false);
        }
      } else {
        setHasAnsweredQuestions(false);
        setIsVerified(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [isVerified]); // Lyssna på isVerified för att uppdatera när det ändras

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        hasAnsweredQuestions,
        setHasAnsweredQuestions,
        isVerified,
        setIsVerified, // Ny funktion för att sätta verifiering
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
