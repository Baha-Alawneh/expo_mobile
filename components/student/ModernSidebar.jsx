import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/constants";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

const ModernSidebar = ({
  visible,
  onClose,
  userData,
  chatUnreadCount,
  onNavigate,
}) => {
  const slideAnim = useRef(new Animated.Value(width)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          friction: 9,
          tension: 50,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: width,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const menuItems = [
    {
      icon: "chatbubble-ellipses",
      label: "AI Chatbot",
      route: "ChatbotScreen",
      color: "#6366f1",
      gradient: ["#6366f1", "#8b5cf6"],
    },
    {
      icon: "chatbubbles",
      label: "Messages",
      route: "ChatListScreen",
      color: "#3b82f6",
      gradient: ["#3b82f6", "#06b6d4"],
      badge: chatUnreadCount,
    },
  ];

  const handleMenuPress = (route) => {
    onClose();
    setTimeout(() => {
      onNavigate(route);
    }, 300);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalContainer}>
        {/* Overlay */}
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: overlayAnim,
            },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            activeOpacity={1}
          />
        </Animated.View>

        {/* Sidebar */}
        <Animated.View
          style={[
            styles.sidebar,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* Header with Gradient */}
          <LinearGradient
            colors={[Colors.mainColor, "#2d4a73"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sidebarHeader}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>

            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <Image
                  source={{
                    uri:
                      userData?.photo ||
                      userData?.photo_url ||
                      "https://via.placeholder.com/150",
                  }}
                  style={styles.avatar}
                />
                <View style={styles.onlineIndicator} />
              </View>
              <Text style={styles.userName} numberOfLines={1}>
                {userData?.name || "Student Name"}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {userData?.email || "email@example.com"}
              </Text>
            </View>
          </LinearGradient>

          {/* Menu Items */}
          <ScrollView
            style={styles.menuContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>Quick Access</Text>

              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={item.route}
                  style={styles.menuItem}
                  onPress={() => handleMenuPress(item.route)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemContent}>
                    <LinearGradient
                      colors={item.gradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.iconContainer}
                    >
                      <Ionicons name={item.icon} size={22} color="#fff" />
                    </LinearGradient>

                    <View style={styles.menuTextContainer}>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                    </View>

                    {item.badge > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {item.badge > 99 ? "99+" : item.badge}
                        </Text>
                      </View>
                    )}

                    <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Additional Info */}
            <View style={styles.footerSection}>
              <View style={styles.divider} />
              <Text style={styles.footerText}>Version 1.0.0</Text>
              <Text style={styles.footerSubText}>TEDI-Najah Expo</Text>
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sidebar: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: width * 0.8,
    maxWidth: 340,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: -5,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 20,
  },
  sidebarHeader: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 30,
    paddingHorizontal: 24,
  },
  closeButton: {
    alignSelf: "flex-end",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  profileSection: {
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#10b981",
    borderWidth: 3,
    borderColor: "#fff",
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  menuContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  menuSection: {
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItem: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: "#1b2e4f",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  badge: {
    backgroundColor: "#ef4444",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
    marginRight: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  footerSection: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  divider: {
    width: "60%",
    height: 1,
    backgroundColor: "#e2e8f0",
    marginBottom: 20,
  },
  footerText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 4,
  },
  footerSubText: {
    fontSize: 12,
    color: "#94a3b8",
  },
});

export default ModernSidebar;
