import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker"; // Expo's inbyggda paket för kamera och bilder

const Scan = () => {
  const [photo, setPhoto] = useState(null);
  const [itemType, setItemType] = useState("");
  const [color, setColor] = useState("");
  const [loading, setLoading] = useState(false);

  // Öppna kameran och ta foto (Expo hanterar behörigheter automatiskt)
  const openCamera = async () => {
    // Begär behörigheter (Expo gör detta automatiskt, men vi kan kolla)
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Behörighet nekad",
        "Vi behöver kamera-behörighet för att skanna."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.8,
      base64: true, // För att skicka till API
    });

    if (!result.canceled) {
      setPhoto(result.assets[0]);
      analyzeImage(result.assets[0].base64);
    }
  };

  // Analysera bilden med Google Vision API
  const analyzeImage = async (base64Image) => {
    setLoading(true);
    const apiKey = "DIN_GOOGLE_API_KEY_HÄR"; // Ersätt med din riktiga API-nyckel (håll säker!)
    const url = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

    const requestBody = {
      requests: [
        {
          image: { content: base64Image },
          features: [
            { type: "LABEL_DETECTION", maxResults: 5 }, // För objekt (t.ex. hoodie)
            { type: "IMAGE_PROPERTIES" }, // För färger
          ],
        },
      ],
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();

      // Extrahera plaggtyp (från labels)
      const labels = data.responses[0].labelAnnotations || [];
      const itemLabels = labels.filter((label) =>
        ["clothing", "shirt", "hoodie", "jacket", "pants"].includes(
          label.description.toLowerCase()
        )
      );
      setItemType(
        itemLabels.length > 0 ? itemLabels[0].description : "Okänt plagg"
      );

      // Extrahera färg (från dominant colors)
      const colors =
        data.responses[0].imagePropertiesAnnotation?.dominantColors?.colors ||
        [];
      if (colors.length > 0) {
        const dominantColor = colors[0].color;
        // Konvertera RGB till namn (enkel approximation)
        setColor(
          getColorName(
            dominantColor.red,
            dominantColor.green,
            dominantColor.blue
          )
        );
      } else {
        setColor("Okänd färg");
      }
    } catch (error) {
      console.error("API-fel:", error);
      Alert.alert("Fel", "Kunde inte analysera bilden. Försök igen.");
    } finally {
      setLoading(false);
    }
  };

  // Enkel funktion för att namnge färg baserat på RGB
  const getColorName = (r, g, b) => {
    if (r > 200 && g > 200 && b > 200) return "Vit";
    if (r < 50 && g < 50 && b < 50) return "Svart";
    if (r > 200) return "Röd";
    if (g > 200) return "Grön";
    if (b > 200) return "Blå";
    return "Grå";
  };

  // Spara resultatet (t.ex. till AsyncStorage eller databas)
  const saveResult = () => {
    Alert.alert("Sparat!", `Plagg: ${itemType}, Färg: ${color}`);
    // Här kan du lägga till logik för att spara till AsyncStorage eller navigera vidare
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Skanna kläder</Text>

      {!photo ? (
        <TouchableOpacity style={styles.button} onPress={openCamera}>
          <Text style={styles.buttonText}>Öppna kamera</Text>
        </TouchableOpacity>
      ) : (
        <>
          <Image source={{ uri: photo.uri }} style={styles.image} />
          {loading ? (
            <Text>Analyserar...</Text>
          ) : (
            <>
              <Text>Plaggtyp:</Text>
              <TextInput
                style={styles.input}
                value={itemType}
                onChangeText={setItemType}
                placeholder="Redigera om fel"
              />
              <Text>Färg:</Text>
              <TextInput
                style={styles.input}
                value={color}
                onChangeText={setColor}
                placeholder="Redigera om fel"
              />
              <TouchableOpacity style={styles.button} onPress={saveResult}>
                <Text style={styles.buttonText}>Spara resultat</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}
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
  title: { fontSize: 24, marginBottom: 20 },
  button: {
    backgroundColor: "tomato",
    padding: 10,
    borderRadius: 5,
    margin: 10,
  },
  buttonText: { color: "white", fontSize: 16 },
  image: { width: 200, height: 200, marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    width: "80%",
    padding: 10,
    marginBottom: 10,
  },
});

export default Scan;
