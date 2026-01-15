import React from "react";
import { Text, StyleSheet } from "react-native";

const HomeScreen = () => {
  return <Text style={styles.text}>HomeScreen</Text>;
};

const styles = StyleSheet.create({
  text: {
    fontSize: 30,
  },
});

export default HomeScreen;

// Uppdatera importer
import { VideoView } from "expo-video"; // Ersätt expo-av

// I renderMedia
const renderMedia = (item, index) => (
  <View key={index} style={styles.mediaContainer}>
    {item.type === "video" ? (
      <VideoView
        source={{ uri: item.uri }}
        style={styles.postMedia}
        resizeMode="cover"
        isLooping
        shouldPlay={false}
        isMuted
      />
    ) : (
      <TouchableOpacity onPress={handleImagePress} activeOpacity={0.95}>
        <Image source={{ uri: item.uri }} style={styles.postMedia} />
      </TouchableOpacity>
    )}
  </View>
);

// I renderIndicators

// I return för PostItem
const firebaseConfig = {
  apiKey: "AIzaSyDM8-Gx4l6usXgu-EAgoRu7XF4w4HZz4rA",
  authDomain: "looksy-c99f8.firebaseapp.com",
  projectId: "looksy-c99f8",
  storageBucket: "looksy-c99f8.firebasestorage.app",
  messagingSenderId: "862809295288",
  appId: "1:862809295288:web:ddbeb086f541632506674d",
  measurementId: "G-3EFJJ6MH1W",
};
