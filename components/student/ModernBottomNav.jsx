import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/constants";

const ModernBottomNav = ({ activeTab, onTabChange }) => {
  // Animation values for each tab
  const profileAnim = useRef(new Animated.Value(activeTab === "profile" ? 1 : 0)).current;
  const projectAnim = useRef(new Animated.Value(activeTab === "project" ? 1 : 0)).current;
  const projectsAnim = useRef(new Animated.Value(activeTab === "projects" ? 1 : 0)).current;
  const companiesAnim = useRef(new Animated.Value(activeTab === "companies" ? 1 : 0)).current;

  const tabs = [
    {
      key: "profile",
      icon: "person",
      label: "Profile",
      anim: profileAnim,
    },
    {
      key: "project",
      icon: "folder",
      label: "My Project",
      anim: projectAnim,
    },
    {
      key: "projects",
      icon: "briefcase",
      label: "Projects",
      anim: projectsAnim,
    },
    {
      key: "companies",
      icon: "business",
      label: "Companies",
      anim: companiesAnim,
    },
  ];

  useEffect(() => {
    tabs.forEach((tab) => {
      Animated.spring(tab.anim, {
        toValue: activeTab === tab.key ? 1 : 0,
        useNativeDriver: true,
        friction: 8,
        tension: 100,
      }).start();
    });
  }, [activeTab]);

  const handleTabPress = (tabKey) => {
    onTabChange(tabKey);
  };

  return (
    <View style={styles.container}>
      <View style={styles.navWrapper}>
        {/* Background bar */}
        <View style={styles.navBackground} />
        
        {/* Curved notch background - positioned absolutely */}
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.key;
          if (!isActive) return null;
          
          return (
            <Animated.View
              key={`notch-${tab.key}`}
              style={[
                styles.curvedNotch,
                {
                  left: `${(100 / tabs.length) * index + (100 / tabs.length / 2)}%`,
                  opacity: tab.anim,
                  transform: [
                    {
                      translateX: -40,
                    },
                    {
                      scale: tab.anim,
                    },
                  ],
                },
              ]}
            >
              <View style={styles.notchCutout} />
            </Animated.View>
          );
        })}

        {/* Tab buttons */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;

            // Animated styles
            const translateY = tab.anim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -22],
            });

            const scale = tab.anim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.1],
            });

            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabButton}
                onPress={() => handleTabPress(tab.key)}
                activeOpacity={0.7}
              >
                <Animated.View
                  style={[
                    styles.tabContent,
                    {
                      transform: [{ translateY }],
                    },
                  ]}
                >
                  {/* Floating circle for active tab */}
                  {isActive && (
                    <Animated.View
                      style={[
                        styles.activeCircle,
                        {
                          opacity: tab.anim,
                          transform: [{ scale }],
                        },
                      ]}
                    >
                      <Ionicons name={tab.icon} size={28} color="#fff" />
                    </Animated.View>
                  )}

                  {/* Regular icon for inactive tabs */}
                  {!isActive && (
                    <View style={styles.inactiveIconWrapper}>
                      <Ionicons
                        name={`${tab.icon}-outline`}
                        size={24}
                        color="#64748b"
                      />
                    </View>
                  )}

                  {/* Label - only for inactive */}
                  {!isActive && (
                    <Text style={styles.tabLabel}>{tab.label}</Text>
                  )}
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    pointerEvents: "box-none",
  },
  navWrapper: {
    marginHorizontal: 20,
    marginBottom: Platform.OS === "ios" ? 20 : 10,
    height: 70,
    position: "relative",
  },
  navBackground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    shadowColor: "#1b2e4f",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  curvedNotch: {
    position: "absolute",
    top: -8,
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  notchCutout: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f5f7fa",
    borderWidth: 6,
    borderColor: "#FFFFFF",
  },
  tabsContainer: {
    flexDirection: "row",
    height: "100%",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  activeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.mainColor,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.mainColor,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  inactiveIconWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.3,
    fontWeight: "600",
    color: "#64748b",
  },
});

export default ModernBottomNav;
