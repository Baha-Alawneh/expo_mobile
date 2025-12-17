import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { Colors } from "../constants/constants";

const MessageBubble = ({ message, isCurrentUser }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioPosition, setAudioPosition] = useState(0);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  useEffect(() => {
    // Load audio duration on mount if it's an audio message
    if (message.attachment && message.attachment.type === "audio") {
      loadAudioDuration(message.attachment.url);
    }

    return () => {
      // Cleanup sound on unmount
      if (sound) {
        sound.unloadAsync().catch((error) => {
          console.log("Error unloading sound:", error);
        });
      }
    };
  }, [message.attachment]);

  const loadAudioDuration = async (audioUrl) => {
    try {
      const { sound: tempSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false }
      );

      const status = await tempSound.getStatusAsync();
      if (status.isLoaded && status.durationMillis) {
        setAudioDuration(status.durationMillis);
      }

      await tempSound.unloadAsync();
    } catch (error) {
      console.log("Error loading audio duration:", error);
    }
  };

  const formatTime = (date) => {
    if (!date) return "";
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleFilePress = async (url, fileName) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Cannot open file");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open file: " + error.message);
    }
  };

  const formatAudioTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const handlePlayPauseAudio = async (audioUrl) => {
    try {
      setIsLoadingAudio(true);

      // If sound exists, check its status
      if (sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          if (isPlaying) {
            // Pause the audio
            await sound.pauseAsync();
            setIsPlaying(false);
          } else {
            // Resume playing
            await sound.playAsync();
            setIsPlaying(true);
          }
          setIsLoadingAudio(false);
          return;
        } else {
          // If sound is not loaded, unload it first
          await sound.unloadAsync();
          setSound(null);
        }
      }

      // Set audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      console.log("Loading audio from:", audioUrl);

      // Load and play new audio
      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true, progressUpdateIntervalMillis: 100 },
        onPlaybackStatusUpdate
      );

      console.log("Audio loaded, status:", status);

      if (status.isLoaded && status.durationMillis) {
        setAudioDuration(status.durationMillis);
      }

      setSound(newSound);
      setIsPlaying(true);
      setIsLoadingAudio(false);
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsLoadingAudio(false);
      setIsPlaying(false);
      Alert.alert("Error", "Failed to play audio message: " + error.message);
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (status.isLoaded) {
      setAudioPosition(status.positionMillis);

      if (status.durationMillis) {
        setAudioDuration(status.durationMillis);
      }

      if (status.didJustFinish) {
        setIsPlaying(false);
        setAudioPosition(0);
        // Reset the sound for next playback
        if (sound) {
          sound.setPositionAsync(0).catch((err) => {
            console.log("Error resetting position:", err);
          });
        }
      }
    } else if (status.error) {
      console.error("Playback error:", status.error);
      setIsPlaying(false);
      setIsLoadingAudio(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
        ]}
      >
        {!isCurrentUser && (
          <Text style={styles.senderName}>{message.senderName}</Text>
        )}

        {/* Render attachment if present */}
        {message.attachment && (
          <View style={styles.attachmentContainer}>
            {message.attachment.type === "image" ? (
              <TouchableOpacity
                onPress={() =>
                  handleFilePress(
                    message.attachment.url,
                    message.attachment.name
                  )
                }
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: message.attachment.url }}
                  style={styles.attachedImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ) : message.attachment.type === "audio" ? (
              <TouchableOpacity
                style={[
                  styles.audioAttachment,
                  isCurrentUser
                    ? styles.audioAttachmentCurrent
                    : styles.audioAttachmentOther,
                ]}
                onPress={() => handlePlayPauseAudio(message.attachment.url)}
                activeOpacity={0.7}
              >
                <View style={styles.audioIconContainer}>
                  {isLoadingAudio ? (
                    <ActivityIndicator
                      size="small"
                      color={isCurrentUser ? "#fff" : Colors.mainColor}
                    />
                  ) : (
                    <Ionicons
                      name={isPlaying ? "pause" : "play"}
                      size={24}
                      color={isCurrentUser ? "#fff" : Colors.mainColor}
                    />
                  )}
                </View>
                <View style={styles.audioInfo}>
                  <View style={styles.audioWaveform}>
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <View
                        key={i}
                        style={[
                          styles.waveformBar,
                          {
                            height: 12 + Math.random() * 12,
                            backgroundColor: isCurrentUser
                              ? "rgba(255,255,255,0.6)"
                              : Colors.mainColor + "80",
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text
                    style={[
                      styles.audioDuration,
                      isCurrentUser
                        ? styles.audioDurationCurrent
                        : styles.audioDurationOther,
                    ]}
                  >
                    {isPlaying && audioDuration > 0
                      ? formatAudioTime(audioDuration - audioPosition)
                      : audioDuration > 0
                      ? formatAudioTime(audioDuration)
                      : "0:00"}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.fileAttachment,
                  isCurrentUser
                    ? styles.fileAttachmentCurrent
                    : styles.fileAttachmentOther,
                ]}
                onPress={() =>
                  handleFilePress(
                    message.attachment.url,
                    message.attachment.name
                  )
                }
                activeOpacity={0.7}
              >
                <View style={styles.fileIconContainer}>
                  <Ionicons
                    name="document-text"
                    size={28}
                    color={isCurrentUser ? "#fff" : Colors.mainColor}
                  />
                </View>
                <View style={styles.fileInfo}>
                  <Text
                    style={[
                      styles.fileName,
                      isCurrentUser
                        ? styles.fileNameCurrent
                        : styles.fileNameOther,
                    ]}
                    numberOfLines={2}
                  >
                    {message.attachment.name}
                  </Text>
                  {message.attachment.size && (
                    <Text
                      style={[
                        styles.fileSize,
                        isCurrentUser
                          ? styles.fileSizeCurrent
                          : styles.fileSizeOther,
                      ]}
                    >
                      {formatFileSize(message.attachment.size)}
                    </Text>
                  )}
                </View>
                <Ionicons
                  name="download-outline"
                  size={22}
                  color={isCurrentUser ? "rgba(255,255,255,0.9)" : "#666"}
                />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Render text message if present */}
        {message.text && (
          <Text
            style={[
              styles.messageText,
              isCurrentUser ? styles.currentUserText : styles.otherUserText,
              message.attachment && styles.messageTextWithAttachment,
            ]}
          >
            {message.text}
          </Text>
        )}

        <Text
          style={[
            styles.timeText,
            isCurrentUser ? styles.currentUserTime : styles.otherUserTime,
          ]}
        >
          {formatTime(message.createdAt)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  currentUserContainer: {
    alignItems: "flex-end",
  },
  otherUserContainer: {
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  currentUserBubble: {
    backgroundColor: Colors.mainColor,
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.mainColor,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  currentUserText: {
    color: "#fff",
  },
  otherUserText: {
    color: "#333",
  },
  messageTextWithAttachment: {
    marginTop: 8,
  },
  timeText: {
    fontSize: 11,
    marginTop: 4,
  },
  currentUserTime: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "right",
  },
  otherUserTime: {
    color: "#999",
    textAlign: "left",
  },
  attachmentContainer: {
    marginBottom: 4,
  },
  attachedImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
  },
  fileAttachment: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 240,
  },
  fileAttachmentCurrent: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderColor: "rgba(255,255,255,0.3)",
  },
  fileAttachmentOther: {
    backgroundColor: "#F8F9FA",
    borderColor: "#E0E0E0",
  },
  fileIconContainer: {
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
    marginRight: 8,
  },
  fileName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
    lineHeight: 20,
  },
  fileNameCurrent: {
    color: "#fff",
  },
  fileNameOther: {
    color: "#333",
  },
  fileSize: {
    fontSize: 13,
    fontWeight: "500",
  },
  fileSizeCurrent: {
    color: "rgba(255,255,255,0.7)",
  },
  fileSizeOther: {
    color: "#999",
  },
  audioAttachment: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 24,
    borderWidth: 1,
    minWidth: 180,
  },
  audioAttachmentCurrent: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderColor: "rgba(255,255,255,0.3)",
  },
  audioAttachmentOther: {
    backgroundColor: "#F8F9FA",
    borderColor: "#E0E0E0",
  },
  audioIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  audioInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  audioWaveform: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 24,
    marginRight: 8,
  },
  waveformBar: {
    width: 3,
    borderRadius: 1.5,
    marginHorizontal: 1.5,
  },
  audioDuration: {
    fontSize: 12,
    fontWeight: "600",
    minWidth: 35,
  },
  audioDurationCurrent: {
    color: "rgba(255,255,255,0.9)",
  },
  audioDurationOther: {
    color: "#666",
  },
});

export default MessageBubble;
