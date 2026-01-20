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
  const exploreAnim = useRef(new Animated.Value(activeTab === "explore" ? 1 : 0)).current;
  const reelsAnim = useRef(new Animated.Value(activeTab === "reels" ? 1 : 0)).current;
  const profileAnim = useRef(new Animated.Value(activeTab === "profile" ? 1 : 0)).current;
  const offeringAnim = useRef(new Animated.Value(activeTab === "offering" ? 1 : 0)).current;
  const projectsAnim = useRef(new Animated.Value(activeTab === "projects" ? 1 : 0)).current;
  const companiesAnim = useRef(new Animated.Value(activeTab === "companies" ? 1 : 0)).current;
  const jobsAnim = useRef(new Animated.Value(activeTab === "jobs" ? 1 : 0)).current;
  const mapAnim = useRef(new Animated.Value(activeTab === "map" ? 1 : 0)).current;

  const tabs = [
    {
      key: "explore",
      icon: "compass",
      label: "Explore",
      anim: exploreAnim,
    },
    {
      key: "reels",
      icon: "play-circle",
      label: "Reels",
      anim: reelsAnim,
    },
    {
      key: "profile",
      icon: "person",
      label: "Profile",
      anim: profileAnim,
    },
    {
      key: "offering",
      icon: "pricetag",
      label: "Offering",
      anim: offeringAnim,
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
    {
      key: "jobs",
      icon: "document-text",
      label: "Jobs",
      anim: jobsAnim,
    },
    {
      key: "map",
      icon: "map",
      label: "Map",
      anim: mapAnim,
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
              {/* <View style={styles.notchCutout} /> */}
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
              outputRange: [0, -10],
            });

            const scale = tab.anim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.05],
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

                  {/* Label - shown for all tabs */}
                  <Text style={[styles.tabLabel, isActive && styles.activeLabel]}>
                    {tab.label}
                  </Text>
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
//   notchCutout: {
//     width: 0,
//     height: 0,
//     borderRadius: 40,
//     backgroundColor: "#f5f7fa",
//     borderWidth: 6,
//     borderColor: "#f5f7fa",
//     position: 'absolute',  // لازم يكون موقع مطلق
//     left: 13,              // تحريك 10 بكسل لليمين
//     top: -2,       
//   },
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
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 30,
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
