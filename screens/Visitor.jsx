import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../constants/constants";
import OtherProjectsScreen from "./OtherProjectsScreen";
import CompaniesScreen from "./CompaniesScreen";
import MapScreen from "./MapScreen";
import ModernBottomNav from "../components/visitor/ModernBottomNav";
import ModernSidebar from "../components/visitor/ModernSidebar";

const Visitor = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("projects");
  const [showSidebar, setShowSidebar] = useState(false);

  const handleNavigate = (route) => {
    if (route === "map") {
      setActiveTab("map");
    } else {
      navigation.navigate(route);
    }
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
                <Text style={styles.headerName}>Visitor</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setShowSidebar(true)}
            >
              <Ionicons name="menu" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Content Area with Bottom Padding for Navigation */}
        <View style={styles.contentWrapper}>
          {activeTab === "projects" && (
            <OtherProjectsScreen navigation={navigation} />
          )}
          {activeTab === "companies" && (
            <CompaniesScreen navigation={navigation} />
          )}
          {activeTab === "map" && <MapScreen studentProject="Visitor" />}
        </View>

        {/* Modern Bottom Navigation */}
        <ModernBottomNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Modern Sidebar */}
        <ModernSidebar
          visible={showSidebar}
          onClose={() => setShowSidebar(false)}
          chatUnreadCount={0}
          onNavigate={handleNavigate}
        />
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
  },
  contentWrapper: {
    flex: 1,
    paddingBottom: 90,
  },
});

export default Visitor;
