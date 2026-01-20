import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Colors } from "../constants/constants";
import OtherProjectsScreen from "./OtherProjectsScreen";
import CompaniesScreen from "./CompaniesScreen";

const ExploreScreen = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState("projects"); // Default to Projects

  const handleTabChange = (tab) => {
    setSelectedTab(tab);
  };

  return (
    <View style={styles.container}>
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === "projects" && styles.activeTabButton,
          ]}
          onPress={() => handleTabChange("projects")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "projects" && styles.activeTabText,
            ]}
          >
            Projects
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === "companies" && styles.activeTabButton,
          ]}
          onPress={() => handleTabChange("companies")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "companies" && styles.activeTabText,
            ]}
          >
            Companies
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <View style={styles.contentArea}>
        {selectedTab === "projects" && (
          <OtherProjectsScreen navigation={navigation} />
        )}
        {selectedTab === "companies" && (
          <CompaniesScreen navigation={navigation} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    gap: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "transparent",
  },
  activeTabButton: {
    backgroundColor: Colors.mainColor,
    borderColor: Colors.mainColor,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748b",
  },
  activeTabText: {
    color: "#fff",
  },
  contentArea: {
    flex: 1,
  },
});

export default ExploreScreen;
