import React from "react";
import { View, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import AdminDashboard from "./AdminDashboard";
import SendNotification from "./SendNotification";
import PendingProjects from "./PendingProjects";
import PendingOfferings from "./PendingOfferings";
import AnalyticsScreen from "./AnalyticsScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack navigator for Dashboard with Analytics
const DashboardStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardHome" component={AdminDashboard} />
      <Stack.Screen 
        name="Analytics" 
        component={AnalyticsScreen}
        options={{
          headerShown: true,
          headerTitle: "Analytics",
          headerStyle: {
            backgroundColor: '#4A90E2',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack.Navigator>
  );
};

const Admin = () => {
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
          } else if (route.name === "Offers") {
            iconName = focused ? "briefcase" : "briefcase-outline";
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
        name="Offers"
        component={PendingOfferings}
        options={{
          tabBarLabel: "Offers",
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

const styles = StyleSheet.create({});

export default Admin;
