import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MessageBubble from "../components/MessageBubble";
import * as DocumentPicker from "expo-document-picker";
import { Audio } from "expo-av";
import { BASE_URL } from "../constants/config";
import { getAuthToken } from "../utils/auth";
import {
  sendMessage,
  sendMessageWithAttachment,
  subscribeToMessages,
  markMessagesAsRead,
} from "../utils/chatService";

const ConversationScreen = ({ route, navigation }) => {
  const { chatId, otherUser } = route.params;
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserName, setCurrentUserName] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recording, setRecording] = useState(null);
  const recordingIntervalRef = useRef(null);

  useEffect(() => {
    initializeUser();
  }, []);

  useEffect(() => {
    if (currentUserId && chatId) {
      const unsubscribe = subscribeToMessages(chatId, (msgs) => {
        setMessages(msgs);
        setLoading(false);
        // Auto-scroll to bottom when new messages arrive
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      });

      // Mark messages as read when opening chat
      markMessagesAsRead(chatId, currentUserId);

      return () => unsubscribe();
    }
  }, [currentUserId, chatId]);

  const initializeUser = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      const userName = (await AsyncStorage.getItem("userName")) || "You";
      setCurrentUserId(userId);
      setCurrentUserName(userName);
    } catch (error) {
      console.error("Error initializing user:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !chatId) return;

    setSendingMessage(true);
    const text = messageText.trim();
    setMessageText("");

    try {
      await sendMessage(chatId, currentUserId, text, currentUserName);
      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessageText(text); // Restore message on error
    } finally {
      setSendingMessage(false);
    }
  };

  const uploadFileToServer = async (file, fileType) => {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error("No authentication token found");
      }

      const formData = new FormData();

      // Prepare file for upload
      const uri = file.uri;
      const uriParts = uri.split("/");
      const fileName =
        file.name || file.fileName || uriParts[uriParts.length - 1];
      const mimeType =
        file.mimeType ||
        file.type ||
        (fileType === "image" ? "image/jpeg" : "application/octet-stream");

      const fileToUpload = {
        uri,
        name: fileName,
        type: mimeType,
      };

      console.log("Uploading file:", {
        fileName,
        fileType,
        mimeType,
        fieldName:
          fileType === "image"
            ? "image"
            : fileType === "audio"
            ? "audio"
            : "file",
      });

      // Determine the correct field name based on file type
      const fieldName =
        fileType === "image"
          ? "image"
          : fileType === "audio"
          ? "audio"
          : "file";
      formData.append(fieldName, fileToUpload);

      const uploadUrl = `${BASE_URL}/chats/${chatId}/upload`;
      console.log("Upload URL:", uploadUrl);

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      console.log("Upload response status:", response.status);
      const responseText = await response.text();
      console.log("Upload response:", responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse response:", responseText);
        throw new Error("Invalid server response");
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Upload failed");
      }

      console.log("Upload successful:", result.data);
      return result.data;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const handleAttachFile = async () => {
    // Directly open document picker to allow both images and files
    await pickDocument();
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const document = result.assets[0];
        console.log("Picked document:", {
          name: document.name,
          mimeType: document.mimeType,
          size: document.size,
          uri: document.uri,
        });

        // Check file size (max 10MB)
        if (document.size > 10 * 1024 * 1024) {
          Alert.alert(
            "File too large",
            "Please select a file smaller than 10MB"
          );
          return;
        }

        // Determine if it's an image or other file type
        const isImage =
          document.mimeType?.startsWith("image/") ||
          document.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i);

        console.log("File type detected:", isImage ? "image" : "file");
        await sendFileMessage(document, isImage ? "image" : "file");
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const sendFileMessage = async (file, fileType) => {
    try {
      setSendingMessage(true);

      // Upload file to server
      const uploadedFile = await uploadFileToServer(file, fileType);

      // Send message with attachment
      await sendMessageWithAttachment(
        chatId,
        currentUserId,
        messageText.trim(),
        currentUserName,
        uploadedFile
      );

      setMessageText("");

      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Error sending file:", error);
      Alert.alert("Error", `Failed to send ${fileType}: ${error.message}`);
    } finally {
      setSendingMessage(false);
    }
  };

  // Voice recording functions
  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const startRecording = async () => {
    try {
      // Request permission
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please allow microphone access to record voice messages"
        );
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      console.log("Recording started");
    } catch (error) {
      console.error("Failed to start recording:", error);
      Alert.alert("Error", "Failed to start recording");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      console.log("Recording stopped, URI:", uri);

      // Send the voice message
      await sendVoiceMessage(uri);

      setRecording(null);
      setRecordingDuration(0);
    } catch (error) {
      console.error("Failed to stop recording:", error);
      Alert.alert("Error", "Failed to stop recording");
      setRecording(null);
      setRecordingDuration(0);
    }
  };

  const cancelRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      clearInterval(recordingIntervalRef.current);

      await recording.stopAndUnloadAsync();
      setRecording(null);
      setRecordingDuration(0);

      console.log("Recording cancelled");
    } catch (error) {
      console.error("Failed to cancel recording:", error);
    }
  };

  const sendVoiceMessage = async (audioUri) => {
    try {
      setSendingMessage(true);

      // Create file object from audio URI
      const fileName = `voice-${Date.now()}.m4a`;
      const audioFile = {
        uri: audioUri,
        name: fileName,
        type: "audio/m4a",
      };

      // Upload audio file
      const uploadedFile = await uploadFileToServer(audioFile, "audio");

      // Send message with audio attachment
      await sendMessageWithAttachment(
        chatId,
        currentUserId,
        "", // No text message with voice
        currentUserName,
        uploadedFile
      );

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error("Error sending voice message:", error);
      Alert.alert("Error", "Failed to send voice message: " + error.message);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleOpenProfile = async () => {
    if (!otherUser || !otherUser.type || !otherUser.id) {
      Alert.alert("Error", "Cannot open profile");
      return;
    }

    try {
      if (otherUser.type === "student") {
        // Fetch student data using user_id from backend
        const token = await getAuthToken();
        const response = await fetch(
          `${BASE_URL}/students/profile/${otherUser.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const result = await response.json();
        console.log("Fetched student profile:", result);

        if (result.success && result.data) {
          // Map all fields from backend response
          const studentData = result.data;

          // Navigate to student profile with complete data
          navigation.navigate("StudentDetailsScreen", {
            student: {
              name: studentData.name,
              email: studentData.email,
              major: studentData.major,
              year: studentData.year_of_study || studentData.year,
              year_of_study: studentData.year_of_study,
              skills: studentData.skills,
              bio: studentData.bio,
              photo_url: studentData.photo_url,
              photo_name: studentData.photo_name,
              cv_name: studentData.cv_name,
              cv_url: studentData.cv_url,
              project: studentData.project || {},
            },
          });
        } else {
          Alert.alert("Error", "Failed to load student profile");
        }
      } else if (otherUser.type === "company") {
        // Fetch company data using user_id from backend
        const token = await getAuthToken();
        console.log("Fetching company profile for user_id:", otherUser.id);

        const response = await fetch(
          `${BASE_URL}/companies/profile/${otherUser.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        console.log("Company profile response status:", response.status);
        const result = await response.json();
        console.log(
          "Fetched company profile:",
          JSON.stringify(result, null, 2)
        );

        if (!response.ok) {
          console.error("Company profile fetch failed:", result);
          Alert.alert(
            "Error",
            result.message || "Failed to load company profile"
          );
          return;
        }

        if (result.success && result.data) {
          // Navigate to company profile with complete data
          navigation.navigate("CompanyDetailsScreen", {
            company: result.data,
          });
        } else {
          console.error("Company profile data missing:", result);
          Alert.alert("Error", "Failed to load company profile");
        }
      } else {
        Alert.alert("Info", "Profile not available for this user type");
      }
    } catch (error) {
      console.error("Error opening profile:", error);
      Alert.alert("Error", "Failed to open profile: " + error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.mainColor} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerUser}>
            {otherUser.photoUrl ? (
              <Image
                source={{ uri: otherUser.photoUrl }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={24} color="#fff" />
              </View>
            )}
            <View style={styles.headerInfo}>
              <Text style={styles.headerName} numberOfLines={1}>
                {otherUser.name}
              </Text>
              <Text style={styles.headerType}>
                {otherUser.type === "student"
                  ? "Student"
                  : otherUser.type === "company"
                  ? "Company"
                  : "Visitor"}
              </Text>
            </View>
          </View>
        </View>

        {/* Messages List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.mainColor} />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={80}
              color="#E0E0E0"
            />
            <Text style={styles.emptyText}>No messages yet</Text>
            <Text style={styles.emptySubtext}>
              Start the conversation by saying hi! 👋
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MessageBubble
                message={item}
                isCurrentUser={item.senderId === currentUserId}
              />
            )}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
            onLayout={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}

        {/* Message Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        >
          <View style={styles.inputContainer}>
            {isRecording ? (
              // Recording UI
              <>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={cancelRecording}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={28} color="#FF3B30" />
                </TouchableOpacity>

                <View style={styles.recordingIndicator}>
                  <View style={styles.recordingDot} />
                  <Text style={styles.recordingTime}>
                    {formatRecordingTime(recordingDuration)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.stopRecordingButton}
                  onPress={stopRecording}
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark" size={24} color="#fff" />
                </TouchableOpacity>
              </>
            ) : (
              // Normal input UI
              <>
                <TouchableOpacity
                  style={styles.attachButton}
                  activeOpacity={0.7}
                  onPress={handleAttachFile}
                  disabled={sendingMessage}
                >
                  <Ionicons
                    name="add-circle"
                    size={28}
                    color={sendingMessage ? "#D0D0D0" : Colors.mainColor}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.micButton}
                  activeOpacity={0.7}
                  onPress={startRecording}
                  disabled={sendingMessage}
                >
                  <Ionicons
                    name="mic"
                    size={24}
                    color={sendingMessage ? "#D0D0D0" : Colors.mainColor}
                  />
                </TouchableOpacity>

                <TextInput
                  style={styles.messageInput}
                  placeholder="Type a message..."
                  placeholderTextColor="#999"
                  value={messageText}
                  onChangeText={setMessageText}
                  multiline
                  maxLength={1000}
                />

                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    (!messageText.trim() || sendingMessage) &&
                      styles.sendButtonDisabled,
                  ]}
                  onPress={handleSendMessage}
                  disabled={!messageText.trim() || sendingMessage}
                  activeOpacity={0.8}
                >
                  {sendingMessage ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Ionicons name="send" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.mainColor,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: Colors.mainColor,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  headerUser: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 2,
  },
  headerType: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    textTransform: "capitalize",
  },
  headerAction: {
    padding: 4,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#999",
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#B0B0B0",
    marginTop: 8,
    textAlign: "center",
  },
  messagesList: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  attachButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  micButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  messageInput: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: "#333",
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.mainColor,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    elevation: 3,
    shadowColor: Colors.mainColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  sendButtonDisabled: {
    backgroundColor: "#D0D0D0",
    elevation: 0,
    shadowOpacity: 0,
  },
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.mainColor,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    elevation: 3,
    shadowColor: Colors.mainColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  recordingIndicator: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3F3",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#FFD0D0",
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
    marginRight: 10,
  },
  recordingTime: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FF3B30",
  },
  cancelButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  stopRecordingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#34C759",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    elevation: 3,
    shadowColor: "#34C759",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
});

export default ConversationScreen;
