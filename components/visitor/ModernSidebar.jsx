import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
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
  chatUnreadCount,
  onNavigate,
  isGuest = true,
  visitorData = { name: "Visitor", email: "" },
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
            style={StyleSheet.absoluteFillObject}
            activeOpacity={1}
            onPress={onClose}
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
          {/* Header */}
          <LinearGradient
            colors={[Colors.mainColor, "#2d4a7c"]}
            style={styles.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>

            <View style={styles.profileSection}>
              <View style={styles.guestIconContainer}>
                <Ionicons name="eye-outline" size={50} color={Colors.mainColor} />
              </View>
              <Text style={styles.profileName}>
                {isGuest ? "Visitor" : visitorData.name}
              </Text>
              <Text style={styles.profileEmail}>
                {isGuest ? "Guest User" : visitorData.email}
              </Text>
            </View>
          </LinearGradient>

          {/* Menu Items */}
          <ScrollView
            style={styles.menuContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.menuContent}
          >
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => handleMenuPress(item.route)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={item.gradient}
                  style={styles.menuIconContainer}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name={item.icon} size={24} color="#fff" />
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

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color="#94a3b8"
                />
              </TouchableOpacity>
            ))}

            {/* Info Section - Only show for guests */}
            {isGuest && (
              <View style={styles.infoSection}>
                <View style={styles.infoCard}>
                  <Ionicons name="information-circle" size={24} color={Colors.mainColor} />
                  <Text style={styles.infoText}>
                    You're browsing as a guest. Some features may be limited.
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Version 1.0.0</Text>
            <Text style={styles.footerVersion}>TEDI-Najah Expo</Text>
          </View>
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
    width: width * 0.85,
    backgroundColor: "#f8fafc",
    shadowColor: "#000",
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  closeButton: {
    alignSelf: "flex-end",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  profileSection: {
    alignItems: "center",
  },
  guestIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  menuContainer: {
    flex: 1,
  },
  menuContent: {
    padding: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#1e293b",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
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
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    marginRight: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  infoSection: {
    marginTop: 20,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  footerText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    textAlign: "center",
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
  },
});

export default ModernSidebar;
