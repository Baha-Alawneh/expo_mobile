import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../constants/constants";
import StarRating from "../StarRating";
import FeedbackList from "../FeedbackList";
import { getProjectFeedback } from "../../apis/feedback/Feedback";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getProject,
  createProject,
  updateProject,
} from "../../apis/project/Project";
import { uploadProjectImages } from "../../apis/project/ProjectImages";

const ModernProjectContent = ({ navigation }) => {
  const [myProject, setMyProject] = useState(null);
  const [showAddProject, setShowAddProject] = useState(false);
  const [editingProject, setEditingProject] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [allFeedback, setAllFeedback] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState({ average: 0, count: 0 });
  const [showTypeSelection, setShowTypeSelection] = useState(false);
  const [showEngineeringSubType, setShowEngineeringSubType] = useState(false);
  const [studentType, setStudentType] = useState("");
  const [engineeringSubType, setEngineeringSubType] = useState(""); // UI only: hardware/software
  const [projectData, setProjectData] = useState({
    title: "",
    description: "",
    video_url: "",
    project_photos: [],
    github_link: "",
    partner_email: "",
    type: "",
  });

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

  const fetchMyProject = async () => {
    try {
      setError(null);
      const userId = await AsyncStorage.getItem("userId");

      if (!userId) {
        setError("Please login again");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const result = await getProject(userId);
      if (result.success && result.data) {
        const photos =
          result.data.project_photos &&
          Array.isArray(result.data.project_photos) &&
          result.data.project_photos.length > 0
            ? result.data.project_photos
            : result.data.images && Array.isArray(result.data.images)
            ? result.data.images
            : [];

        const projectData = {
          title: result.data.title || "",
          description: result.data.description || "",
          video_url: result.data.video_url || "",
          github_link: result.data.github_link || "",
          project_photos: photos,
          students: result.data.students || [],
          status: result.data.status || "pending",
          booth: result.data.booth || "",
          created_at: result.data.created_at || null,
          project_id: result.data.project_id || result.data.id || null,
          student_id: result.data.student_id || null,
        };

        setMyProject(projectData);

        // Feedback will be loaded separately in useEffect
      } else {
        setMyProject(null);
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      setError(error.message || "Failed to load project");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadFeedbackData = async () => {
    if (!myProject?.project_id) {
      return;
    }

    try {
      const feedbackResponse = await getProjectFeedback(myProject.project_id);

      if (feedbackResponse.success) {
        const allFeedbackData = feedbackResponse.data.feedback || feedbackResponse.data || [];
        
        // Calculate average and count
        let average = 0;
        let count = 0;
        
        if (Array.isArray(allFeedbackData) && allFeedbackData.length > 0) {
          const totalRating = allFeedbackData.reduce((acc, curr) => acc + (curr.rating || 0), 0);
          average = totalRating / allFeedbackData.length;
          count = allFeedbackData.length;
        }

        // Filter to only show feedback with comments
        const feedbackWithComments = allFeedbackData.filter(
          (item) => item.comment && item.comment.trim().length > 0
        );

        setAllFeedback(feedbackWithComments);
        setFeedbackStats({
          average: average,
          count: count,
        });
      }
    } catch (error) {
      console.error("Error loading project feedback:", error);
    }
  };

  useEffect(() => {
    fetchMyProject();
  }, []);

  useEffect(() => {
    if (myProject?.project_id) {
      loadFeedbackData();
    }
  }, [myProject?.project_id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyProject();
  };

  const openLink = (url) => {
    if (!url) return;
    Alert.alert("Open Link", `Open ${url}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Open",
        onPress: () => {
          // Handle link opening
        },
      },
    ]);
  };

  const handleAddProject = () => {
    setEditingProject(false);
    setProjectData({
      title: "",
      description: "",
      video_url: "",
      project_photos: [],
      github_link: "",
      partner_email: "",
      type: "",
    });
    // Show type selection modal first for new projects
    setShowTypeSelection(true);
  };

  const editProject = () => {
    if (myProject) {
      const preparedPhotos =
        myProject.project_photos && Array.isArray(myProject.project_photos)
          ? myProject.project_photos.map((photoUrl, index) => ({
              uri: photoUrl,
              fileName: photoUrl.split("/").pop() || `photo_${index}.jpg`,
              type: "image/jpeg",
            }))
          : [];

      setProjectData({
        title: myProject.title || "",
        description: myProject.description || "",
        video_url: myProject.video_url || "",
        project_photos: preparedPhotos,
        github_link: myProject.github_link || "",
        partner_email: "",
      });
      setEditingProject(true);
      setShowAddProject(true);
    }
  };

  const handleTypeSelection = (type) => {
    setStudentType(type);
    setProjectData((prev) => ({ ...prev, type }));
    setShowTypeSelection(false);
    
    // If engineering is selected, show sub-type selection (UI only)
    if (type === "engineering") {
      setShowEngineeringSubType(true);
    } else {
      setShowAddProject(true);
    }
  };

  const handleEngineeringSubTypeSelection = (subType) => {
    setEngineeringSubType(subType); // Store for UI purposes only
    setShowEngineeringSubType(false);
    setShowAddProject(true);
  };

  const selectImages = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "Please grant permission to access your photos"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        const newPhotos = result.assets || [result];
        setProjectData((prev) => ({
          ...prev,
          project_photos: [...(prev.project_photos || []), ...newPhotos],
        }));
      }
    } catch (error) {
      console.error("Error selecting images:", error);
      Alert.alert("Error", "Failed to select images");
    }
  };

  const removeImage = (index) => {
    setProjectData((prev) => ({
      ...prev,
      project_photos: prev.project_photos.filter((_, i) => i !== index),
    }));
  };

  const handleSaveProject = async () => {
    if (!projectData.title.trim()) {
      Alert.alert("Required", "Project title is required");
      return;
    }
    if (!projectData.description.trim()) {
      Alert.alert("Required", "Project description is required");
      return;
    }

    // Validate type only for new projects (not editing)
    if (!editingProject && !projectData.type && !studentType) {
      Alert.alert("Error", "Please select a student type");
      return;
    }

    try {
      const userId = await AsyncStorage.getItem("userId");

      // Extract only URIs for the payload (backend expects array of strings)
      const photoUris = projectData.project_photos?.map((photo) => 
        typeof photo === 'string' ? photo : photo.uri
      ) || [];

      const projectPayload = {
        title: projectData.title.trim(),
        description: projectData.description.trim(),
        video_url: projectData.video_url?.trim() || "",
        github_link: projectData.github_link?.trim() || "",
        partner_email: projectData.partner_email?.trim() || "",
        project_photos: photoUris,
        type: projectData.type || studentType,
      };

      let result;
      if (editingProject && myProject) {
        result = await updateProject(userId, projectPayload);
      } else {
        result = await createProject(userId, projectPayload);
      }

      if (result.success) {
        // Only upload NEW images (not existing S3 URLs)
        const newImages = projectData.project_photos.filter(
          (photo) => photo.uri && !photo.uri.startsWith("http")
        );
        
        if (newImages.length > 0) {
          try {
            Alert.alert("Uploading", "Uploading project images...");

            const uploadResult = await uploadProjectImages(
              userId,
              newImages
            );

            if (uploadResult.success) {
              Alert.alert(
                "Success",
                editingProject
                  ? "Project and images updated successfully!"
                  : "Project and images added successfully!"
              );
            } else {
              Alert.alert(
                "Warning",
                "Project saved but image upload failed: " + uploadResult.message
              );
            }
          } catch (error) {
            Alert.alert(
              "Warning",
              "Project saved but image upload failed: " + error.message
            );
          }
        } else {
          Alert.alert(
            "Success",
            editingProject
              ? "Project updated successfully!"
              : "Project added successfully!"
          );
        }

        setShowAddProject(false);
        setEditingProject(false);
        await fetchMyProject();
      } else {
        Alert.alert("Error", result.message || "Failed to save project");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save project");
    }
  };

  const renderErrorState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="alert-circle-outline" size={80} color="#FF5252" />
      </View>
      <Text style={styles.emptyStateTitle}>Error Loading Project</Text>
      <Text style={styles.emptyStateText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchMyProject}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="folder-outline" size={80} color="#ccc" />
      </View>
      <Text style={styles.emptyStateTitle}>No Project Yet</Text>
      <Text style={styles.emptyStateText}>
        Create your first project to showcase your work
      </Text>
      <TouchableOpacity style={styles.addButton} onPress={handleAddProject}>
        <LinearGradient
          colors={["#1b2e4f", "#2a4575"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.addButtonGradient}
        >
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add Project</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1b2e4f" />
        <Text style={styles.loadingText}>Loading project...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#1b2e4f"]}
          />
        }
      >

        {error ? (
          renderErrorState()
        ) : myProject ? (
          <View style={styles.projectCard}>
            {/* Header with Edit Button */}
            <View style={styles.cardHeader}>
              <View style={styles.titleRow}>
                <View style={styles.iconTitleContainer}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="folder" size={24} color="#1b2e4f" />
                  </View>
                  <Text style={styles.projectName}>{myProject.title}</Text>
                </View>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={editProject}
                >
                  <Ionicons name="create-outline" size={20} color="#1b2e4f" />
                </TouchableOpacity>
              </View>
              
              {/* Status Badge */}
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusInfo(myProject.status).color + "15" },
                ]}
              >
                <Ionicons
                  name={getStatusInfo(myProject.status).icon}
                  size={16}
                  color={getStatusInfo(myProject.status).color}
                />
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusInfo(myProject.status).color },
                  ]}
                >
                  {getStatusInfo(myProject.status).text}
                </Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Description Section */}
            {myProject.description && (
              <>
                <View style={styles.descriptionSection}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="document-text-outline" size={20} color="#1b2e4f" />
                    <Text style={styles.sectionTitle}>Description</Text>
                  </View>
                  <Text style={styles.descriptionText}>{myProject.description}</Text>
                </View>
                <View style={styles.divider} />
              </>
            )}

            {/* Team Members Section */}
            {myProject.students && myProject.students.length > 0 && (
              <>
                <View style={styles.teamSection}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="people-outline" size={20} color="#1b2e4f" />
                    <Text style={styles.sectionTitle}>Team Members</Text>
                  </View>
                  {myProject.students.map((student, index) => (
                    <View key={index} style={styles.teamMemberCard}>
                      <View style={styles.memberAvatar}>
                        <Text style={styles.memberAvatarText}>
                          {student.name?.[0] || "S"}
                        </Text>
                      </View>
                      <View style={styles.memberInfo}>
                        <Text style={styles.memberName}>
                          {student.name || "Student"}
                        </Text>
                        <Text style={styles.memberEmail}>
                          {student.email || "No email"}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
                <View style={styles.divider} />
              </>
            )}

            {/* Booth Assignment */}
            {myProject.booth && (
              <>
                <View style={styles.boothSection}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="location-outline" size={20} color="#1b2e4f" />
                    <Text style={styles.sectionTitle}>Booth Assignment</Text>
                  </View>
                  <View style={styles.boothBadge}>
                    <Text style={styles.boothText}>Booth {myProject.booth}</Text>
                  </View>
                </View>
                <View style={styles.divider} />
              </>
            )}

            {/* Project Images */}
            {myProject.project_photos && myProject.project_photos.length > 0 && (
              <>
                <View style={styles.imagesSection}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="images-outline" size={20} color="#1b2e4f" />
                    <Text style={styles.sectionTitle}>Project Gallery</Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.imagesScroll}
                  >
                    {myProject.project_photos
                      .filter((photo) => photo && typeof photo === 'string')
                      .map((photo, index) => (
                        <Image
                          key={index}
                          source={{ uri: photo }}
                          style={styles.projectImage}
                        />
                      ))}
                  </ScrollView>
                </View>
                <View style={styles.divider} />
              </>
            )}

            {/* Links Section */}
            {(myProject.video_url || myProject.github_link) && (
              <>
                <View style={styles.linksSection}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="link-outline" size={20} color="#1b2e4f" />
                    <Text style={styles.sectionTitle}>Project Links</Text>
                  </View>
                  {myProject.video_url && (
                    <TouchableOpacity
                      style={styles.linkButton}
                      onPress={() => openLink(myProject.video_url)}
                    >
                      <View style={styles.linkIcon}>
                        <Ionicons name="play-circle" size={24} color="#FF6B6B" />
                      </View>
                      <View style={styles.linkContent}>
                        <Text style={styles.linkTitle}>Demo Video</Text>
                        <Text style={styles.linkUrl} numberOfLines={1}>
                          {myProject.video_url}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#999" />
                    </TouchableOpacity>
                  )}
                  {myProject.github_link && (
                    <TouchableOpacity
                      style={styles.linkButton}
                      onPress={() => openLink(myProject.github_link)}
                    >
                      <View style={styles.linkIcon}>
                        <Ionicons name="logo-github" size={24} color="#333" />
                      </View>
                      <View style={styles.linkContent}>
                        <Text style={styles.linkTitle}>GitHub Repository</Text>
                        <Text style={styles.linkUrl} numberOfLines={1}>
                          {myProject.github_link}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#999" />
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.divider} />
              </>
            )}

            {/* Rating Section */}
            <View style={styles.ratingSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="star" size={20} color="#FFD700" />
                <Text style={styles.sectionTitle}>Ratings & Reviews</Text>
              </View>
              <View style={styles.ratingOverview}>
                <View style={styles.ratingValueContainer}>
                  <Text style={styles.ratingValue}>
                    {feedbackStats.average.toFixed(1)}
                  </Text>
                  <StarRating rating={feedbackStats.average} size={20} />
                  <Text style={styles.ratingCount}>
                    ({feedbackStats.count} {feedbackStats.count === 1 ? "rating" : "ratings"})
                  </Text>
                </View>
              </View>

              {/* Feedback List */}
              {allFeedback.length > 0 ? (
                <View style={styles.feedbackContainer}>
                  <FeedbackList feedbackList={allFeedback} />
                </View>
              ) : (
                <Text style={styles.noFeedbackText}>No reviews yet</Text>
              )}
            </View>
          </View>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>

      {/* Add/Edit Project Modal */}
      <Modal
        visible={showAddProject}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowAddProject(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={["#1b2e4f", "#2a4575"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalHeader}
          >
            <TouchableOpacity
              onPress={() => setShowAddProject(false)}
              style={styles.modalBackButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingProject ? "Edit Project" : "Add Project"}
            </Text>
            <View style={{ width: 40 }} />
          </LinearGradient>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Project Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter project title"
                value={projectData.title}
                onChangeText={(text) =>
                  setProjectData((prev) => ({ ...prev, title: text }))
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your project"
                value={projectData.description}
                onChangeText={(text) =>
                  setProjectData((prev) => ({ ...prev, description: text }))
                }
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Demo Video Link</Text>
              <TextInput
                style={styles.input}
                placeholder="https://your-demo-link.com"
                value={projectData.video_url}
                onChangeText={(text) =>
                  setProjectData((prev) => ({ ...prev, video_url: text }))
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>GitHub Link</Text>
              <TextInput
                style={styles.input}
                placeholder="https://github.com/your-project"
                value={projectData.github_link}
                onChangeText={(text) =>
                  setProjectData((prev) => ({ ...prev, github_link: text }))
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Partner Email (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="partner@example.com"
                value={projectData.partner_email}
                onChangeText={(text) =>
                  setProjectData((prev) => ({ ...prev, partner_email: text }))
                }
                keyboardType="email-address"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Photos</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {projectData.project_photos?.map((photo, index) => {
                  const photoUri = typeof photo === 'string' ? photo : photo.uri;
                  return (
                    <View key={index} style={styles.imagePreviewContainer}>
                      <Image source={{ uri: photoUri }} style={styles.imagePreview} />
                      <TouchableOpacity
                        style={styles.removeImageButton}
                        onPress={() => removeImage(index)}
                      >
                        <Ionicons name="close-circle" size={24} color="#FF5252" />
                      </TouchableOpacity>
                    </View>
                  );
                })}
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={selectImages}
                >
                  <Ionicons name="camera" size={32} color="#1b2e4f" />
                  <Text style={styles.addImageText}>Add Photo</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveProject}>
              <LinearGradient
                colors={["#1b2e4f", "#2a4575"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.saveButtonGradient}
              >
                <Text style={styles.saveButtonText}>
                  {editingProject ? "Update Project" : "Create Project"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Student Type Selection Modal */}
      <Modal
        visible={showTypeSelection}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowTypeSelection(false)}
      >
        <View style={styles.typeModalOverlay}>
          <View style={styles.typeModalContainer}>
            <Text style={styles.typeModalTitle}>What is your student type?</Text>
            <Text style={styles.typeModalSubtitle}>
              Select your project type to continue
            </Text>
            
            <TouchableOpacity
              style={styles.typeOption}
              onPress={() => handleTypeSelection("science")}
            >
              <Ionicons name="flask" size={32} color="#1b2e4f" />
              <View style={styles.typeOptionContent}>
                <Text style={styles.typeOptionText}>Science</Text>
                <Text style={styles.typeOptionDescription}>
                  For science-related projects
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.typeOption}
              onPress={() => handleTypeSelection("engineering")}
            >
              <Ionicons name="construct" size={32} color="#1b2e4f" />
              <View style={styles.typeOptionContent}>
                <Text style={styles.typeOptionText}>Engineering</Text>
                <Text style={styles.typeOptionDescription}>
                  For engineering-related projects
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.typeCancelButton}
              onPress={() => setShowTypeSelection(false)}
            >
              <Text style={styles.typeCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Engineering Sub-Type Selection Modal (UI Only) */}
      <Modal
        visible={showEngineeringSubType}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowEngineeringSubType(false)}
      >
        <View style={styles.typeModalOverlay}>
          <View style={styles.typeModalContainer}>
            <Text style={styles.typeModalTitle}>Engineering Type</Text>
            <Text style={styles.typeModalSubtitle}>
              What type of engineering project is this?
            </Text>
            
            <TouchableOpacity
              style={styles.typeOption}
              onPress={() => handleEngineeringSubTypeSelection("hardware")}
            >
              <Ionicons name="hardware-chip" size={32} color="#1b2e4f" />
              <View style={styles.typeOptionContent}>
                <Text style={styles.typeOptionText}>Hardware</Text>
                <Text style={styles.typeOptionDescription}>
                  Physical devices and circuits
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.typeOption}
              onPress={() => handleEngineeringSubTypeSelection("software")}
            >
              <Ionicons name="code-slash" size={32} color="#1b2e4f" />
              <View style={styles.typeOptionContent}>
                <Text style={styles.typeOptionText}>Software</Text>
                <Text style={styles.typeOptionDescription}>
                  Applications and programs
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.typeCancelButton}
              onPress={() => setShowEngineeringSubType(false)}
            >
              <Text style={styles.typeCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1b2e4f",
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  addButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  addButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 32,
    gap: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  retryButton: {
    backgroundColor: "#1b2e4f",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  projectCard: {
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  iconTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f0f4ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  projectName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1b2e4f",
    flex: 1,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f4ff",
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "flex-start",
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#e8ecf0",
    marginVertical: 16,
  },
  descriptionSection: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1b2e4f",
  },
  descriptionText: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
  },
  teamSection: {
    gap: 12,
  },
  teamMemberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e8ecf0",
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1b2e4f",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  memberAvatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  memberEmail: {
    fontSize: 13,
    color: "#666",
  },
  boothSection: {
    gap: 12,
  },
  boothBadge: {
    backgroundColor: "#f0f4ff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#1b2e4f33",
  },
  boothText: {
    fontSize: 16,
    color: "#1b2e4f",
    fontWeight: "600",
  },
  imagesSection: {
    gap: 12,
  },
  imagesScroll: {
    marginTop: 8,
  },
  projectImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: "#f0f4ff",
  },
  linksSection: {
    gap: 12,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e8ecf0",
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  linkContent: {
    flex: 1,
    marginLeft: 12,
  },
  linkTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  linkUrl: {
    fontSize: 12,
    color: "#666",
  },
  ratingSection: {
    gap: 12,
  },
  ratingOverview: {
    paddingVertical: 12,
  },
  ratingValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ratingValue: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1b2e4f",
  },
  ratingCount: {
    fontSize: 14,
    color: "#666",
  },
  feedbackContainer: {
    marginTop: 16,
  },
  noFeedbackText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    marginTop: 12,
    textAlign: "center",
  },
  noFeedbackText: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
    marginTop: 12,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  modalBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1b2e4f",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e8ecf0",
    color: "#333",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  imagePreviewContainer: {
    marginRight: 12,
    position: "relative",
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: "#f0f4ff",
  },
  removeImageButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#1b2e4f",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f4ff",
  },
  addImageText: {
    fontSize: 12,
    color: "#1b2e4f",
    fontWeight: "600",
    marginTop: 4,
  },
  saveButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 40,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  typeModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  typeModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "80%",
    maxWidth: 320,
  },
  typeModalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1b2e4f",
    marginBottom: 8,
    textAlign: "center",
  },
  typeModalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  typeOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  typeOptionContent: {
    marginLeft: 16,
    flex: 1,
  },
  typeOptionText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1b2e4f",
    marginBottom: 2,
  },
  typeOptionDescription: {
    fontSize: 13,
    color: "#666",
  },
  typeCancelButton: {
    padding: 16,
    alignItems: "center",
  },
  typeCancelText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
});

export default ModernProjectContent;
