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
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../constants/constants";
import * as ImagePicker from "expo-image-picker";
import ExploreScreen from "./ExploreScreen";
import MapScreenNew from "./MapScreenNew";
import ReelsScreen from "./ReelsScreen";
import ModernOfferingContent from "../components/company/ModernOfferingContent";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearAuthData } from "../utils/auth";
import { getCompanyData, postCompanyData } from "../apis/company/Company";
import { uploadCompanyFile } from "../apis/company/CompanyFiles";
import { getCompanyStatus } from "../apis/company/Offering";
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
  getIconColorForType,
} from "../utils/notificationService";
import ModernBottomNav from "../components/company/ModernBottomNav";
import ModernSidebar from "../components/company/ModernSidebar";

const Company = ({ navigation }) => {
  // States
  const [activeTab, setActiveTab] = useState("explore");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showNotificationDetails, setShowNotificationDetails] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [companyStatus, setCompanyStatus] = useState("pending");
  const [rejectionReason, setRejectionReason] = useState("");

  // Company data
  const [companyData, setCompanyData] = useState({
    company_name: "",
    profile_image: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    website_url: "",
  });

  // Initialize notifications
  useEffect(() => {
    let unsubscribe = null;
    
    const initializeNotifications = async () => {
      try {
        // Get userId from AsyncStorage
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          console.log("No userId found, skipping notification setup");
          return;
        }

        // Load saved notifications (user-specific)
        const savedNotifications = await loadNotifications(userId);
        
        // Remove duplicates based on notification ID
        const uniqueNotifications = Array.from(
          new Map(savedNotifications.map(n => [n.id, n])).values()
        );
        
        setNotifications(uniqueNotifications);
        setUnreadCount(uniqueNotifications.filter((n) => !n.read).length);
        
        // Save deduplicated notifications back to AsyncStorage
        if (uniqueNotifications.length !== savedNotifications.length) {
          await saveNotifications(uniqueNotifications, userId);
        }

        // Subscribe to Firestore notifications for this user
        unsubscribe = await subscribeToTopic(
          "company",
          userId,
          async (newNotifications) => {
            // New notifications received from Firestore (array)
            const current = await loadNotifications(userId);
            
            // Filter out notifications that already exist
            const uniqueNew = newNotifications.filter(
              notification => !current.some(n => n.id === notification.id)
            );
            
            if (uniqueNew.length === 0) {
              return; // All notifications already exist
            }
            
            const updatedNotifications = [...uniqueNew, ...current];
            setNotifications(updatedNotifications);
            setUnreadCount((prev) => prev + uniqueNew.length);
            await saveNotifications(updatedNotifications, userId);
          }
        );
      } catch (error) {
        console.error("Error initializing notifications:", error);
      }
    };

    initializeNotifications();
    
    // Return cleanup function
    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  // Fetch company status
  useEffect(() => {
    const fetchCompanyStatus = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return;

        const result = await getCompanyStatus(userId);
        if (result.success) {
          setCompanyStatus(result.status || "pending");
          setRejectionReason(result.rejection_reason || "");
        }
      } catch (error) {
        console.error("Error fetching company status:", error);
      }
    };

    fetchCompanyStatus();
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
      quality: 0.5,
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
        const uploadResult = await uploadCompanyFile(userId, {
          profile_image: selectedImage,
        });

        if (uploadResult.success) {
          // Update state with S3 URL
          setCompanyData((prev) => ({
            ...prev,
            profile_image: uploadResult.data.profile_image_url,
            profile_image_url: uploadResult.data.profile_image_url,
            profile_image_name: uploadResult.data.profile_image,
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
                  companyData.profile_image ||
                  companyData.profile_image_url ||
                  "https://via.placeholder.com/150",
              }}
              style={styles.profileImageLarge}
            />
            <View style={styles.statusIndicator} />
          </View>
          <Text style={styles.profileNameLarge}>
            {companyData.company_name || "Company Name"}
          </Text>
        </View>

        {/* Elegant Divider */}
        <View style={styles.sectionDivider} />

        {/* Contact Information Section */}
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="call-outline" size={22} color={Colors.mainColor} />
            <Text style={styles.sectionTitle}>Contact Information</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail" size={18} color="#64748b" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>
                {companyData.email || "Not set"}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call" size={18} color="#64748b" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>
                {companyData.phone || "Not set"}
              </Text>
            </View>
          </View>
        </View>

        {/* Elegant Divider */}
        <View style={styles.sectionDivider} />

        {/* Address Section */}
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location-outline" size={22} color={Colors.mainColor} />
            <Text style={styles.sectionTitle}>Address</Text>
          </View>
          <Text style={styles.addressText}>
            {companyData.address || "Not set"}
          </Text>
        </View>

        {/* Elegant Divider */}
        <View style={styles.sectionDivider} />

        {/* About Section */}
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={22} color={Colors.mainColor} />
            <Text style={styles.sectionTitle}>About Company</Text>
          </View>
          <Text style={styles.bioText}>
            {companyData.description || "No description available"}
          </Text>
        </View>

        {/* Elegant Divider */}
        <View style={styles.sectionDivider} />

        {/* Website Section */}
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="globe-outline" size={22} color={Colors.mainColor} />
            <Text style={styles.sectionTitle}>Website</Text>
          </View>
          <Text style={[styles.infoValue, styles.linkText]}>
            {companyData.website_url || "Not set"}
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  // Company data handlers
  const handleFetchCompanyData = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");

      if (!userId) {
        Alert.alert("Error", "User ID not found. Please login again.");
        return;
      }

      const result = await getCompanyData(userId);

      // Handle unauthorized (401) error
      if (result.unauthorized) {
        Alert.alert("Session Expired", "Please login again.");
        return;
      }

      if (result.success && result.data) {
        const fetchedData = result.data;
        setCompanyData({
          company_name: fetchedData.company_name || "",
          email: fetchedData.email || "",
          phone: fetchedData.phone || "",
          address: fetchedData.address || "",
          description: fetchedData.description || "",
          website_url: fetchedData.website_url || "",
          profile_image:
            fetchedData.profile_image_url || fetchedData.profile_image || "",
          profile_image_url: fetchedData.profile_image_url || "",
          profile_image_name: fetchedData.profile_image || "",
        });

        // Sync updated profile to Firestore for chat system
        try {
          const userType = await AsyncStorage.getItem("userType");
          await createOrUpdateUser(userId, {
            name: fetchedData.company_name || "Company",
            email: fetchedData.email || "",
            type: userType || "company",
            photoUrl: fetchedData.profile_image_url || null,
          });
          // Update userName in AsyncStorage for chat messages
          if (fetchedData.company_name) {
            await AsyncStorage.setItem("userName", fetchedData.company_name);
          }
        } catch (syncError) {
          console.log("Firestore sync warning:", syncError);
        }
      } else {
        Alert.alert("Error", result.message || "Failed to load company data");
      }
    } catch (error) {
      console.error("Error fetching company data:", error);
      Alert.alert("Error", "An error occurred while loading your profile");
    }
  };

  const handleUpdateCompanyData = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");

      console.log("Updating company data:", companyData);
      const result = await postCompanyData(userId, companyData);
      console.log("Update result:", result);

      if (result.success) {
        setCompanyData((prev) => ({
          ...prev,
          ...result.data,
          website_url: result.data.website_url || prev.website_url,
        }));

        // Sync updated profile to Firestore for chat system
        try {
          const userType = await AsyncStorage.getItem("userType");
          await createOrUpdateUser(userId, {
            name:
              result.data.company_name || companyData.company_name || "Company",
            email: result.data.email || companyData.email || "",
            type: userType || "company",
            photoUrl:
              result.data.profile_image_url ||
              companyData.profile_image_url ||
              null,
          });
          // Update userName in AsyncStorage for chat messages
          if (result.data.company_name || companyData.company_name) {
            await AsyncStorage.setItem(
              "userName",
              result.data.company_name || companyData.company_name
            );
          }
        } catch (syncError) {
          console.log("Firestore sync warning:", syncError);
        }

        return true;
      } else {
        Alert.alert("Error", "Update failed: " + result.message);
        return false;
      }
    } catch (error) {
      Alert.alert("Error", "Error updating company data: " + error.message);
      return false;
    }
  };

  // useEffects
  useEffect(() => {
    handleFetchCompanyData();
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

  const handleNavigateFromSidebar = (route) => {
    if (route === "map") {
      setActiveTab("map");
    } else if (route === "ReelsScreen") {
      navigation.navigate("ReelsScreen", { userRole: "company" });
    } else {
      navigation.navigate(route);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await clearAuthData();
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          }
        }
      ]
    );
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

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
                      companyData.profile_image ||
                      companyData.profile_image_url ||
                      "https://via.placeholder.com/150",
                  }}
                  style={styles.headerPhoto}
                />
                <View style={styles.onlineStatusDot} />
              </View>
              <View>
                <Text style={styles.headerGreeting}>Welcome back 👋</Text>
                <Text style={styles.headerName}>
                  {companyData.company_name
                    ? companyData.company_name.split(" ")[0]
                    : "Company"}
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
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <View style={styles.iconButtonInner}>
                  <Ionicons name="log-out-outline" size={24} color="#fff" />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setShowSidebar(true)}
                activeOpacity={0.7}
              >
                <View style={styles.iconButtonInner}>
                  <Ionicons name="menu" size={24} color="#fff" />
                  {chatUnreadCount > 0 && (
                    <View style={styles.headerBadge}>
                      <Text style={styles.headerBadgeText}>
                        {chatUnreadCount > 99 ? "99+" : chatUnreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Content Area - Fixed between header and bottom nav */}
        <View style={styles.contentContainer}>
          {activeTab === "profile" && renderProfileSection()}
          {activeTab === "offering" && (
            <>
              {companyStatus !== "approved" && (
                <View
                  style={[
                    styles.statusBanner,
                    companyStatus === "rejected"
                      ? styles.rejectedBanner
                      : styles.pendingBanner,
                  ]}
                >
                  <Ionicons
                    name={
                      companyStatus === "rejected"
                        ? "close-circle"
                        : "time"
                    }
                    size={24}
                    color="#fff"
                  />
                  <View style={styles.statusBannerTextContainer}>
                    <Text style={styles.statusBannerTitle}>
                      {companyStatus === "rejected"
                        ? "Company Rejected"
                        : "Awaiting Approval"}
                    </Text>
                    <Text style={styles.statusBannerText}>
                      {companyStatus === "rejected"
                        ? rejectionReason ||
                          "Your company registration was rejected. Please contact admin for more information."
                        : "Your company registration is pending admin approval. You can create offerings once approved."}
                    </Text>
                  </View>
                </View>
              )}
              <ModernOfferingContent
                navigation={navigation}
                companyStatus={companyStatus}
              />
            </>
          )}
          {activeTab === "explore" && (
            <ExploreScreen navigation={navigation} />
          )}
          {activeTab === "reels" && (
            <ReelsScreen navigation={navigation} route={{ params: { userRole: "company", fromNavBar: true } }} />
          )}
          {activeTab === "map" && (
            <MapScreenNew
              navigation={navigation}
              userRole="company"
              userId={companyData.id || companyData.company_id}
            />
          )}
        </View>

        {/* Modern Bottom Navigation */}
        <ModernBottomNav activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Modern Sidebar */}
        <ModernSidebar
          visible={showSidebar}
          onClose={() => setShowSidebar(false)}
          userData={companyData}
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
                      size={64}
                      color="#ccc"
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
                        companyData.profile_image ||
                        companyData.profile_image_url ||
                        "https://via.placeholder.com/150",
                    }}
                    style={styles.editPhoto}
                  />
                  <View style={styles.editPhotoButton}>
                    <Ionicons name="camera" size={20} color="#fff" />
                  </View>
                </TouchableOpacity>

                <Text style={styles.inputLabel}>Company Name</Text>
                <TextInput
                  style={styles.input}
                  value={companyData.company_name}
                  onChangeText={(text) =>
                    setCompanyData((prev) => ({ ...prev, company_name: text }))
                  }
                  placeholder="Enter company name"
                />

                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput
                  style={styles.input}
                  value={companyData.phone}
                  onChangeText={(text) =>
                    setCompanyData((prev) => ({ ...prev, phone: text }))
                  }
                  keyboardType="phone-pad"
                  placeholder="Enter phone number"
                />

                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={companyData.address}
                  onChangeText={(text) =>
                    setCompanyData((prev) => ({ ...prev, address: text }))
                  }
                  multiline
                  numberOfLines={3}
                  placeholder="Enter company address"
                />

                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={companyData.description}
                  onChangeText={(text) =>
                    setCompanyData((prev) => ({ ...prev, description: text }))
                  }
                  multiline
                  numberOfLines={4}
                  placeholder="Enter company description"
                />

                <Text style={styles.inputLabel}>Website URL</Text>
                <TextInput
                  style={styles.input}
                  value={companyData.website_url}
                  onChangeText={(text) =>
                    setCompanyData((prev) => ({ ...prev, website_url: text }))
                  }
                  keyboardType="url"
                  autoCapitalize="none"
                  placeholder="https://www.example.com"
                />

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={async () => {
                    const success = await handleUpdateCompanyData();
                    if (success) {
                      await handleFetchCompanyData();
                      setShowEditProfile(false);
                      Alert.alert("Success", "Profile updated successfully!");
                    }
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
    // borderBottomLeftRadius: 30,
    // borderBottomRightRadius: 30,
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
  headerBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: Colors.mainColor,
  },
  headerBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
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
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: "600",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    color: "#475569",
    fontWeight: "500",
  },
  addressText: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 24,
    fontWeight: "500",
    paddingLeft: 8,
  },
  bioText: {
    fontSize: 15,
    color: "#475569",
    lineHeight: 26,
    paddingLeft: 8,
  },
  linkText: {
    color: Colors.mainColor,
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  comingSoonContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 20,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    maxHeight: "85%",
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1e293b",
    letterSpacing: 0.3,
  },
  notificationItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
    alignItems: "flex-start",
  },
  unreadNotification: {
    backgroundColor: "#f0f9ff",
  },
  notificationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 5,
  },
  notificationMessage: {
    fontSize: 13,
    color: "#64748b",
    lineHeight: 19,
    marginBottom: 5,
  },
  notificationTime: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3b82f6",
    marginTop: 6,
  },
  deleteNotificationButton: {
    padding: 6,
    marginLeft: 10,
  },
  editPhotoContainer: {
    alignSelf: "center",
    marginVertical: 24,
    position: "relative",
  },
  editPhoto: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: Colors.mainColor,
  },
  editPhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.mainColor,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: Colors.mainColor,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    marginTop: 16,
    marginBottom: 10,
    paddingHorizontal: 20,
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: "#1e293b",
    marginHorizontal: 20,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    fontWeight: "500",
  },
  textArea: {
    height: 110,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: Colors.mainColor,
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 20,
    marginTop: 28,
    alignItems: "center",
    shadowColor: Colors.mainColor,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  emptyNotifications: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 70,
  },
  emptyNotificationsText: {
    fontSize: 16,
    color: "#94a3b8",
    marginTop: 18,
    fontWeight: "500",
  },
  notificationDetailsContent: {
    padding: 24,
  },
  notificationDetailsHeader: {
    alignItems: "center",
    marginBottom: 28,
  },
  notificationDetailsIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  notificationDetailsTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1e293b",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  notificationDetailsBody: {
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    padding: 20,
  },
  notificationDetailsMessage: {
    fontSize: 16,
    color: "#475569",
    lineHeight: 26,
    marginBottom: 18,
  },
  notificationDetailsTime: {
    fontSize: 13,
    color: "#94a3b8",
    textAlign: "right",
    fontWeight: "600",
  },
  statusBanner: {
    flexDirection: "row",
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    alignItems: "flex-start",
    gap: 12,
  },
  pendingBanner: {
    backgroundColor: "#FF9800",
  },
  rejectedBanner: {
    backgroundColor: "#EF4444",
  },
  statusBannerTextContainer: {
    flex: 1,
  },
  statusBannerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  statusBannerText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.95,
  },
});

export default Company;
