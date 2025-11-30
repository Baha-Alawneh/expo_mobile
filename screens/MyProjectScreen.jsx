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
  StatusBar,
  SafeAreaView,
  Platform,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/constants";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getProject,
  createProject,
  updateProject,
} from "../apis/project/Project";
import { uploadProjectImages } from "../apis/project/ProjectImages";

const MyProjectScreen = ({ navigation }) => {
  const [myProject, setMyProject] = useState(null);
  const [showAddProject, setShowAddProject] = useState(false);
  const [editingProject, setEditingProject] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [projectData, setProjectData] = useState({
    title: "",
    description: "",
    video_url: "",
    project_photos: [],
    github_link: "",
    partner_email: "",
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
      } else {
        // Handle case where user doesn't have a project yet
        if (result.notFound) {
          setMyProject(null);
        } else {
          setError(result.message || "Failed to fetch project");
        }
      }
    } catch (error) {
      setError("An unexpected error occurred");
      setMyProject(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyProject();
  };

  const pickProjectImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "Sorry, we need camera roll permissions to make this work!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newPhotos = result.assets || [result];
      setProjectData((prev) => ({
        ...prev,
        project_photos: [...(prev.project_photos || []), ...newPhotos],
      }));
    }
  };

  const saveProject = async () => {
    if (!projectData.title.trim()) {
      Alert.alert("Error", "Please enter a project title");
      return;
    }

    try {
      const userId = await AsyncStorage.getItem("userId");

      const projectPayload = {
        title: projectData.title.trim(),
        description: projectData.description.trim(),
        video_url: projectData.video_url?.trim() || "",
        github_link: projectData.github_link?.trim() || "",
        partner_email: projectData.partner_email?.trim() || "",
        project_photos: projectData.project_photos || [],
      };

      let result;
      if (editingProject && myProject) {
        result = await updateProject(userId, projectPayload);
      } else {
        result = await createProject(userId, projectPayload);
      }

      if (result.success) {
        if (
          projectData.project_photos &&
          projectData.project_photos.length > 0
        ) {
          try {
            Alert.alert("Uploading", "Uploading project images...");

            const uploadResult = await uploadProjectImages(
              userId,
              projectData.project_photos
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

        setMyProject(result.data);
        setProjectData({
          title: "",
          description: "",
          video_url: "",
          project_photos: [],
          github_link: "",
          partner_email: "",
        });
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
        partner_email: myProject.partner_email || "",
      });
      setEditingProject(true);
      setShowAddProject(true);
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

  useEffect(() => {
    fetchMyProject();
  }, []);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="cube-outline" size={80} color="#ccc" />
      <Text style={styles.emptyStateText}>No project found</Text>
      <Text style={styles.emptyStateSubtext}>
        Add your booth project to showcase your work
      </Text>
      <TouchableOpacity
        style={styles.addProjectButtonLarge}
        onPress={() => {
          setEditingProject(false);
          setProjectData({
            title: "",
            description: "",
            video_url: "",
            project_photos: [],
            github_link: "",
            partner_email: "",
          });
          setShowAddProject(true);
        }}
      >
        <Ionicons name="add-circle" size={24} color="#fff" />
        <Text style={styles.addProjectButtonLargeText}>Add Project</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="alert-circle-outline" size={80} color="#ff6b6b" />
      <Text style={styles.emptyStateText}>Error loading project</Text>
      <Text style={styles.emptyStateSubtext}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchMyProject}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <StatusBar
            barStyle="light-content"
            backgroundColor={Colors.mainColor}
          />
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Project</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.mainColor} />
            <Text style={styles.loadingText}>Loading project...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={Colors.mainColor}
        />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Project</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.mainColor]}
            />
          }
        >
          <View style={styles.sectionHeader}>
            {!myProject && !error && (
              <TouchableOpacity
                style={styles.addProjectButton}
                onPress={() => {
                  setEditingProject(false);
                  setProjectData({
                    title: "",
                    description: "",
                    video_url: "",
                    project_photos: [],
                    github_link: "",
                    partner_email: "",
                  });
                  setShowAddProject(true);
                }}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addProjectText}>Add Project</Text>
              </TouchableOpacity>
            )}
          </View>

          {error ? (
            renderErrorState()
          ) : myProject ? (
            <View style={styles.modernProjectContainer}>
              {/* Header Section with Title and Status */}
              <View style={styles.modernProjectHeader}>
                <View style={styles.modernProjectTitleContainer}>
                  <Ionicons name="cube" size={28} color={Colors.mainColor} />
                  <Text style={styles.modernProjectTitle}>
                    {myProject.title}
                  </Text>
                </View>
                <View
                  style={[
                    styles.modernStatusBadge,
                    {
                      backgroundColor:
                        getStatusInfo(myProject.status).color + "20",
                    },
                  ]}
                >
                  <Ionicons
                    name={getStatusInfo(myProject.status).icon}
                    size={16}
                    color={getStatusInfo(myProject.status).color}
                  />
                  <Text
                    style={[
                      styles.modernStatusText,
                      { color: getStatusInfo(myProject.status).color },
                    ]}
                  >
                    {getStatusInfo(myProject.status).text}
                  </Text>
                </View>
              </View>

              {/* Description Section */}
              {myProject.description ? (
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
                    {myProject.description}
                  </Text>
                </View>
              ) : null}

              {/* Team Members Section */}
              {myProject.students && myProject.students.length > 0 && (
                <View style={styles.modernProjectSection}>
                  <View style={styles.modernSectionHeader}>
                    <Ionicons
                      name="people"
                      size={20}
                      color={Colors.mainColor}
                    />
                    <Text style={styles.modernSectionTitle}>
                      Team Members ({myProject.students.length})
                    </Text>
                  </View>
                  <View style={styles.modernTeamContainer}>
                    {myProject.students.map((student, index) => (
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
              {myProject.booth && (
                <View style={styles.modernProjectSection}>
                  <View style={styles.modernSectionHeader}>
                    <Ionicons
                      name="location"
                      size={20}
                      color={Colors.mainColor}
                    />
                    <Text style={styles.modernSectionTitle}>
                      Booth Location
                    </Text>
                  </View>
                  <View style={styles.boothBadge}>
                    <Text style={styles.boothBadgeText}>{myProject.booth}</Text>
                  </View>
                </View>
              )}

              {/* Project Images Gallery */}
              {myProject.project_photos?.length > 0 && (
                <View style={styles.modernProjectSection}>
                  <View style={styles.modernSectionHeader}>
                    <Ionicons
                      name="images"
                      size={20}
                      color={Colors.mainColor}
                    />
                    <Text style={styles.modernSectionTitle}>
                      Gallery ({myProject.project_photos.length})
                    </Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.modernImageGallery}
                  >
                    {myProject.project_photos.map((photo, index) => (
                      <View key={index} style={styles.modernImageCard}>
                        <Image
                          source={{
                            uri: typeof photo === "string" ? photo : photo.uri,
                          }}
                          style={styles.modernProjectImage}
                          resizeMode="cover"
                        />
                        <View style={styles.imageNumberBadge}>
                          <Text style={styles.imageNumberText}>
                            {index + 1}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Links Section */}
              {(myProject.video_url || myProject.github_link) && (
                <View style={styles.modernProjectSection}>
                  <View style={styles.modernSectionHeader}>
                    <Ionicons name="link" size={20} color={Colors.mainColor} />
                    <Text style={styles.modernSectionTitle}>Project Links</Text>
                  </View>
                  <View style={styles.modernLinksContainer}>
                    {myProject.video_url && (
                      <TouchableOpacity
                        style={styles.modernLinkButton}
                        onPress={() => openLink(myProject.video_url)}
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
                            {myProject.video_url}
                          </Text>
                        </View>
                        <Ionicons name="open-outline" size={20} color="#999" />
                      </TouchableOpacity>
                    )}
                    {myProject.github_link && (
                      <TouchableOpacity
                        style={styles.modernLinkButton}
                        onPress={() => openLink(myProject.github_link)}
                      >
                        <View style={styles.modernLinkIcon}>
                          <Ionicons name="logo-github" size={24} color="#333" />
                        </View>
                        <View style={styles.modernLinkContent}>
                          <Text style={styles.modernLinkTitle}>
                            GitHub Repository
                          </Text>
                          <Text style={styles.modernLinkUrl} numberOfLines={1}>
                            {myProject.github_link}
                          </Text>
                        </View>
                        <Ionicons name="open-outline" size={20} color="#999" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}

              {/* Edit Button */}
              <TouchableOpacity
                style={styles.modernEditButton}
                onPress={editProject}
              >
                <Ionicons name="create" size={20} color="#fff" />
                <Text style={styles.modernEditButtonText}>Edit Project</Text>
              </TouchableOpacity>
            </View>
          ) : (
            renderEmptyState()
          )}
        </ScrollView>

        {/* Add/Edit Project Modal */}
        <Modal
          visible={showAddProject}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setShowAddProject(false);
            setEditingProject(false);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingProject ? "Edit Project" : "Add Project"}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowAddProject(false);
                    setEditingProject(false);
                  }}
                >
                  <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.inputLabel}>Project Title</Text>
                <TextInput
                  style={styles.input}
                  value={projectData.title}
                  onChangeText={(text) =>
                    setProjectData((prev) => ({ ...prev, title: text }))
                  }
                  placeholder="Enter project title"
                />

                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={projectData.description}
                  onChangeText={(text) =>
                    setProjectData((prev) => ({ ...prev, description: text }))
                  }
                  multiline
                  numberOfLines={4}
                  placeholder="Describe your project"
                />

                <Text style={styles.inputLabel}>Demo Video Link</Text>
                <TextInput
                  style={styles.input}
                  value={projectData.video_url}
                  onChangeText={(text) =>
                    setProjectData((prev) => ({ ...prev, video_url: text }))
                  }
                  placeholder="https://your-demo-link.com"
                />

                <Text style={styles.inputLabel}>GitHub Link</Text>
                <TextInput
                  style={styles.input}
                  value={projectData.github_link}
                  onChangeText={(text) =>
                    setProjectData((prev) => ({ ...prev, github_link: text }))
                  }
                  placeholder="https://github.com/username/repo"
                />

                {!editingProject && (
                  <>
                    <Text style={styles.inputLabel}>Partner Email</Text>
                    <TextInput
                      style={styles.input}
                      value={projectData.partner_email}
                      onChangeText={(text) =>
                        setProjectData((prev) => ({
                          ...prev,
                          partner_email: text,
                        }))
                      }
                      placeholder="partner@example.com"
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </>
                )}

                <Text style={styles.inputLabel}>Project Images</Text>
                <TouchableOpacity
                  style={styles.uploadImageButton}
                  onPress={pickProjectImage}
                >
                  <Ionicons
                    name="camera-outline"
                    size={24}
                    color={Colors.mainColor}
                  />
                  <Text style={styles.uploadImageText}>
                    {projectData.project_photos?.length > 0
                      ? `${projectData.project_photos.length} image(s) selected`
                      : "Select Multiple Images"}
                  </Text>
                </TouchableOpacity>

                {projectData.project_photos?.length > 0 && (
                  <ScrollView horizontal style={styles.selectedImagesContainer}>
                    {projectData.project_photos.map((photo, index) => (
                      <View key={index} style={styles.selectedImageContainer}>
                        <Image
                          source={{ uri: photo.uri || photo }}
                          style={styles.selectedImage}
                        />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() =>
                            setProjectData((prev) => ({
                              ...prev,
                              project_photos: prev.project_photos.filter(
                                (_, i) => i !== index
                              ),
                            }))
                          }
                        >
                          <Ionicons name="close" size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                )}

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveProject}
                >
                  <Text style={styles.saveButtonText}>
                    {editingProject ? "Update Project" : "Add Project"}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  sectionHeader: {
    marginBottom: 15,
    alignItems: "flex-end",
  },
  addProjectButton: {
    backgroundColor: Colors.mainColor,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addProjectText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 15,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginBottom: 20,
  },
  addProjectButtonLarge: {
    backgroundColor: Colors.mainColor,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 3,
    shadowColor: Colors.mainColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addProjectButtonLargeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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
  emptyProjectCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyProjectText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 15,
    marginBottom: 8,
  },
  emptyProjectSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
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
  },
  modernMemberCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
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
  },
  modernLinkButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 12,
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
  modernEditButton: {
    backgroundColor: Colors.mainColor,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    elevation: 3,
    shadowColor: Colors.mainColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modernEditButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: "85%",
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginTop: 15,
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 15,
    fontSize: 14,
    color: "#333",
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  uploadImageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4FF",
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.mainColor + "30",
  },
  uploadImageText: {
    color: Colors.mainColor,
    fontSize: 14,
    fontWeight: "600",
  },
  selectedImagesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  selectedImageContainer: {
    position: "relative",
    marginRight: 10,
  },
  selectedImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF5252",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: Colors.mainColor,
    borderRadius: 25,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 25,
    alignItems: "center",
    elevation: 3,
    shadowColor: Colors.mainColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MyProjectScreen;
