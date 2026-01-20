import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Platform,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../constants/constants";
import { clearAuthData } from "../utils/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  subscribeToTopic,
  loadNotifications,
  saveNotifications,
  markNotificationAsRead,
  deleteNotification,
} from "../utils/notificationService";
import ExploreScreen from "./ExploreScreen";
import MapScreenNew from "./MapScreenNew";
import ReelsScreen from "./ReelsScreen";
import ModernBottomNav from "../components/visitor/ModernBottomNav";
import ModernSidebar from "../components/visitor/ModernSidebar";

const Visitor = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("explore");
  const [showSidebar, setShowSidebar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showNotificationDetails, setShowNotificationDetails] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isGuest, setIsGuest] = useState(true);
  const [visitorData, setVisitorData] = useState({ name: "Visitor", email: "" });

  // Check if user is guest or authenticated visitor and fetch data
  useEffect(() => {
    const checkGuestStatusAndFetchData = async () => {
      const guestStatus = await AsyncStorage.getItem("isGuest");
      console.log("[Visitor] Guest status:", guestStatus);
      setIsGuest(guestStatus === "true");
      
      // If authenticated visitor, fetch their data
      if (guestStatus !== "true") {
        try {
          const userId = await AsyncStorage.getItem("userId");
          const userName = await AsyncStorage.getItem("userName");
          const userEmail = await AsyncStorage.getItem("userEmail");
          
          console.log("[Visitor] Fetched data - userName:", userName, "userEmail:", userEmail);
          
          if (userName) {
            setVisitorData({
              name: userName,
              email: userEmail || ""
            });
          }
        } catch (error) {
          console.error("Error fetching visitor data:", error);
        }
      }
    };
    checkGuestStatusAndFetchData();
  }, []);

  // Initialize notifications
  useEffect(() => {
    // Skip notification setup for guests
    if (isGuest) return;
    
    let unsubscribe = null;
    
    const initializeNotifications = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          console.log("[Visitor] No userId found, skipping notification setup");
          return;
        }

        // Load saved notifications
        const savedNotifications = await loadNotifications(userId);
        const uniqueNotifications = Array.from(
          new Map(savedNotifications.map(n => [n.id, n])).values()
        );
        
        setNotifications(uniqueNotifications);
        setUnreadCount(uniqueNotifications.filter((n) => !n.read).length);
        
        if (uniqueNotifications.length !== savedNotifications.length) {
          await saveNotifications(uniqueNotifications, userId);
        }

        // Subscribe to Firestore notifications
        unsubscribe = await subscribeToTopic(
          "visitor",
          userId,
          async (newNotifications) => {
            const current = await loadNotifications(userId);
            const uniqueNew = newNotifications.filter(
              notification => !current.some(n => n.id === notification.id)
            );
            
            if (uniqueNew.length === 0) return;
            
            const updatedNotifications = [...uniqueNew, ...current];
            setNotifications(updatedNotifications);
            setUnreadCount((prev) => prev + uniqueNew.length);
            await saveNotifications(updatedNotifications, userId);
          }
        );
      } catch (error) {
        console.error("[Visitor] Error initializing notifications:", error);
      }
    };

    initializeNotifications();
    
    return () => {
      if (unsubscribe && typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [isGuest]);

  // Handle notification tap
  const handleNotificationTap = async (notification) => {
    if (!notification.read) {
      const updated = await markNotificationAsRead(notification.id);
      setNotifications(updated);
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
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

  const handleNavigate = (route) => {
    if (route === "map") {
      setActiveTab("map");
    } else if (route === "ReelsScreen") {
      navigation.navigate("ReelsScreen", { userRole: "visitor" });
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={Colors.mainColor}
        />

        {/* Modern Header with Gradient */}
        <LinearGradient
          colors={[Colors.mainColor, "#2d4a7c"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="eye-outline" size={28} color={Colors.mainColor} />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerGreeting}>Welcome</Text>
                <Text style={styles.headerName}>
                  {isGuest ? "Visitor" : visitorData.name.split(" ")[0] || "Visitor"}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {!isGuest && (
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => setShowNotifications(true)}
                >
                  <Ionicons name="notifications-outline" size={24} color="#fff" />
                  {unreadCount > 0 && (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.badgeText}>
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.menuButton}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={28} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setShowSidebar(true)}
              >
                <Ionicons name="menu" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Content Area with Bottom Padding for Navigation */}
        <View style={styles.contentWrapper}>
          {activeTab === "explore" && (
            <ExploreScreen navigation={navigation} />
          )}
          {activeTab === "reels" && (
            <ReelsScreen navigation={navigation} route={{ params: { userRole: "visitor", fromNavBar: true } }} />
          )}
          {activeTab === "map" && (
            <MapScreenNew
              navigation={navigation}
              userRole="visitor"
            />
          )}
        </View>

        {/* Modern Bottom Navigation */}
        <ModernBottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Modern Sidebar */}
        <ModernSidebar
          visible={showSidebar}
          onClose={() => setShowSidebar(false)}
          chatUnreadCount={0}
          onNavigate={handleNavigate}
          isGuest={isGuest}
          visitorData={visitorData}
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
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTextContainer: {
    marginLeft: 15,
  },
  headerGreeting: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "500",
  },
  headerName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 2,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
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
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.mainColor,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  contentWrapper: {
    flex: 1,
    paddingBottom: 90,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2D3436",
  },
  emptyNotifications: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyNotificationsText: {
    fontSize: 16,
    color: "#B2BEC3",
    marginTop: 15,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    position: "relative",
  },
  unreadNotification: {
    backgroundColor: "#E3F2FD",
  },
  notificationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    color: "#636E72",
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 11,
    color: "#B2BEC3",
  },
  deleteNotificationButton: {
    padding: 4,
  },
  unreadDot: {
    position: "absolute",
    top: 14,
    right: 14,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#0984E3",
  },
  notificationDetailsContent: {
    flex: 1,
  },
  notificationDetailsHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  notificationDetailsIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  notificationDetailsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2D3436",
    textAlign: "center",
  },
  notificationDetailsBody: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 16,
  },
  notificationDetailsMessage: {
    fontSize: 15,
    color: "#2D3436",
    lineHeight: 22,
    marginBottom: 12,
  },
  notificationDetailsTime: {
    fontSize: 13,
    color: "#B2BEC3",
  },
});

export default Visitor;
