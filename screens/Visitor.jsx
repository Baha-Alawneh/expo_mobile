import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/constants";
import OtherProjectsScreen from "./OtherProjectsScreen";
import CompaniesScreen from "./CompaniesScreen";
import MapScreen from "./MapScreen";

const Visitor = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("projects");

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={Colors.mainColor}
        />

        {/* Tab Navigation - No Header */}
        <View style={styles.tabContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScroll}
          >
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
                name={
                  activeTab === "companies" ? "business" : "business-outline"
                }
                size={20}
                color={activeTab === "companies" ? "#fff" : Colors.mainColor}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "companies" && styles.activeTabText,
                ]}
              >
                Companies
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
        {activeTab === "projects" && (
          <OtherProjectsScreen navigation={navigation} />
        )}
        {activeTab === "companies" && (
          <CompaniesScreen navigation={navigation} />
        )}
        {activeTab === "map" && <MapScreen studentProject="Visitor" />}
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
  tabContainer: {
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingTop: Platform.OS === "ios" ? 10 : 50,
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
});

export default Visitor;
