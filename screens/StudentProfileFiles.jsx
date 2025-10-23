import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import {
  uploadStudentFiles,
  getStudentProfile,
  deleteStudentFile,
} from "../apis/student/StudentFiles";

const StudentProfileFiles = ({ userId }) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const result = await getStudentProfile(userId);
      if (result.success) {
        setProfile(result.data);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      // Request permission
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "We need camera roll permissions to upload photos"
        );
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadFiles({ photo: result.assets[0] });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image: " + error.message);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.type === "success") {
        await uploadFiles({ cv: result });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick document: " + error.message);
    }
  };

  const uploadFiles = async (files) => {
    try {
      setUploading(true);
      const result = await uploadStudentFiles(userId, files);

      if (result.success) {
        Alert.alert("Success", result.message);
        await loadProfile();
      }
    } catch (error) {
      Alert.alert("Upload Failed", error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileType) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete your ${fileType}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const result = await deleteStudentFile(userId, fileType);
              if (result.success) {
                Alert.alert("Success", result.message);
                await loadProfile();
              }
            } catch (error) {
              Alert.alert("Error", "Failed to delete file: " + error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const openCV = () => {
    if (profile?.cv_url) {
      Linking.openURL(profile.cv_url).catch(() => {
        Alert.alert("Error", "Cannot open CV");
      });
    }
  };

  if (loading && !profile) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Photo</Text>

        <View style={styles.photoContainer}>
          {profile?.photo_url ? (
            <Image
              source={{ uri: profile.photo_url }}
              style={styles.profilePhoto}
            />
          ) : (
            <View style={styles.placeholderPhoto}>
              <Text style={styles.placeholderText}>No Photo</Text>
            </View>
          )}
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={pickImage}
            disabled={uploading}
          >
            <Text style={styles.buttonText}>
              {profile?.photo_url ? "Change Photo" : "Upload Photo"}
            </Text>
          </TouchableOpacity>

          {profile?.photo_url && (
            <TouchableOpacity
              style={[styles.button, styles.dangerButton]}
              onPress={() => handleDeleteFile("photo")}
              disabled={uploading}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Curriculum Vitae (CV)</Text>

        {profile?.cv_name ? (
          <View style={styles.cvContainer}>
            <Text style={styles.cvFileName}>
              {profile.cv_name.split("/").pop()}
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={openCV}
              >
                <Text style={styles.buttonText}>View CV</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={pickDocument}
                disabled={uploading}
              >
                <Text style={styles.buttonText}>Replace</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.dangerButton]}
                onPress={() => handleDeleteFile("cv")}
                disabled={uploading}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View>
            <Text style={styles.noFileText}>No CV uploaded</Text>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={pickDocument}
              disabled={uploading}
            >
              <Text style={styles.buttonText}>Upload CV</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {uploading && (
        <View style={styles.uploadingOverlay}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.uploadingText}>Uploading...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    backgroundColor: "white",
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  photoContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  profilePhoto: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: "#007AFF",
  },
  placeholderPhoto: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#999",
    fontSize: 14,
  },
  cvContainer: {
    marginTop: 8,
  },
  cvFileName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    fontStyle: "italic",
  },
  noFileText: {
    fontSize: 14,
    color: "#999",
    marginBottom: 12,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    minWidth: 100,
    alignItems: "center",
    marginHorizontal: 4,
    marginVertical: 4,
  },
  primaryButton: {
    backgroundColor: "#007AFF",
  },
  secondaryButton: {
    backgroundColor: "#5856D6",
  },
  dangerButton: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  uploadingText: {
    color: "white",
    marginTop: 8,
    fontSize: 16,
  },
});

export default StudentProfileFiles;
