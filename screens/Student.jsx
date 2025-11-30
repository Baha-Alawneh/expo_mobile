import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  StatusBar,
  SafeAreaView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/constants";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import OtherProjectsScreen from "./OtherProjectsScreen";
import CompaniesScreen from "./CompaniesScreen";
import MapScreen from "./MapScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStudentData, postStudentData } from "../apis/student/Student";
import { uploadStudentFiles } from "../apis/student/StudentFiles";
import { BASE_URL } from "../constants/config";
import {
  subscribeToUnreadCount,
  createOrUpdateUser,
} from "../utils/chatService";

const Student = ({ navigation }) => {
  // States
  const [activeTab, setActiveTab] = useState("profile");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [newSkill, setNewSkill] = useState("");

  // Helper function to get status color and text
  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return { color: "#4CAF50", text: "Approved", icon: "checkmark-circle" };
      case "rejected":
        return { color: "#FF5252", text: "Rejected", icon: "close-circle" };
      case "pending":
      default:
        return { color: "#FF9800", text: "Pending", icon: "time" };
    }
  };

  // Mock student data
  const [studentData, setStudentData] = useState({
    name: "",
    photo: "",
    email: "",
    major: "",
    year: "",
    skills: [],
    bio: "",
    cv: "",
    project: {
      title: "",
      booth: "A-12",
    },
  });

  // Mock notifications
  const notifications = [
    {
      id: 1,
      type: "approval",
      title: "Project Approved!",
      message:
        'Your project "Smart Campus Navigator" has been approved for the exhibition.',
      time: "2 hours ago",
      read: false,
      icon: "checkmark-circle",
      iconColor: "#4CAF50",
    },
    {
      id: 2,
      type: "message",
      title: "New Message",
      message:
        "Tech Solutions Co. is interested in your project and sent you a message.",
      time: "5 hours ago",
      read: false,
      icon: "mail",
      iconColor: Colors.mainColor,
    },

    {
      id: 4,
      type: "info",
      title: "Expo Reminder",
      message: "TEDI-Expo starts in 3 days. Make sure your booth is ready!",
      time: "2 days ago",
      read: true,
      icon: "information-circle",
      iconColor: "#FF9800",
    },
  ];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "Sorry, we need camera roll permissions to make this work!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5, // Reduced quality to 0.5 to reduce file size for better upload success
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0];

      try {
        const userId = await AsyncStorage.getItem("userId");

        if (!userId) {
          Alert.alert("Error", "User ID not found. Please login again.");
          return;
        }

        // Show loading alert
        Alert.alert("Uploading", "Please wait, uploading your photo...", [
          { text: "Cancel", onPress: () => {} },
        ]);

        // Upload to S3 immediately
        const uploadResult = await uploadStudentFiles(userId, {
          photo: selectedImage,
        });

        if (uploadResult.success) {
          // Update state with S3 URL
          setStudentData((prev) => ({
            ...prev,
            photo: uploadResult.data.photo_url,
            photo_url: uploadResult.data.photo_url,
            photo_name: uploadResult.data.photo_name,
          }));

          Alert.alert("Success", "Photo uploaded successfully!");
        } else {
          Alert.alert(
            "Upload Failed",
            uploadResult.message || "Failed to upload photo"
          );
        }
      } catch (error) {
        let errorMessage = "Failed to upload photo";

        // Check for specific error types
        if (error.message.includes("Network request failed")) {
          errorMessage =
            "Network Error: Cannot connect to server.\n\nPlease check:\n1. Backend server is running\n2. Your device is on the same network\n3. Server IP address is correct: " +
            BASE_URL;
        } else if (error.message.includes("timeout")) {
          errorMessage =
            "Upload timeout. Please check your internet connection and try again.";
        } else if (error.message) {
          errorMessage = error.message;
        }

        Alert.alert("Upload Error", errorMessage);
      }
    }
  };

  const pickCV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const selectedCV = result.assets[0];

        // Show loading alert
        Alert.alert("Uploading", "Uploading your CV...");

        try {
          const userId = await AsyncStorage.getItem("userId");

          // Upload to S3 immediately
          const uploadResult = await uploadStudentFiles(userId, {
            cv: selectedCV,
          });

          if (uploadResult.success) {
            // Update state with S3 URL
            setStudentData((prev) => ({
              ...prev,
              cv: uploadResult.data.cv_name
                ? uploadResult.data.cv_name.split("/").pop()
                : selectedCV.name,
              cv_url: uploadResult.data.cv_url,
              cv_name: uploadResult.data.cv_name,
              cvUri: null, // Clear local URI
            }));

            Alert.alert("Success", "CV uploaded successfully!");
          } else {
            Alert.alert("Error", uploadResult.message || "Failed to upload CV");
          }
        } catch (error) {
          Alert.alert("Error", "Failed to upload CV: " + error.message);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick CV file");
    }
  };

  const downloadCV = async () => {
    if (!studentData.cv && !studentData.cv_url) {
      Alert.alert("No CV", "No CV file available to download");
      return;
    }

    try {
      // If there's a cv_url (from S3), open it in browser
      if (studentData.cv_url) {
        const { Linking } = require("react-native");
        const canOpen = await Linking.canOpenURL(studentData.cv_url);
        if (canOpen) {
          await Linking.openURL(studentData.cv_url);
        } else {
          Alert.alert("Error", "Cannot open CV URL");
        }
      }
      // If there's a local cvUri, use Sharing API
      else if (studentData.cvUri) {
        const { default: Sharing } = await import("expo-sharing");
        const isAvailable = await Sharing.isAvailableAsync();

        if (isAvailable) {
          await Sharing.shareAsync(studentData.cvUri);
        } else {
          Alert.alert("Info", "Sharing not available on this device");
        }
      } else {
        Alert.alert("Info", `CV: ${studentData.cv}`);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to download CV");
    }
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setStudentData((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (index) => {
    setStudentData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const renderProfileSection = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: studentData.photo }}
            style={styles.profileImageLarge}
          />
          <View style={styles.statusIndicator} />
        </View>
        <Text style={styles.profileNameLarge}>{studentData.name}</Text>
        <Text style={styles.profileMajor}>
          {studentData.major} • {studentData.year}
        </Text>
        <Text style={styles.profileEmail}>{studentData.email}</Text>
      </View>

      {/* Project Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="cube-outline" size={24} color={Colors.mainColor} />
          <Text style={[styles.cardTitle, { marginLeft: 10 }]}>My Project</Text>
        </View>
        <Text style={styles.projectTitle}>
          {studentData.project?.title || "No project"}
        </Text>
      </View>

      {/* Skills Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons
            name="code-slash-outline"
            size={24}
            color={Colors.mainColor}
          />
          <Text style={[styles.cardTitle, { marginLeft: 10 }]}>Skills</Text>
        </View>
        <View style={styles.skillsContainer}>
          {studentData.skills?.map((skill, index) => (
            <View key={index} style={styles.skillChip}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Bio Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="person-outline" size={24} color={Colors.mainColor} />
          <Text style={[styles.cardTitle, { marginLeft: 10 }]}>About Me</Text>
        </View>
        <Text style={styles.bioText}>{studentData.bio}</Text>
      </View>

      {/* CV Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons
            name="document-text-outline"
            size={24}
            color={Colors.mainColor}
          />
          <Text style={[styles.cardTitle, { marginLeft: 8 }]}>
            Curriculum Vitae
          </Text>
        </View>
        <TouchableOpacity style={styles.cvButton} onPress={downloadCV}>
          <Ionicons
            name={
              studentData.cv || studentData.cv_name
                ? "download-outline"
                : "document-outline"
            }
            size={20}
            color={
              studentData.cv || studentData.cv_name ? Colors.mainColor : "#999"
            }
          />
          <Text
            style={[
              styles.cvButtonText,
              !(studentData.cv || studentData.cv_name) &&
                styles.cvButtonTextDisabled,
              { marginLeft: 8 },
            ]}
          >
            {studentData.cv || studentData.cv_name
              ? "Download CV"
              : "No CV uploaded"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => setShowEditProfile(true)}
      >
        <Ionicons name="create-outline" size={20} color="#fff" />
        <Text style={[styles.editButtonText, { marginLeft: 8 }]}>
          Edit Profile
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
  // student data handlers
  const handleFetchStudentData = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");

      if (!userId) {
        Alert.alert("Error", "User ID not found. Please login again.");
        return;
      }

      const result = await getStudentData(userId);

      // Handle unauthorized (401) error
      if (result.unauthorized) {
        Alert.alert("Session Expired", "Please login again.");
        // TODO: Navigate to login screen
        return;
      }

      if (result.success && result.data) {
        const fetchedData = result.data;
        setStudentData((prev) => ({
          ...prev,
          name: fetchedData.name || prev.name,
          email: fetchedData.email || prev.email,
          major: fetchedData.major || prev.major,
          year: fetchedData.year_of_study || fetchedData.year || prev.year,
          skills: Array.isArray(fetchedData.skills)
            ? fetchedData.skills
            : typeof fetchedData.skills === "string"
            ? JSON.parse(fetchedData.skills)
            : prev.skills,
          bio: fetchedData.bio || prev.bio,
          // Use photo_url from S3 if available, otherwise keep placeholder
          photo: fetchedData.photo_url || prev.photo,
          photo_url: fetchedData.photo_url || prev.photo_url,
          photo_name: fetchedData.photo_name || prev.photo_name,
          // Use cv_name for display if available
          cv: fetchedData.cv_name
            ? fetchedData.cv_name.split("/").pop()
            : prev.cv,
          cv_url: fetchedData.cv_url || prev.cv_url,
          cv_name: fetchedData.cv_name || prev.cv_name,
          project: fetchedData.project || prev.project,
        }));

        // Sync updated profile to Firestore for chat system
        try {
          const userType = await AsyncStorage.getItem("userType");
          await createOrUpdateUser(userId, {
            name: fetchedData.name || "Student",
            email: fetchedData.email || "",
            type: userType || "student",
            photoUrl: fetchedData.photo_url || null,
          });
          // Update userName in AsyncStorage for chat messages
          if (fetchedData.name) {
            await AsyncStorage.setItem("userName", fetchedData.name);
          }
        } catch (syncError) {
          console.log("Firestore sync warning:", syncError);
        }
      } else {
        Alert.alert("Error", result.message || "Failed to load profile data");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while loading your profile");
    }
  };

  const handleUpdateStudentData = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");

      const result = await postStudentData(userId, studentData);

      if (result.success) {
        setStudentData((prev) => ({
          ...prev,
          ...result.data,
          project: result.data.project || prev.project,
        }));

        // Sync updated profile to Firestore for chat system
        try {
          const userType = await AsyncStorage.getItem("userType");
          await createOrUpdateUser(userId, {
            name: result.data.name || studentData.name || "Student",
            email: result.data.email || studentData.email || "",
            type: userType || "student",
            photoUrl: result.data.photo_url || studentData.photo_url || null,
          });
          // Update userName in AsyncStorage for chat messages
          if (result.data.name || studentData.name) {
            await AsyncStorage.setItem(
              "userName",
              result.data.name || studentData.name
            );
          }
        } catch (syncError) {
          console.log("Firestore sync warning:", syncError);
        }
      } else {
        alert("Update failed: " + result.message);
      }
    } catch (error) {
      alert("Error updating student data: " + error.message);
    }
  };

  //useEffects
  useEffect(() => {
    handleFetchStudentData();
  }, []);

  useEffect(() => {
    // Subscribe to real-time unread message count
    const initializeChat = async () => {
      const userId = await AsyncStorage.getItem("userId");
      if (userId) {
        const unsubscribe = subscribeToUnreadCount(userId, (count) => {
          setChatUnreadCount(count);
        });
        return unsubscribe;
      }
    };

    initializeChat();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={Colors.mainColor}
        />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Image
                source={{
                  uri:
                    studentData.photo ||
                    studentData.photo_url ||
                    "https://via.placeholder.com/150",
                }}
                style={styles.headerPhoto}
              />
              <View>
                <Text style={styles.headerGreeting}>Welcome back,</Text>
                <Text style={styles.headerName}>
                  {studentData.name
                    ? studentData.name.split(" ")[0]
                    : "Student"}
                </Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate("ChatListScreen")}
              >
                <Ionicons name="chatbubbles-outline" size={28} color="#fff" />
                {chatUnreadCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.badgeText}>
                      {chatUnreadCount > 99 ? "99+" : chatUnreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setShowNotifications(true)}
              >
                <Ionicons name="notifications-outline" size={28} color="#fff" />
                {unreadCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.badgeText}>{unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScroll}
          >
            <TouchableOpacity
              style={[styles.tab, activeTab === "profile" && styles.activeTab]}
              onPress={() => setActiveTab("profile")}
            >
              <Ionicons
                name={activeTab === "profile" ? "person" : "person-outline"}
                size={20}
                color={activeTab === "profile" ? "#fff" : Colors.mainColor}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "profile" && styles.activeTabText,
                  { marginLeft: 8 },
                ]}
              >
                Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tab}
              onPress={() => navigation.navigate("MyProject")}
            >
              <Ionicons
                name="folder-outline"
                size={20}
                color={Colors.mainColor}
              />
              <Text style={[styles.tabText, { marginLeft: 8 }]}>
                My Project
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "students" && styles.activeTab]}
              onPress={() => setActiveTab("students")}
            >
              <Ionicons
                name={
                  activeTab === "students" ? "briefcase" : "briefcase-outline"
                }
                size={20}
                color={activeTab === "students" ? "#fff" : Colors.mainColor}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "students" && styles.activeTabText,
                  { marginLeft: 8 },
                ]}
              >
                Other Projects
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "companies" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("companies")}
            >
              <Ionicons
                name={
                  activeTab === "companies" ? "business" : "business-outline"
                }
                size={20}
                color={activeTab === "companies" ? "#fff" : Colors.mainColor}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "companies" && styles.activeTabText,
                  { marginLeft: 8 },
                ]}
              >
                Companies
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "map" && styles.activeTab]}
              onPress={() => setActiveTab("map")}
            >
              <Ionicons
                name={activeTab === "map" ? "map" : "map-outline"}
                size={20}
                color={activeTab === "map" ? "#fff" : Colors.mainColor}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "map" && styles.activeTabText,
                  { marginLeft: 8 },
                ]}
              >
                Map
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Content */}
        {activeTab === "profile" && renderProfileSection()}
        {activeTab === "students" && (
          <OtherProjectsScreen navigation={navigation} />
        )}
        {activeTab === "companies" && (
          <CompaniesScreen navigation={navigation} />
        )}
        {activeTab === "map" && (
          <MapScreen
            studentProject={studentData.project?.title || "No Project"}
          />
        )}

        {/* Notifications Modal */}
        <Modal
          visible={showNotifications}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowNotifications(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Notifications</Text>
                <TouchableOpacity onPress={() => setShowNotifications(false)}>
                  <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {notifications.map((notification) => (
                  <TouchableOpacity
                    key={notification.id}
                    style={[
                      styles.notificationItem,
                      !notification.read && styles.unreadNotification,
                    ]}
                    onPress={() => {
                      // Mark as read logic
                      setUnreadCount(Math.max(0, unreadCount - 1));
                    }}
                  >
                    <View
                      style={[
                        styles.notificationIconContainer,
                        { backgroundColor: notification.iconColor + "20" },
                      ]}
                    >
                      <Ionicons
                        name={notification.icon}
                        size={24}
                        color={notification.iconColor}
                      />
                    </View>
                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationTitle}>
                        {notification.title}
                      </Text>
                      <Text style={styles.notificationMessage}>
                        {notification.message}
                      </Text>
                      <Text style={styles.notificationTime}>
                        {notification.time}
                      </Text>
                    </View>
                    {!notification.read && <View style={styles.unreadDot} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Edit Profile Modal */}
        <Modal
          visible={showEditProfile}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowEditProfile(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={() => setShowEditProfile(false)}>
                  <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                  style={styles.editPhotoContainer}
                  onPress={pickImage}
                >
                  <Image
                    source={{
                      uri:
                        studentData.photo ||
                        studentData.photo_url ||
                        "https://via.placeholder.com/150",
                    }}
                    style={styles.editPhoto}
                  />
                  <View style={styles.editPhotoButton}>
                    <Ionicons name="camera" size={20} color="#fff" />
                  </View>
                </TouchableOpacity>

                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={studentData.name}
                  onChangeText={(text) =>
                    setStudentData((prev) => ({ ...prev, name: text }))
                  }
                />

                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={studentData.email}
                  editable={false}
                />

                <Text style={styles.inputLabel}>Major</Text>
                <TextInput
                  style={styles.input}
                  value={studentData.major}
                  onChangeText={(text) =>
                    setStudentData((prev) => ({ ...prev, major: text }))
                  }
                />

                <Text style={styles.inputLabel}>Year of Study</Text>
                <TextInput
                  style={styles.input}
                  value={studentData.year}
                  onChangeText={(text) =>
                    setStudentData((prev) => ({ ...prev, year: text }))
                  }
                  placeholder="e.g., 3rd Year"
                />

                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={studentData.bio}
                  onChangeText={(text) =>
                    setStudentData((prev) => ({ ...prev, bio: text }))
                  }
                  multiline
                  numberOfLines={4}
                />

                <Text style={styles.inputLabel}>Skills</Text>
                <View style={styles.skillsEditor}>
                  <View style={styles.skillsList}>
                    {studentData.skills?.map((skill, index) => (
                      <View key={index} style={styles.skillItemWithRemove}>
                        <Text style={styles.skillItemText}>{skill}</Text>
                        <TouchableOpacity onPress={() => removeSkill(index)}>
                          <Ionicons
                            name="close-circle"
                            size={20}
                            color="#FF5252"
                          />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>

                  <View style={styles.addSkillContainer}>
                    <TextInput
                      style={styles.skillInput}
                      value={newSkill}
                      onChangeText={setNewSkill}
                      placeholder="Enter a skill"
                      onSubmitEditing={addSkill}
                    />
                    <TouchableOpacity
                      style={styles.addSkillButton}
                      onPress={addSkill}
                    >
                      <Ionicons name="add" size={24} color={Colors.mainColor} />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.inputLabel}>Curriculum Vitae</Text>
                <TouchableOpacity
                  style={styles.cvUploadButton}
                  onPress={pickCV}
                >
                  <Ionicons
                    name="cloud-upload-outline"
                    size={20}
                    color={Colors.mainColor}
                  />
                  <Text style={[styles.cvUploadButtonText, { marginLeft: 8 }]}>
                    {studentData.cv || "Upload CV (PDF)"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={async () => {
                    await handleUpdateStudentData();
                    // Refresh the profile to get latest S3 URLs
                    await handleFetchStudentData();
                    setShowEditProfile(false);
                    Alert.alert("Success", "Profile updated successfully!");
                  }}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
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
    paddingTop: Platform.OS === "ios" ? 10 : 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: "#fff",
    marginRight: 12,
  },
  headerGreeting: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.9,
  },
  headerName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  notificationButton: {
    position: "relative",
    padding: 5,
  },
  headerActions: {
    flexDirection: "row",
  },
  iconButton: {
    position: "relative",
    padding: 5,
  },
  notificationBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#FF5252",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.mainColor,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  tabContainer: {
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabScroll: {
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: "#F0F4FF",
  },
  activeTab: {
    backgroundColor: Colors.mainColor,
  },
  tabText: {
    fontSize: 14,
    color: Colors.mainColor,
    fontWeight: "600",
  },
  activeTabText: {
    color: "#fff",
  },
  tabContent: {
    flex: 1,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  profileHeader: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 15,
  },
  profileImageLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: Colors.mainColor,
  },
  statusIndicator: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4CAF50",
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileNameLarge: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  profileMajor: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: "#999",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  boothTag: {
    flexDirection: "row",
    alignItems: "center",
  },
  boothText: {
    fontSize: 14,
    color: Colors.mainColor,
    fontWeight: "600",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillChip: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.mainColor + "30",
  },
  skillText: {
    color: Colors.mainColor,
    fontSize: 14,
    fontWeight: "600",
  },
  bioText: {
    fontSize: 15,
    color: "#555",
    lineHeight: 24,
  },
  cvButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4FF",
    padding: 15,
    borderRadius: 10,
  },
  cvButtonText: {
    color: Colors.mainColor,
    fontSize: 14,
    fontWeight: "600",
  },
  cvButtonTextDisabled: {
    color: "#999",
  },
  cvUploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4FF",
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.mainColor + "30",
  },
  cvUploadButtonText: {
    color: Colors.mainColor,
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  editButton: {
    backgroundColor: Colors.mainColor,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 10,
    marginBottom: Platform.OS === "ios" ? 40 : 20,
    elevation: 3,
    shadowColor: Colors.mainColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: "85%",
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  notificationItem: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    alignItems: "flex-start",
  },
  unreadNotification: {
    backgroundColor: "#F0F8FF",
  },
  notificationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: "#999",
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.mainColor,
    marginTop: 5,
  },
  editPhotoContainer: {
    alignSelf: "center",
    marginVertical: 20,
    position: "relative",
  },
  editPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.mainColor,
  },
  editPhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.mainColor,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 15,
    fontSize: 14,
    color: "#333",
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: Colors.mainColor,
    borderRadius: 25,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 25,
    alignItems: "center",
    elevation: 3,
    shadowColor: Colors.mainColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  skillsEditor: {
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.mainColor + "40",
    borderRadius: 10,
    padding: 15,
    backgroundColor: "#F8F9FA",
  },
  skillsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  skillItemWithRemove: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.mainColor + "30",
  },
  skillItemText: {
    color: Colors.mainColor,
    fontSize: 14,
    fontWeight: "600",
  },
  addSkillContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  skillInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  addSkillButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.mainColor,
  },
  emptyProjectCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyProjectText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 15,
    marginBottom: 8,
  },
  emptyProjectSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
  editProjectHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  editProjectHintText: {
    color: Colors.mainColor,
    fontSize: 14,
    fontWeight: "600",
  },
  addProjectButton: {
    backgroundColor: Colors.mainColor,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addProjectText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  projectCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  projectCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  projectCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 10,
  },
  projectStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  projectStatusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  projectCardDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 15,
  },
  projectImagesContainer: {
    marginBottom: 15,
  },
  projectImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  demoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  demoButtonText: {
    color: Colors.mainColor,
    fontSize: 14,
    fontWeight: "600",
  },
  uploadImageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4FF",
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.mainColor + "30",
  },
  uploadImageText: {
    color: Colors.mainColor,
    fontSize: 14,
    fontWeight: "600",
  },
  selectedImagesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  selectedImageContainer: {
    position: "relative",
    marginRight: 10,
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF5252",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: "85%",
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  notificationItem: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    alignItems: "flex-start",
  },
  unreadNotification: {
    backgroundColor: "#F0F8FF",
  },
  notificationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: "#999",
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.mainColor,
    marginTop: 5,
  },
  // Modern Project Styles
  modernProjectContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  modernProjectHeader: {
    marginBottom: 20,
  },
  modernProjectTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  modernProjectTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  modernStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  modernStatusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  modernProjectSection: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modernSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  modernSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  modernProjectDescription: {
    fontSize: 15,
    color: "#666",
    lineHeight: 24,
    paddingLeft: 28,
  },
  modernImageGallery: {
    marginLeft: 28,
  },
  modernImageCard: {
    position: "relative",
    marginRight: 12,
  },
  modernProjectImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  imageNumberBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageNumberText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  modernLinksContainer: {
    paddingLeft: 28,
  },
  modernLinkButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  modernLinkIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modernLinkContent: {
    flex: 1,
  },
  modernLinkTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  modernLinkUrl: {
    fontSize: 12,
    color: "#999",
  },
  modernTeamContainer: {
    paddingLeft: 28,
  },
  modernMemberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  modernMemberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.mainColor,
    justifyContent: "center",
    alignItems: "center",
  },
  modernMemberInfo: {
    flex: 1,
  },
  modernMemberName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  modernMemberEmail: {
    fontSize: 13,
    color: "#666",
  },
  modernEditButton: {
    backgroundColor: Colors.mainColor,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    elevation: 3,
    shadowColor: Colors.mainColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modernEditButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Student;
