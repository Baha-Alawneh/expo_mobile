import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/constants";

const ProjectDetailsScreen = ({ navigation, route }) => {
  const { project } = route.params || {};

  // Helper function to get status color and text
  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return { color: "#4CAF50", text: "Approved", icon: "checkmark-circle" };
      case "rejected":
        return { color: "#FF5252", text: "Rejected", icon: "close-circle" };
      case "pending":
      default:
        return { color: "#FF9800", text: "Pending", icon: "time" };
    }
  };

  const openLink = async (url) => {
    const { Linking } = require("react-native");
    if (!url) return;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Cannot open this link");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open link");
    }
  };

  if (!project) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Project Details</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={80} color="#CCC" />
            <Text style={styles.emptyText}>No project data available</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Project Details</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.modernProjectContainer}>
            {/* Header Section with Title and Status */}
            <View style={styles.modernProjectHeader}>
              <View style={styles.modernProjectTitleContainer}>
                <Ionicons name="cube" size={28} color={Colors.mainColor} />
                <Text style={styles.modernProjectTitle}>{project.title}</Text>
              </View>
              <View
                style={[
                  styles.modernStatusBadge,
                  {
                    backgroundColor: getStatusInfo(project.status).color + "20",
                  },
                ]}
              >
                <Ionicons
                  name={getStatusInfo(project.status).icon}
                  size={16}
                  color={getStatusInfo(project.status).color}
                />
                <Text
                  style={[
                    styles.modernStatusText,
                    { color: getStatusInfo(project.status).color },
                  ]}
                >
                  {getStatusInfo(project.status).text}
                </Text>
              </View>
            </View>

            {/* Description Section */}
            {project.description ? (
              <View style={styles.modernProjectSection}>
                <View style={styles.modernSectionHeader}>
                  <Ionicons
                    name="document-text"
                    size={20}
                    color={Colors.mainColor}
                  />
                  <Text style={styles.modernSectionTitle}>Description</Text>
                </View>
                <Text style={styles.modernProjectDescription}>
                  {project.description}
                </Text>
              </View>
            ) : null}

            {/* Team Members Section */}
            {project.students && project.students.length > 0 && (
              <View style={styles.modernProjectSection}>
                <View style={styles.modernSectionHeader}>
                  <Ionicons name="people" size={20} color={Colors.mainColor} />
                  <Text style={styles.modernSectionTitle}>
                    Team Members ({project.students.length})
                  </Text>
                </View>
                <View style={styles.modernTeamContainer}>
                  {project.students.map((student, index) => (
                    <View
                      key={student.student_id || index}
                      style={styles.modernMemberCard}
                    >
                      <View style={styles.modernMemberAvatar}>
                        <Ionicons name="person" size={24} color="#fff" />
                      </View>
                      <View style={styles.modernMemberInfo}>
                        <Text style={styles.modernMemberName}>
                          {student.name}
                        </Text>
                        <Text
                          style={styles.modernMemberEmail}
                          numberOfLines={1}
                        >
                          {student.email}
                        </Text>
                      </View>
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#4CAF50"
                      />
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Booth Information */}
            {project.booth && (
              <View style={styles.modernProjectSection}>
                <View style={styles.modernSectionHeader}>
                  <Ionicons
                    name="location"
                    size={20}
                    color={Colors.mainColor}
                  />
                  <Text style={styles.modernSectionTitle}>Booth Location</Text>
                </View>
                <View style={styles.boothBadge}>
                  <Text style={styles.boothBadgeText}>{project.booth}</Text>
                </View>
              </View>
            )}

            {/* Project Images Gallery */}
            {project.project_photos?.length > 0 && (
              <View style={styles.modernProjectSection}>
                <View style={styles.modernSectionHeader}>
                  <Ionicons name="images" size={20} color={Colors.mainColor} />
                  <Text style={styles.modernSectionTitle}>
                    Gallery ({project.project_photos.length})
                  </Text>
                </View>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.modernImageGallery}
                >
                  {project.project_photos.map((photo, index) => (
                    <View key={index} style={styles.modernImageCard}>
                      <Image
                        source={{
                          uri: typeof photo === "string" ? photo : photo.uri,
                        }}
                        style={styles.modernProjectImage}
                        resizeMode="cover"
                      />
                      <View style={styles.imageNumberBadge}>
                        <Text style={styles.imageNumberText}>{index + 1}</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Links Section */}
            {(project.video_url || project.github_link) && (
              <View style={styles.modernProjectSection}>
                <View style={styles.modernSectionHeader}>
                  <Ionicons name="link" size={20} color={Colors.mainColor} />
                  <Text style={styles.modernSectionTitle}>Project Links</Text>
                </View>
                <View style={styles.modernLinksContainer}>
                  {project.video_url && (
                    <TouchableOpacity
                      style={styles.modernLinkButton}
                      onPress={() => openLink(project.video_url)}
                    >
                      <View style={styles.modernLinkIcon}>
                        <Ionicons
                          name="play-circle"
                          size={24}
                          color="#FF6B6B"
                        />
                      </View>
                      <View style={styles.modernLinkContent}>
                        <Text style={styles.modernLinkTitle}>Demo Video</Text>
                        <Text style={styles.modernLinkUrl} numberOfLines={1}>
                          {project.video_url}
                        </Text>
                      </View>
                      <Ionicons name="open-outline" size={20} color="#999" />
                    </TouchableOpacity>
                  )}
                  {project.github_link && (
                    <TouchableOpacity
                      style={styles.modernLinkButton}
                      onPress={() => openLink(project.github_link)}
                    >
                      <View style={styles.modernLinkIcon}>
                        <Ionicons name="logo-github" size={24} color="#333" />
                      </View>
                      <View style={styles.modernLinkContent}>
                        <Text style={styles.modernLinkTitle}>
                          GitHub Repository
                        </Text>
                        <Text style={styles.modernLinkUrl} numberOfLines={1}>
                          {project.github_link}
                        </Text>
                      </View>
                      <Ionicons name="open-outline" size={20} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
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
  header: {
    backgroundColor: Colors.mainColor,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 15,
  },
  modernProjectContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  modernProjectHeader: {
    marginBottom: 20,
  },
  modernProjectTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  modernProjectTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  modernStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  modernStatusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  modernProjectSection: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modernSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  modernSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  modernProjectDescription: {
    fontSize: 15,
    color: "#666",
    lineHeight: 24,
    paddingLeft: 28,
  },
  modernTeamContainer: {
    paddingLeft: 28,
    gap: 10,
  },
  modernMemberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  modernMemberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.mainColor,
    justifyContent: "center",
    alignItems: "center",
  },
  modernMemberInfo: {
    flex: 1,
  },
  modernMemberName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  modernMemberEmail: {
    fontSize: 13,
    color: "#666",
  },
  boothBadge: {
    backgroundColor: "#F0F4FF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginLeft: 28,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: Colors.mainColor + "30",
  },
  boothBadgeText: {
    fontSize: 16,
    color: Colors.mainColor,
    fontWeight: "600",
  },
  modernImageGallery: {
    marginLeft: 28,
  },
  modernImageCard: {
    position: "relative",
    marginRight: 12,
  },
  modernProjectImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  imageNumberBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageNumberText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  modernLinksContainer: {
    paddingLeft: 28,
    gap: 12,
  },
  modernLinkButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  modernLinkIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modernLinkContent: {
    flex: 1,
  },
  modernLinkTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  modernLinkUrl: {
    fontSize: 12,
    color: "#999",
  },
});

export default ProjectDetailsScreen;
