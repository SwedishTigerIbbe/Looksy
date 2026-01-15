import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  Modal,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy"; // Fix: Använd legacy API för readAsStringAsync
// import Icon from "react-native-vector-icons/Ionicons";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../../config/firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebaseConfig";
import PagerView from "react-native-pager-view"; // För swiper
// import { VideoView } from "expo-video"; // För video-stöd
import LottieView from "lottie-react-native"; // För Lottie-animation

// import Video from "react-native-video";

import { WebView } from "react-native-webview";

const { width } = Dimensions.get("window");

// Cloudinary-konfiguration – fyll i dina uppgifter här
const CLOUDINARY_CLOUD_NAME = "dhmwz6dum"; // T.ex. 'mycloud'
const CLOUDINARY_UPLOAD_PRESET = "media_upload"; // T.ex. 'media_upload'

const PostItem = ({
  post,
  onLike,
  onLikeDoubleTap,
  onUnlike,
  onAddComment,
  onLikeComment,
  onDelete,
  likedPosts,
  likedComments,
}) => {
  const [commentText, setCommentText] = useState("");
  const [lastTap, setLastTap] = useState(null);
  const [heartVisible, setHeartVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(0); // För indikator
  const [hasLiked, setHasLiked] = useState(false); // State för att spåra om likes redan ökats
  const [playingVideoIndex, setPlayingVideoIndex] = useState(0); // Ny state för vilken video som spelar
  const heartRef = useRef(null); // Ref för Lottie
  // videoRef tas bort – behövs inte längre

  // Fallback för gamla inlägg (med image istället för media)
  const mediaArray =
    post.media || (post.image ? [{ type: "image", uri: post.image }] : []);

  useEffect(() => {
    // Initiera animationen till frame 0-30 (som i din kod)
    heartRef?.current?.play(0, 30);
  }, []);

  // useEffect för video-play tas bort – hanteras nu via props

  const handleAddComment = () => {
    if (commentText.trim()) {
      onAddComment(post.id, commentText);
      setCommentText("");
    }
  };

  const isLiked = likedPosts.includes(post.id);

  const handleDelete = () => {
    Alert.alert(
      "Ta bort inlägg",
      "Är du säker på att du vill ta bort detta inlägg?",
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Ta bort",
          style: "destructive",
          onPress: () => onDelete(post.id),
        },
      ]
    );
  };

  const handleImagePress = () => {
    const now = Date.now();
    if (lastTap && now - lastTap < 300) {
      // Dubbelklick: Spela animationen
      setHeartVisible(true);
      heartRef?.current?.play(30, 100);
      // Öka likes endast om inte redan gjort för detta post
      if (!hasLiked) {
        onLikeDoubleTap(post.id);
        setHasLiked(true);
      }
      setLastTap(null);
    } else {
      setLastTap(now);
    }
  };

  const renderMedia = (item, index) => (
    <View key={index} style={styles.mediaContainer}>
      {item.type === "video" ? (
        <WebView
          source={{
            html: `
              <html>
                <body style="margin:0;padding:0;">
                  <video
                    src="${item.uri}"
                    controls
                    autoplay
                    loop
                    muted
                    playsinline
                    style="width:100%;height:100%;object-fit:cover;border-radius:10px;"
                  ></video>
                </body>
              </html>
            `,
          }}
          style={styles.postMedia}
          allowsFullscreenVideo={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onLoad={() => console.log("Video WebView loaded for:", item.uri)}
          onError={(error) =>
            console.log("Video WebView error for:", item.uri, error)
          }
        />
      ) : (
        <TouchableOpacity onPress={handleImagePress} activeOpacity={0.95}>
          <Image source={{ uri: item.uri }} style={styles.postMedia} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderIndicators = () => {
    const total = mediaArray.length;
    if (total <= 3) {
      return mediaArray.map((_, index) => (
        <View
          key={index}
          style={[
            styles.indicator,
            index === currentPage && styles.activeIndicator,
          ]}
        />
      ));
    } else {
      const start = Math.max(0, currentPage - 1);
      const end = Math.min(total, start + 3);
      return Array.from({ length: 3 }, (_, i) => {
        const actualIndex = start + i;
        if (actualIndex >= total) return null;
        return (
          <View
            key={actualIndex}
            style={[
              styles.indicator,
              actualIndex === currentPage && styles.activeIndicator,
            ]}
          />
        );
      });
    }
  };

  return (
    <View style={styles.postContainer}>
      <View style={styles.mediaContainer}>
        <PagerView
          style={styles.pagerView}
          initialPage={0}
          onPageSelected={(e) => {
            setCurrentPage(e.nativeEvent.position);
            setPlayingVideoIndex(e.nativeEvent.position); // Uppdatera vilken video som spelar
          }}
        >
          {mediaArray.map((item, index) => renderMedia(item, index))}
        </PagerView>
        {heartVisible && (
          <LottieView
            ref={heartRef}
            loop={false}
            source={require("../../assets/Like.json")} // Din JSON-fil
            style={styles.heartAnimation}
            onAnimationFinish={() => {
              setHeartVisible(false); // Dölj hjärtat
              heartRef?.current?.reset(); // Reset animation
            }}
          />
        )}
      </View>
      <View style={styles.indicatorsContainer}>{renderIndicators()}</View>
      <Text style={styles.postDescription}>{post.description}</Text>
      <View style={styles.postActions}>
        <TouchableOpacity
          onPress={() => {
            onLike(post.id);
            if (isLiked) {
              setHasLiked(false); // Reset när man unlikar via knappen
            }
          }}
          style={styles.likeButton}
        >
          <Ionicons
            name={isLiked ? "heart" : "heart-outline"}
            size={24}
            color={isLiked ? "red" : "gray"}
          />
          <Text>{post.likes} Likes</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={24} color="red" />
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView
        style={styles.commentsSection}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {post.comments.map((comment) => {
          const commentKey = `${post.id}-${comment.id}`;
          const isCommentLiked = likedComments.includes(commentKey);
          return (
            <View key={comment.id} style={styles.commentContainer}>
              <Text style={styles.comment}>- {comment.text}</Text>
              <TouchableOpacity
                onPress={() =>
                  !isCommentLiked && onLikeComment(post.id, comment.id)
                }
                style={styles.commentLikeButton}
              >
                <Ionicons
                  name={isCommentLiked ? "heart" : "heart-outline"}
                  size={16}
                  color={isCommentLiked ? "red" : "gray"}
                />
                <Text>{comment.likes} Likes</Text>
              </TouchableOpacity>
            </View>
          );
        })}
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Skriv en kommentar..."
            value={commentText}
            onChangeText={setCommentText}
            onSubmitEditing={handleAddComment}
          />
          <TouchableOpacity
            onPress={handleAddComment}
            style={styles.commentIconButton}
          >
            <Ionicons name="paper-plane" size={20} color="gold" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [likedComments, setLikedComments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newMedia, setNewMedia] = useState([]); // Array för flera media
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "posts"), (querySnapshot) => {
      const postsData = [];
      querySnapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() });
      });
      setPosts(postsData);
    });
    return unsubscribe;
  }, []);

  // Funktion för att ladda upp media till Cloudinary
  const uploadMedia = async (uri) => {
    try {
      console.log("Starting upload to Cloudinary for URI:", uri);

      // Läs filen som base64 med expo-file-system
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64", // Fix: Använd sträng istället för FileSystem.EncodingType.Base64
      });
      console.log("File read as base64, length:", base64.length);

      // Skapa FormData för Cloudinary upload
      const formData = new FormData();
      formData.append("file", `data:image/jpeg;base64,${base64}`); // Anta jpeg för enkelhet, eller använd mimeType från ImagePicker
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      console.log("Uploading to Cloudinary...");
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error(
          `Cloudinary upload failed with status ${uploadResponse.status}`
        );
      }

      const uploadResult = await uploadResponse.json();
      console.log("Cloudinary upload result:", uploadResult);
      const downloadUrl = uploadResult.secure_url;
      console.log("Download URL:", downloadUrl);
      return downloadUrl;
    } catch (error) {
      console.log("uploadMedia error details:", error);
      throw error;
    }
  };

  const pickMedia = async () => {
    console.log("pickMedia called"); // För felsökning
    if (newMedia.length >= 10) {
      Alert.alert("Gräns nådd", "Max 10 media per inlägg.");
      return;
    }
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        "Behörighet krävs",
        "Du måste ge tillgång till kamerarullen."
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"], // Fix: Små bokstäver som strängar enligt felmeddelandet
        allowsEditing: true,
        aspect: [9, 16],
        quality: 1,
      });

      console.log("ImagePicker result:", result); // För felsökning
      if (result.canceled) {
        console.log("ImagePicker canceled by user");
        Alert.alert("Avbrutet", "Du avbröt valet av media.");
        return;
      }
      if (!result.canceled) {
        const mediaType = result.assets[0].type === "video" ? "video" : "image";
        setNewMedia([
          ...newMedia,
          { type: mediaType, uri: result.assets[0].uri },
        ]);
      }
    } catch (error) {
      console.log("ImagePicker error:", error); // För felsökning
      Alert.alert("Fel", "Kunde inte öppna galleriet. Försök igen.");
    }
  };

  const addPost = async () => {
    if (newMedia.length === 0) {
      Alert.alert("Fel", "Välj minst en bild eller video.");
      return;
    }
    try {
      console.log("Starting addPost, uploading media...");
      // Ladda upp varje media till Cloudinary och få download URL
      const uploadedMedia = [];
      for (const item of newMedia) {
        console.log("Uploading item:", item);
        const url = await uploadMedia(item.uri);
        uploadedMedia.push({ uri: url, type: item.type });
        console.log("Uploaded item, URL:", url);
      }
      console.log("All uploads done, adding to Firestore...");
      await addDoc(collection(db, "posts"), {
        media: uploadedMedia, // Spara URL:er istället för lokala URI:er
        description: newDescription || "",
        likes: 0,
        comments: [],
      });
      console.log("Post added successfully");
      setNewMedia([]);
      setNewDescription("");
      setModalVisible(false);
    } catch (error) {
      console.log("addPost error:", error);
      Alert.alert("Fel", `Kunde inte lägga till inlägget: ${error.message}`);
    }
  };

  const likePost = async (id) => {
    const isLiked = likedPosts.includes(id);
    const newLikedPosts = isLiked
      ? likedPosts.filter((postId) => postId !== id)
      : [...likedPosts, id];
    setLikedPosts(newLikedPosts);

    const postRef = doc(db, "posts", id);
    const post = posts.find((p) => p.id === id);
    const newLikes = isLiked ? post.likes - 1 : post.likes + 1;
    await updateDoc(postRef, { likes: newLikes });
  };

  const likePostDoubleTap = async (id) => {
    // Öka endast om inte redan liked (ingen toggle)
    if (!likedPosts.includes(id)) {
      setLikedPosts([...likedPosts, id]);
      const postRef = doc(db, "posts", id);
      const post = posts.find((p) => p.id === id);
      await updateDoc(postRef, { likes: post.likes + 1 });
    }
  };

  const addComment = async (postId, commentText) => {
    const postRef = doc(db, "posts", postId);
    const post = posts.find((p) => p.id === postId);
    const newComment = {
      id: Date.now().toString(),
      text: commentText,
      likes: 0,
    };
    await updateDoc(postRef, { comments: [...post.comments, newComment] });
  };

  const likeComment = async (postId, commentId) => {
    const commentKey = `${postId}-${commentId}`;
    if (likedComments.includes(commentKey)) return;

    setLikedComments([...likedComments, commentKey]);
    const postRef = doc(db, "posts", postId);
    const post = posts.find((p) => p.id === postId);
    const updatedComments = post.comments.map((comment) =>
      comment.id === commentId
        ? { ...comment, likes: comment.likes + 1 }
        : comment
    );
    await updateDoc(postRef, { comments: updatedComments });
  };

  const deletePost = async (id) => {
    try {
      await deleteDoc(doc(db, "posts", id));
    } catch (error) {
      Alert.alert("Fel", "Kunde inte ta bort inlägget.");
    }
  };

  const renderPost = ({ item }) => (
    <PostItem
      post={item}
      onLike={likePost}
      onLikeDoubleTap={likePostDoubleTap}
      likedPosts={likedPosts}
      likedComments={likedComments}
      onAddComment={addComment}
      onLikeComment={likeComment}
      onDelete={deletePost}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>För dig</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            onPress={() => signOut(auth)}
            style={styles.logoutButton}
          >
            <Text>Logga ut</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.addButton}
          >
            <Ionicons name="add-circle" size={30} color="gold" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        style={styles.postsList}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Lägg till nytt inlägg</Text>
            <TouchableOpacity
              onPress={pickMedia}
              style={styles.imagePickerButton}
            >
              <Text>
                {newMedia.length > 0
                  ? `${newMedia.length} media valda (max 10)`
                  : "Välj bilder/videos från galleriet"}
              </Text>
            </TouchableOpacity>
            {newMedia.length > 0 && (
              <FlatList
                data={newMedia}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <Image
                    source={{ uri: item.uri }}
                    style={styles.previewMedia}
                  />
                )}
                horizontal
                style={styles.previewList}
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Lägg till en beskrivning"
              placeholderTextColor="#999"
              value={newDescription}
              onChangeText={setNewDescription}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.cancelButton}
              >
                <Text>Avbryt</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={addPost} style={styles.postButton}>
                <Text>Posta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutButton: {
    marginRight: 10,
    padding: 5,
  },
  addButton: {
    padding: 5,
  },
  postsList: {
    flex: 1,
  },
  postContainer: {
    backgroundColor: "#fff",
    margin: 10,
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  mediaContainer: {
    position: "relative",
  },
  pagerView: {
    width: "100%",
    height: 450,
  },
  postMedia: {
    width: "100%",
    height: 450,
    borderRadius: 10,
    resizeMode: "cover",
  },
  heartAnimation: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -60 }, { translateY: -60 }],
    zIndex: 10,
    height: 120,
    width: 120,
  },
  indicatorsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ddd",
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: "gold",
  },
  postDescription: {
    marginTop: 10,
    fontSize: 16,
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteButton: {
    padding: 5,
  },
  commentsSection: {
    marginTop: 10,
  },
  commentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
  },
  comment: {
    flex: 1,
  },
  commentLikeButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 5,
  },
  commentIconButton: {
    marginLeft: 5,
    padding: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  imagePickerButton: {
    padding: 10,
    backgroundColor: "gold",
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
  },
  previewList: {
    marginBottom: 10,
  },
  previewMedia: {
    width: 80,
    height: 80,
    borderRadius: 5,
    marginRight: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    padding: 10,
  },
  postButton: {
    backgroundColor: "gold",
    padding: 10,
    borderRadius: 5,
  },
});

export default Community;
