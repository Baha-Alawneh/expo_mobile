import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Colors } from "../constants/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearAuthData } from "../utils/auth";
import AdminDashboard from "./AdminDashboard";
import SendNotification from "./SendNotification";
import PendingProjects from "./PendingProjects";
import PendingCompanies from "./PendingCompanies";
import AnalyticsScreen from "./AnalyticsScreen";
import MapScreenNew from "./MapScreenNew";

const Tab = createBottomTabNavigator();

// Custom Header Component for Dashboard
const DashboardHeader = ({ navigation, onNavigateToAnalytics }) => {
  const [adminData, setAdminData] = useState({
    name: "Admin",
  });

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const name = await AsyncStorage.getItem("name");
        setAdminData({
          name: name || "Admin",
        });
      } catch (error) {
        console.error("Error loading admin data:", error);
      }
    };

    loadAdminData();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
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
        },
      },
    ]);
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1b2e4f" />
      <LinearGradient
        colors={["#1b2e4f", "#2d4a73", "#3d5a83"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.modernHeader}
      >
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarWrapper}>
              <View style={styles.adminIconContainer}>
                <Ionicons name="shield-checkmark" size={30} color="#fff" />
              </View>
              <View style={styles.onlineStatusDot} />
            </View>
            <View>
              <Text style={styles.headerGreeting}>Admin Panel</Text>
              <Text style={styles.headerName}>
                {adminData.name ? adminData.name.split(" ")[0] : "Admin"}
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={styles.iconButtonInner}>
                <Ionicons name="log-out-outline" size={24} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </>
  );
};

// Dashboard Stack Component
const DashboardStack = ({ navigation }) => {
  const [showAnalytics, setShowAnalytics] = useState(false);

  const handleNavigateToAnalytics = () => {
    setShowAnalytics(true);
  };

  const handleBackFromAnalytics = () => {
    setShowAnalytics(false);
  };

  const handleTabChange = (tabName) => {
    if (tabName === 'projects') {
      navigation.navigate('Projects');
    } else if (tabName === 'offers') {
      navigation.navigate('Companies');
    } else if (tabName === 'notify') {
      navigation.navigate('Notify');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {!showAnalytics ? (
        <>
          <DashboardHeader 
            navigation={navigation} 
            onNavigateToAnalytics={handleNavigateToAnalytics}
          />
          <View style={{ flex: 1 }}>
            <AdminDashboard 
              navigation={navigation} 
              onNavigateToAnalytics={handleNavigateToAnalytics}
              onTabChange={handleTabChange}
            />
          </View>
        </>
      ) : (
        <View style={{ flex: 1, backgroundColor: "#f5f7fa" }}>
          <View style={styles.analyticsHeader}>
            <TouchableOpacity
              style={styles.analyticsBackButton}
              onPress={handleBackFromAnalytics}
            >
              <Ionicons name="arrow-back" size={24} color="#2D3436" />
            </TouchableOpacity>
            <Text style={styles.analyticsHeaderTitle}>Analytics</Text>
          </View>
          <AnalyticsScreen navigation={navigation} />
        </View>
      )}
    </View>
  );
};

const Admin = ({ navigation }) => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Dashboard") {
            iconName = focused ? "grid" : "grid-outline";
          } else if (route.name === "Projects") {
            iconName = focused ? "folder" : "folder-outline";
          } else if (route.name === "Companies") {
            iconName = focused ? "business" : "business-outline";
          } else if (route.name === "Map") {
            iconName = focused ? "map" : "map-outline";
          } else if (route.name === "Notify") {
            iconName = focused ? "send" : "send-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#6C5CE7",
        tabBarInactiveTintColor: "#636E72",
        tabBarStyle: {
          backgroundColor: "#FFF",
          borderTopWidth: 1,
          borderTopColor: "#E9ECEF",
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarLabel: "Dashboard",
        }}
      />
      <Tab.Screen
        name="Projects"
        component={PendingProjects}
        options={{
          tabBarLabel: "Projects",
        }}
      />
      <Tab.Screen
        name="Companies"
        component={PendingCompanies}
        options={{
          tabBarLabel: "Companies",
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreenNew}
        options={{
          tabBarLabel: "Map",
        }}
        initialParams={{
          userRole: "admin",
          userId: null
        }}
      />
      <Tab.Screen
        name="Notify"
        component={SendNotification}
        options={{
          tabBarLabel: "Notify",
        }}
      />
    </Tab.Navigator>
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
  contentContainer: {
    flex: 1,
    paddingBottom: Platform.OS === "ios" ? 95 : 85,
  },
  modernHeader: {
    paddingTop: Platform.OS === "ios" ? 50 : 50,
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
  adminIconContainer: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
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
    borderColor: "#1b2e4f",
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
  analyticsHeader: {
    backgroundColor: "#FFF",
    paddingTop: 30,
    paddingBottom: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  analyticsBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  analyticsHeaderTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D3436",
    flex: 1,
    // textAlign: "center",
    marginHorizontal: 10,
  },
});

export default Admin;

