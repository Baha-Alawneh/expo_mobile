import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getProjectsByStatus,
  updateProjectStatus,
} from "../apis/admin/Admin";

const { width } = Dimensions.get("window");

const PendingProjects = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("pending");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, [activeTab]);

  const fetchProjects = async () => {
    setLoading(true);
    const response = await getProjectsByStatus(activeTab);
    if (response.success) {
      setProjects(response.data);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProjects();
    setRefreshing(false);
  };

  const handleApprove = (project) => {
    Alert.alert(
      "Approve Project",
      `Are you sure you want to approve "${project.title || project.project_title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          style: "default",
          onPress: () => updateStatus(project.project_id, "approved"),
        },
      ]
    );
  };

  const handleReject = (project) => {
    Alert.alert(
      "Reject Project",
      `Are you sure you want to reject "${project.title || project.project_title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: () => updateStatus(project.project_id, "rejected"),
        },
      ]
    );
  };

  const updateStatus = async (projectId, status) => {
    setProcessingId(projectId);
    const response = await updateProjectStatus(projectId, status);

    if (response.success) {
      Alert.alert("Success", response.message);
      // Remove the project from the list
      setProjects(projects.filter((p) => p.project_id !== projectId));
    } else {
      Alert.alert("Error", response.message);
    }
    setProcessingId(null);
  };

  const ProjectCard = ({ project }) => {
    const isProcessing = processingId === project.project_id;

    // Get the first image - check both project_photos and images
    let projectImage = null;
    const photos = project.project_photos || project.images || [];
    if (Array.isArray(photos) && photos.length > 0) {
      const firstPhoto = photos[0];
      // Check if it's a string (URL) or object
      if (typeof firstPhoto === "string") {
        projectImage = firstPhoto;
      } else if (firstPhoto && firstPhoto.uri) {
        projectImage = firstPhoto.uri;
      }
    }

    return (
      <TouchableOpacity
        style={styles.projectCard}
        onPress={() => {
          navigation.navigate("ProjectDetails", {
            project: project,
            fromAdmin: true, // Flag to indicate navigation from admin
          });
        }}
        activeOpacity={0.7}
      >
        {/* Project Image - Full Width at Top */}
        {projectImage ? (
          <Image
            source={{ uri: projectImage }}
            style={styles.projectImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.projectImage, styles.placeholderImage]}>
            <Ionicons name="image-outline" size={40} color="#ccc" />
          </View>
        )}

        {/* Project Info Below Image */}
        <View style={styles.projectInfo}>
          {/* Title */}
          <Text style={styles.projectTitle} numberOfLines={2}>
            {project.title || project.project_title}
          </Text>

          {/* Student Name */}
          <Text style={styles.studentName} numberOfLines={1}>
            {project.students?.[0]?.name || project.student_name}
          </Text>

          {/* Description */}
          <Text style={styles.projectDescription} numberOfLines={2}>
            {project.description || project.project_description}
          </Text>

          {/* Action Buttons */}
          {activeTab === "pending" && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.rejectButton, isProcessing && styles.buttonDisabled]}
                onPress={(e) => {
                  e.stopPropagation();
                  handleReject(project);
                }}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#FF7675" />
                ) : (
                  <>
                    <Ionicons name="close-circle" size={20} color="#FF7675" />
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.approveButton, isProcessing && styles.buttonDisabled]}
                onPress={(e) => {
                  e.stopPropagation();
                  handleApprove(project);
                }}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                    <Text style={styles.approveButtonText}>Approve</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
          
          {/* Status Badge for Approved/Rejected */}
          {activeTab !== "pending" && (
            <View style={styles.statusBadgeContainer}>
              <View style={[
                styles.statusBadge,
                activeTab === "approved" ? styles.approvedBadge : styles.rejectedBadge
              ]}>
                <Ionicons 
                  name={activeTab === "approved" ? "checkmark-circle" : "close-circle"} 
                  size={16} 
                  color="#FFF" 
                />
                <Text style={styles.statusBadgeText}>
                  {activeTab === "approved" ? "Approved" : "Rejected"}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Chevron Icon */}
        <Ionicons
          name="chevron-forward"
          size={24}
          color="#B2BEC3"
          style={styles.chevronIcon}
        />
      </TouchableOpacity>
    );
  };

  if (loading && projects.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#2D3436" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Projects</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{projects.length}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "pending" && styles.activeTab]}
          onPress={() => setActiveTab("pending")}
        >
          <Text style={[styles.tabText, activeTab === "pending" && styles.activeTabText]}>
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "approved" && styles.activeTab]}
          onPress={() => setActiveTab("approved")}
        >
          <Text style={[styles.tabText, activeTab === "approved" && styles.activeTabText]}>
            Approved
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "rejected" && styles.activeTab]}
          onPress={() => setActiveTab("rejected")}
        >
          <Text style={[styles.tabText, activeTab === "rejected" && styles.activeTabText]}>
            Rejected
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6C5CE7"]}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6C5CE7" />
          </View>
        ) : projects.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons 
              name={
                activeTab === "pending" ? "checkmark-done-circle" :
                activeTab === "approved" ? "folder-open-outline" :
                "close-circle-outline"
              } 
              size={80} 
              color="#DFE6E9" 
            />
            <Text style={styles.emptyTitle}>
              {activeTab === "pending" ? "All Clear!" :
               activeTab === "approved" ? "No Approved Projects" :
               "No Rejected Projects"}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === "pending" 
                ? "No pending projects to review at the moment"
                : `No ${activeTab} projects found`}
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>
              {activeTab === "pending" && "Review and approve student projects"}
              {activeTab === "approved" && "Successfully approved projects"}
              {activeTab === "rejected" && "Rejected projects"}
            </Text>
            {projects.map((project, index) => (
              <ProjectCard key={`${project.project_id}-${index}`} project={project} />
            ))}
            <View style={{ height: 30 }} />
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#FFF",
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D3436",
    flex: 1,
    marginLeft: 10,
  },
  badge: {
    backgroundColor: "#6C5CE7",
    borderRadius: 16,
    minWidth: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#6C5CE7",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#636E72",
  },
  activeTabText: {
    color: "#6C5CE7",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#636E72",
    marginTop: 20,
    marginBottom: 15,
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
  studentName: {
    fontSize: 14,
    color: "#6C5CE7",
    fontWeight: "600",
    marginBottom: 6,
  },
  projectDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  approveButton: {
    flex: 1,
    backgroundColor: "#00B894",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  approveButtonText: {
  statusBadgeContainer: {
    marginTop: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  approvedBadge: {
    backgroundColor: "#00B894",
  },
  rejectedBadge: {
    backgroundColor: "#FF7675",
  },
  statusBadgeText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
  },
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 6,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FF7675",
  },
  rejectButtonText: {
    color: "#FF7675",
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 6,
  },
  chevronIcon: {
    position: "absolute",
    right: 15,
    top: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3436",
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#636E72",
    textAlign: "center",
  },
});

export default PendingProjects;
