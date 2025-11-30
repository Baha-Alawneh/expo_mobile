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
import OtherProjectsScreen from "./OtherProjectsScreen";
import CompaniesScreen from "./CompaniesScreen";
import MapScreen from "./MapScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCompanyData, postCompanyData } from "../apis/company/Company";
import { uploadCompanyFile } from "../apis/company/CompanyFiles";
import { BASE_URL } from "../constants/config";
import {
  subscribeToUnreadCount,
  createOrUpdateUser,
} from "../utils/chatService";

const Company = ({ navigation }) => {
  // States
  const [activeTab, setActiveTab] = useState("profile");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  // Company data
  const [companyData, setCompanyData] = useState({
    company_name: "",
    profile_image: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    website_url: "",
    category: "",
  });

  // Mock notifications
  const notifications = [
    {
      id: 1,
      type: "approval",
      title: "Booth Confirmed!",
      message: "Your booth reservation has been approved for the exhibition.",
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
        "A student is interested in your offering and sent you a message.",
      time: "5 hours ago",
      read: false,
      icon: "mail",
      iconColor: Colors.mainColor,
    },
    {
      id: 3,
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
      <View style={styles.profileHeader}>
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

      {/* Contact Information Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="call-outline" size={24} color={Colors.mainColor} />
          <Text style={styles.cardTitle}>Contact Information</Text>
        </View>
        <View style={styles.contactRow}>
          <Ionicons name="mail" size={18} color={Colors.mainColor} />
          <Text style={styles.contactText}>
            {companyData.email || "Not set"}
          </Text>
        </View>
        <View style={styles.contactRow}>
          <Ionicons name="call" size={18} color={Colors.mainColor} />
          <Text style={styles.contactText}>
            {companyData.phone || "Not set"}
          </Text>
        </View>
      </View>

      {/* Address Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons
            name="location-outline"
            size={24}
            color={Colors.mainColor}
          />
          <Text style={styles.cardTitle}>Address</Text>
        </View>
        <Text style={styles.addressText}>
          {companyData.address || "Not set"}
        </Text>
      </View>

      {/* Description Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons
            name="document-text-outline"
            size={24}
            color={Colors.mainColor}
          />
          <Text style={styles.cardTitle}>About Company</Text>
        </View>
        <Text style={styles.bioText}>
          {companyData.description || "No description"}
        </Text>
      </View>

      {/* Category Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons
            name="pricetag-outline"
            size={24}
            color={Colors.mainColor}
          />
          <Text style={styles.cardTitle}>Category</Text>
        </View>
        <Text style={styles.addressText}>
          {companyData.category || "Not set"}
        </Text>
      </View>

      {/* Website Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="globe-outline" size={24} color={Colors.mainColor} />
          <Text style={styles.cardTitle}>Website</Text>
        </View>
        <Text style={[styles.addressText, styles.linkText]}>
          {companyData.website_url || "Not set"}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => setShowEditProfile(true)}
      >
        <Ionicons name="create-outline" size={20} color="#fff" />
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
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
          category: fetchedData.category || "",
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
          category: result.data.category || prev.category,
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
                    companyData.profile_image ||
                    companyData.profile_image_url ||
                    "https://via.placeholder.com/150",
                }}
                style={styles.headerPhoto}
              />
              <View>
                <Text style={styles.headerGreeting}>Welcome back,</Text>
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
                name={activeTab === "profile" ? "business" : "business-outline"}
                size={20}
                color={activeTab === "profile" ? "#fff" : Colors.mainColor}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "profile" && styles.activeTabText,
                ]}
              >
                Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tab}
              onPress={() => navigation.navigate("MyOffering")}
            >
              <Ionicons
                name="pricetag-outline"
                size={20}
                color={Colors.mainColor}
              />
              <Text style={styles.tabText}>My Offering</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "projects" && styles.activeTab]}
              onPress={() => setActiveTab("projects")}
            >
              <Ionicons
                name={
                  activeTab === "projects" ? "briefcase" : "briefcase-outline"
                }
                size={20}
                color={activeTab === "projects" ? "#fff" : Colors.mainColor}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "projects" && styles.activeTabText,
                ]}
              >
                Projects
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
                name={activeTab === "companies" ? "people" : "people-outline"}
                size={20}
                color={activeTab === "companies" ? "#fff" : Colors.mainColor}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "companies" && styles.activeTabText,
                ]}
              >
                Other Companies
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
                ]}
              >
                Map
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Content */}
        {activeTab === "profile" && renderProfileSection()}
        {activeTab === "projects" && (
          <OtherProjectsScreen navigation={navigation} />
        )}
        {activeTab === "companies" && (
          <CompaniesScreen navigation={navigation} />
        )}
        {activeTab === "map" && (
          <MapScreen
            studentProject={companyData.company_name || "No Company Name"}
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

                <Text style={styles.inputLabel}>Category</Text>
                <TextInput
                  style={styles.input}
                  value={companyData.category}
                  onChangeText={(text) =>
                    setCompanyData((prev) => ({ ...prev, category: text }))
                  }
                  placeholder="Enter company category"
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
  headerActions: {
    flexDirection: "row",
  },
  iconButton: {
    position: "relative",
    padding: 5,
  },
  notificationButton: {
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
    marginTop: 10,
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
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  contactText: {
    fontSize: 15,
    color: "#666",
    flex: 1,
  },
  addressText: {
    fontSize: 15,
    color: "#666",
    lineHeight: 22,
  },
  bioText: {
    fontSize: 15,
    color: "#555",
    lineHeight: 24,
  },
  linkText: {
    color: Colors.mainColor,
    textDecorationLine: "underline",
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
});

export default Company;
