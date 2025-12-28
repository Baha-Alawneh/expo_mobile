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
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../constants/constants";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import OtherProjectsScreen from "./OtherProjectsScreen";
import CompaniesScreen from "./CompaniesScreen";
import MapScreen from "./MapScreen";
import ModernProjectContent from "../components/student/ModernProjectContent";
import ModernBottomNav from "../components/student/ModernBottomNav";
import ModernSidebar from "../components/student/ModernSidebar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStudentData, postStudentData } from "../apis/student/Student";
import { uploadStudentFiles } from "../apis/student/StudentFiles";
import { BASE_URL } from "../constants/config";
import {
  subscribeToUnreadCount,
  createOrUpdateUser,
} from "../utils/chatService";
import {
  subscribeToTopic,
  addNotificationReceivedListener,
  loadNotifications,
  saveNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "../utils/notificationService";

const Student = ({ navigation }) => {
  // States
  const [activeTab, setActiveTab] = useState("profile");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showNotificationDetails, setShowNotificationDetails] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [newSkill, setNewSkill] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);

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

  // Initialize notifications
  useEffect(() => {
    console.log("[Student] useEffect: Initializing notifications");
    let unsubscribe = null;
    
    const initializeNotifications = async () => {
      try {
        // Get userId from AsyncStorage
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          console.log("[Student] No userId found, skipping notification setup");
          return;
        }
        console.log(`[Student] userId: ${userId}`);

        // Load saved notifications (user-specific)
        const savedNotifications = await loadNotifications(userId);
        console.log(`[Student] Loaded ${savedNotifications.length} saved notifications`);
        
        // Remove duplicates based on notification ID
        const uniqueNotifications = Array.from(
          new Map(savedNotifications.map(n => [n.id, n])).values()
        );
        console.log(`[Student] After dedup: ${uniqueNotifications.length} unique notifications`);
        
        setNotifications(uniqueNotifications);
        setUnreadCount(uniqueNotifications.filter((n) => !n.read).length);
        
        // Save deduplicated notifications back to AsyncStorage
        if (uniqueNotifications.length !== savedNotifications.length) {
          await saveNotifications(uniqueNotifications, userId);
          console.log(`[Student] Saved deduplicated notifications`);
        }

        // Subscribe to Firestore notifications for this user
        console.log(`[Student] Subscribing to Firestore notifications`);
        unsubscribe = await subscribeToTopic(
          "student",
          userId,
          async (newNotifications) => {
            // New notifications received from Firestore (array)
            console.log(`[Student] Callback: Received ${newNotifications.length} notifications`);
            const current = await loadNotifications(userId);
            
            // Filter out notifications that already exist
            const uniqueNew = newNotifications.filter(
              notification => !current.some(n => n.id === notification.id)
            );
            console.log(`[Student] Callback: ${uniqueNew.length} are truly new`);
            
            if (uniqueNew.length === 0) {
              console.log(`[Student] Callback: All notifications already exist, skipping`);
              return; // All notifications already exist
            }
            
            const updatedNotifications = [...uniqueNew, ...current];
            setNotifications(updatedNotifications);
            setUnreadCount((prev) => prev + uniqueNew.length);
            await saveNotifications(updatedNotifications, userId);
            console.log(`[Student] Callback: Saved ${updatedNotifications.length} total notifications`);
          }
        );
        console.log(`[Student] Successfully subscribed to notifications`);
      } catch (error) {
        console.error("[Student] Error initializing notifications:", error);
      }
    };

    initializeNotifications();
    
    // Return cleanup function
    return () => {
      console.log(`[Student] useEffect cleanup: Unsubscribing from notifications`);
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  // Handle notification tap
  const handleNotificationTap = async (notification) => {
    // Mark as read if unread
    if (!notification.read) {
      const updated = await markNotificationAsRead(notification.id);
      setNotifications(updated);
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    // Open details modal
    setSelectedNotification(notification);
    setShowNotificationDetails(true);
  };

  // Handle notification delete
  const handleDeleteNotification = async (notificationId, wasRead) => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      const updated = await deleteNotification(userId, notificationId);
      setNotifications(updated);
      if (!wasRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

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
      {/* Single Premium Profile Card */}
      <View style={styles.singleProfileCard}>
        {/* Edit Button - Top Right Corner */}
        <TouchableOpacity
          style={styles.profileEditButton}
          onPress={() => setShowEditProfile(true)}
        >
          <Ionicons name="create-outline" size={20} color="#1b2e4f" />
        </TouchableOpacity>

        {/* Profile Header Section */}
        <View style={styles.profileHeaderSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri:
                  studentData.photo ||
                  studentData.photo_url ||
                  "https://via.placeholder.com/150",
              }}
              style={styles.profileImageLarge}
            />
            <View style={styles.statusIndicator} />
          </View>
          <Text style={styles.profileNameLarge}>{studentData.name}</Text>
          <Text style={styles.profileMajor}>
            {studentData.major} • {studentData.year}
          </Text>
        </View>

        {/* Elegant Divider */}
        <View style={styles.sectionDivider} />

        {/* Contact Information Section */}
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="mail-outline" size={22} color={Colors.mainColor} />
            <Text style={styles.sectionTitle}>Contact</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail" size={18} color="#64748b" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{studentData.email}</Text>
            </View>
          </View>
        </View>

        {/* Elegant Divider */}
        <View style={styles.sectionDivider} />

        {/* Project Section */}
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="cube-outline" size={22} color={Colors.mainColor} />
            <Text style={styles.sectionTitle}>My Project</Text>
          </View>
          <Text style={styles.projectTitle}>
            {studentData.project?.title || "No project"}
          </Text>
        </View>

        {/* Elegant Divider */}
        <View style={styles.sectionDivider} />

        {/* Skills Section */}
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="code-slash-outline" size={22} color={Colors.mainColor} />
            <Text style={styles.sectionTitle}>Skills</Text>
          </View>
          <View style={styles.skillsContainer}>
            {studentData.skills?.map((skill, index) => (
              <View key={index} style={styles.skillChip}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Elegant Divider */}
        <View style={styles.sectionDivider} />

        {/* Bio Section */}
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={22} color={Colors.mainColor} />
            <Text style={styles.sectionTitle}>About Me</Text>
          </View>
          <Text style={styles.bioText}>{studentData.bio || "No bio available"}</Text>
        </View>

        {/* Elegant Divider */}
        <View style={styles.sectionDivider} />

        {/* CV Section */}
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={22} color={Colors.mainColor} />
            <Text style={styles.sectionTitle}>Curriculum Vitae</Text>
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
              ]}
            >
              {studentData.cv || studentData.cv_name
                ? "Download CV"
                : "No CV uploaded"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleNavigateFromSidebar = (route) => {
    if (route === "map") {
      setActiveTab("map");
    } else {
      navigation.navigate(route);
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

        {/* Modern Header with Gradient */}
        <LinearGradient
          colors={[Colors.mainColor, "#2d4a73", "#3d5a83"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={{
                    uri:
                      studentData.photo ||
                      studentData.photo_url ||
                      "https://via.placeholder.com/150",
                  }}
                  style={styles.headerPhoto}
                />
                <View style={styles.onlineStatusDot} />
              </View>
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
                onPress={() => setShowNotifications(true)}
                activeOpacity={0.7}
              >
                <View style={styles.iconButtonInner}>
                  <Ionicons name="notifications-outline" size={24} color="#fff" />
                  {unreadCount > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.badgeText}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setShowSidebar(true)}
                activeOpacity={0.7}
              >
                <View style={styles.iconButtonInner}>
                  <Ionicons name="menu" size={24} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Content Area - Fixed between header and bottom nav */}
        <View style={styles.contentContainer}>
          {activeTab === "profile" && renderProfileSection()}
          {activeTab === "project" && (
            <ModernProjectContent navigation={navigation} />
          )}
          {activeTab === "projects" && (
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
        </View>

        {/* Modern Bottom Navigation */}
        <ModernBottomNav activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Modern Sidebar */}
        <ModernSidebar
          visible={showSidebar}
          onClose={() => setShowSidebar(false)}
          userData={studentData}
          chatUnreadCount={chatUnreadCount}
          onNavigate={handleNavigateFromSidebar}
        />

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
                {notifications.length === 0 ? (
                  <View style={styles.emptyNotifications}>
                    <Ionicons
                      name="notifications-off-outline"
                      size={60}
                      color="#DFE6E9"
                    />
                    <Text style={styles.emptyNotificationsText}>
                      No notifications yet
                    </Text>
                  </View>
                ) : (
                  notifications.map((notification) => (
                    <TouchableOpacity
                      key={notification.id}
                      style={[
                        styles.notificationItem,
                        !notification.read && styles.unreadNotification,
                      ]}
                      onPress={() => handleNotificationTap(notification)}
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
                        <Text style={styles.notificationMessage} numberOfLines={2}>
                          {notification.message}
                        </Text>
                        <Text style={styles.notificationTime}>
                          {notification.time}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.deleteNotificationButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDeleteNotification(notification.id, notification.read);
                        }}
                      >
                        <Ionicons name="close-circle" size={20} color="#FF7675" />
                      </TouchableOpacity>
                      {!notification.read && <View style={styles.unreadDot} />}
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Notification Details Modal */}
        <Modal
          visible={showNotificationDetails}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowNotificationDetails(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { maxHeight: "70%" }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Notification Details</Text>
                <TouchableOpacity onPress={() => setShowNotificationDetails(false)}>
                  <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.notificationDetailsContent} showsVerticalScrollIndicator={false}>
                {selectedNotification && (
                  <>
                    <View style={styles.notificationDetailsHeader}>
                      <View
                        style={[
                          styles.notificationDetailsIcon,
                          { backgroundColor: selectedNotification.iconColor || "#74B9FF" }
                        ]}
                      >
                        <Ionicons
                          name={selectedNotification.icon}
                          size={32}
                          color="#fff"
                        />
                      </View>
                      <Text style={styles.notificationDetailsTitle}>
                        {selectedNotification.title}
                      </Text>
                    </View>
                    <View style={styles.notificationDetailsBody}>
                      <Text style={styles.notificationDetailsMessage}>
                        {selectedNotification.message}
                      </Text>
                      <Text style={styles.notificationDetailsTime}>
                        {selectedNotification.time}
                      </Text>
                    </View>
                  </>
                )}
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
    backgroundColor: "#f5f7fa",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 10 : 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
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
  avatarWrapper: {
    position: "relative",
    marginRight: 14,
  },
  headerPhoto: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  onlineStatusDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10b981",
    borderWidth: 2,
    borderColor: Colors.mainColor,
  },
  headerGreeting: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 2,
  },
  headerName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    padding: 4,
  },
  iconButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.mainColor,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  contentContainer: {
    flex: 1,
    paddingBottom: Platform.OS === "ios" ? 95 : 85,
  },
  tabContent: {
    flex: 1,
  },
  // Single Profile Card Styles
  singleProfileCard: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 28,
    margin: 20,
    marginBottom: 40,
    shadowColor: "#1b2e4f",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    position: "relative",
  },
  profileEditButton: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f4ff",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  profileHeaderSection: {
    alignItems: "center",
    marginBottom: 8,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 18,
  },
  profileImageLarge: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 5,
    borderColor: Colors.mainColor,
  },
  statusIndicator: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#10b981",
    borderWidth: 4,
    borderColor: "#fff",
  },
  profileNameLarge: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1e293b",
    marginTop: 8,
    letterSpacing: 0.3,
    textAlign: "center",
  },
  profileMajor: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 4,
    textAlign: "center",
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 24,
  },
  infoSection: {
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginLeft: 10,
    letterSpacing: 0.2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    paddingLeft: 8,
  },
  infoTextContainer: {
    marginLeft: 14,
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: "#94a3b8",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: "#334155",
    fontWeight: "500",
  },
  projectTitle: {
    fontSize: 16,
    color: "#334155",
    lineHeight: 24,
    fontWeight: "500",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillChip: {
    backgroundColor: "#f0f4ff",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  skillText: {
    fontSize: 14,
    color: Colors.mainColor,
    fontWeight: "600",
  },
  bioText: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 24,
  },
  cvButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f0f4ff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  cvButtonText: {
    fontSize: 15,
    color: Colors.mainColor,
    fontWeight: "600",
    marginLeft: 8,
  },
  cvButtonTextDisabled: {
    color: "#94a3b8",
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
    marginRight: 12,
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
  deleteNotificationButton: {
    padding: 5,
    marginLeft: 8,
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
  emptyNotifications: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyNotificationsText: {
    fontSize: 16,
    color: "#636E72",
    marginTop: 15,
  },
  notificationDetailsContent: {
    padding: 20,
  },
  notificationDetailsHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  notificationDetailsIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  notificationDetailsTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  notificationDetailsBody: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
  },
  notificationDetailsMessage: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
    marginBottom: 16,
  },
  notificationDetailsTime: {
    fontSize: 13,
    color: "#999",
    textAlign: "right",
  },
});

export default Student;
