import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/constants";
import { getAllProjectsExceptMine } from "../apis/project/Project";
import { getUserId } from "../utils/auth";

const OtherProjectsScreen = ({ navigation }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchProjects = async () => {
    try {
      setError(null);
      const userId = await getUserId();

      if (!userId) {
        Alert.alert("Error", "Please login again");
        return;
      }

      const response = await getAllProjectsExceptMine(userId);
      console.log("Fetched projects response:", response);

      if (response.success) {
        const projectsData = response.data || [];
        console.log("Projects data:", projectsData);

        // Log first project's images for debugging
        if (projectsData.length > 0) {
          console.log("First project photos:", projectsData[0].project_photos);
        }

        setProjects(projectsData);
      } else {
        if (response.notFound) {
          setProjects([]);
        } else {
          setError(response.message || "Failed to fetch projects");
        }
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProjects();
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="folder-open-outline" size={80} color="#ccc" />
      <Text style={styles.emptyStateText}>No projects found</Text>
      <Text style={styles.emptyStateSubtext}>
        Other students' projects will appear here
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="alert-circle-outline" size={80} color="#ff6b6b" />
      <Text style={styles.emptyStateText}>Error loading projects</Text>
      <Text style={styles.emptyStateSubtext}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchProjects}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.mainColor} />
        <Text style={styles.loadingText}>Loading projects...</Text>
      </View>
    );
  }

  if (error) {
    return <View style={styles.container}>{renderErrorState()}</View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Other Projects</Text>
        <Text style={styles.sectionSubtitle}>{projects.length} projects</Text>
      </View>
      <FlatList
        data={projects}
        keyExtractor={(item) => item.project_id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.mainColor]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        renderItem={({ item }) => {
          // Get the first image or use a placeholder
          // Handle both array of URLs and array of objects
          let projectImage = null;

          if (
            item.project_photos &&
            Array.isArray(item.project_photos) &&
            item.project_photos.length > 0
          ) {
            const firstPhoto = item.project_photos[0];

            // Check if it's a string (URL) or object
            if (typeof firstPhoto === "string") {
              projectImage = firstPhoto;
            } else if (firstPhoto && firstPhoto.uri) {
              projectImage = firstPhoto.uri;
            }

            console.log("Project image URL:", projectImage);
          }

          // Truncate description if it's too long
          const description = item.description || "No description available";
          const truncatedDescription =
            description.length > 80
              ? description.substring(0, 80) + "..."
              : description;

          // Get student names
          const studentNames =
            item.students && item.students.length > 0
              ? item.students.map((s) => s.name).join(" & ")
              : "Unknown";

          return (
            <TouchableOpacity
              style={styles.projectCard}
              onPress={() => {
                navigation.navigate("ProjectDetails", {
                  project: item,
                });
              }}
            >
              {projectImage ? (
                <Image
                  source={{ uri: projectImage }}
                  style={styles.projectImage}
                  resizeMode="cover"
                  onError={(error) => {
                    console.error("Image load error:", error.nativeEvent.error);
                    console.log("Failed to load image:", projectImage);
                  }}
                  onLoad={() => {
                    console.log("Image loaded successfully:", projectImage);
                  }}
                />
              ) : (
                <View style={[styles.projectImage, styles.placeholderImage]}>
                  <Ionicons name="image-outline" size={40} color="#ccc" />
                </View>
              )}
              <View style={styles.projectInfo}>
                <Text style={styles.projectTitle} numberOfLines={2}>
                  {item.title || "Untitled Project"}
                </Text>
                <Text style={styles.studentNames} numberOfLines={1}>
                  {studentNames}
                </Text>
                <Text style={styles.projectDescription} numberOfLines={2}>
                  {truncatedDescription}
                </Text>
                <View style={styles.projectFooter}>
                  <View style={styles.boothInfo}>
                    <Ionicons
                      name="location"
                      size={14}
                      color={Colors.mainColor}
                    />
                    <Text style={[styles.boothText, { marginLeft: 8 }]}>
                      {"Booth - " + (item.booth || "TBA")}
                    </Text>
                  </View>
                  {item.github_link && (
                    <Ionicons name="logo-github" size={18} color="#666" />
                  )}
                  {item.video_url && (
                    <Ionicons name="play-circle" size={18} color="#666" />
                  )}
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={Colors.mainColor}
                style={styles.chevronIcon}
              />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  listContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  projectCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 15,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  projectImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#f0f0f0",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  projectInfo: {
    padding: 15,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  studentNames: {
    fontSize: 14,
    color: Colors.mainColor,
    fontWeight: "600",
    marginBottom: 6,
  },
  projectDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  projectFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  boothInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  boothText: {
    fontSize: 12,
    color: Colors.mainColor,
    fontWeight: "600",
  },
  chevronIcon: {
    position: "absolute",
    right: 15,
    top: 15,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 15,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: Colors.mainColor,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default OtherProjectsScreen;
