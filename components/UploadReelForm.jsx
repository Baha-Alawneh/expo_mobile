import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/constants";
import * as ImagePicker from "expo-image-picker";
import { Video } from "expo-av";
import { uploadReel } from "../apis/reel/Reel";

const UploadReelForm = ({ userId, onUploadSuccess }) => {
  const [videoUri, setVideoUri] = useState(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  const pickVideo = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant camera roll permissions to upload videos."
        );
        return;
      }

      // Launch image picker for video
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'videos',
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 120, // 2 minutes max
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setVideoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking video:", error);
      Alert.alert("Error", "Failed to pick video. Please try again.");
    }
  };

  const handleUpload = async () => {
    if (!videoUri) {
      Alert.alert("No Video", "Please select a video first.");
      return;
    }

    try {
      setUploading(true);

      await uploadReel(userId, videoUri, description);

      // Reset form state
      setVideoUri(null);
      setDescription("");
      
      // Call success callback before showing alert to avoid state timing issues
      if (onUploadSuccess) {
        onUploadSuccess();
      }

      Alert.alert("Success", "Your reel has been uploaded successfully!");
    } catch (error) {
      console.error("Error uploading reel:", error);
      Alert.alert(
        "Upload Failed",
        error.response?.data?.message || "Failed to upload reel. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Upload New Reel</Text>
        <Text style={styles.subtitle}>
          Share a short video (up to 2 minutes)
        </Text>

        {/* Video Preview or Picker */}
        {videoUri ? (
          <View style={styles.videoPreviewContainer}>
            <Video
              source={{ uri: videoUri }}
              style={styles.videoPreview}
              resizeMode="contain"
              useNativeControls
              shouldPlay={false}
            />
            <TouchableOpacity
              style={styles.removeVideoButton}
              onPress={() => setVideoUri(null)}
            >
              <Ionicons name="close-circle" size={32} color="#FF5252" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.videoPicker} onPress={pickVideo}>
            <Ionicons name="videocam" size={60} color={Colors.mainColor} />
            <Text style={styles.videoPickerText}>Tap to select video</Text>
            <Text style={styles.videoPickerSubText}>Max duration: 2 minutes</Text>
          </TouchableOpacity>
        )}

        {/* Description Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Add a description for your reel..."
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Text style={styles.charCount}>{description.length}/500</Text>
        </View>

        {/* Upload Button */}
        <TouchableOpacity
          style={[
            styles.uploadButton,
            (!videoUri || uploading) && styles.uploadButtonDisabled,
          ]}
          onPress={handleUpload}
          disabled={!videoUri || uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="cloud-upload" size={22} color="#fff" />
              <Text style={styles.uploadButtonText}>Upload Reel</Text>
            </>
          )}
        </TouchableOpacity>

        {uploading && (
          <Text style={styles.uploadingText}>
            Uploading your reel... This may take a moment.
          </Text>
        )}
      </View>

      {/* Tips Section */}
      <View style={styles.tipsCard}>
        <View style={styles.tipsHeader}>
          <Ionicons name="information-circle" size={24} color={Colors.mainColor} />
          <Text style={styles.tipsTitle}>Tips for Great Reels</Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
          <Text style={styles.tipText}>Keep videos under 2 minutes</Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
          <Text style={styles.tipText}>Use good lighting for better quality</Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
          <Text style={styles.tipText}>Add a descriptive caption</Text>
        </View>
        <View style={styles.tipItem}>
          <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
          <Text style={styles.tipText}>Shoot in vertical format for best viewing</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  videoPicker: {
    height: 250,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: Colors.mainColor,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    marginBottom: 20,
  },
  videoPickerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 12,
  },
  videoPickerSubText: {
    fontSize: 13,
    color: "#999",
    marginTop: 4,
  },
  videoPreviewContainer: {
    position: "relative",
    marginBottom: 20,
  },
  videoPreview: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    backgroundColor: "#000",
  },
  removeVideoButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: "#333",
    minHeight: 100,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.mainColor,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: Colors.mainColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  uploadButtonDisabled: {
    backgroundColor: "#ccc",
    elevation: 0,
    shadowOpacity: 0,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 8,
  },
  uploadingText: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginTop: 12,
    fontStyle: "italic",
  },
  tipsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
    flex: 1,
  },
});

export default UploadReelForm;
