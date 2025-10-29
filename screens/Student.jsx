import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  StatusBar,
  SafeAreaView,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/constants";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import ProjectsScreen from "./ProjectsScreen";
import CompaniesScreen from "./CompaniesScreen";
import MapScreen from "./MapScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStudentData, postStudentData } from "../apis/student/Student";
import {
  getProject,
  createProject,
  updateProject,
} from "../apis/project/Project";
import { uploadStudentFiles } from "../apis/student/StudentFiles";
import { uploadProjectImages } from "../apis/project/ProjectImages";
import { BASE_URL } from "../constants/config";

const Student = () => {
  // States
  const [activeTab, setActiveTab] = useState("profile");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [newSkill, setNewSkill] = useState("");
  const [editingProject, setEditingProject] = useState(false);
  const [projectData, setProjectData] = useState({
    title: "",
    description: "",
    video_url: "",
    project_photos: [],
    github_link: "",
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

  // Mock student data
  const [studentData, setStudentData] = useState({
    name: "",
    photo: "",
    email: "",
    major: "",
    year: "",
    skills: [],
    bio: "",
    cv: "",
    project: {
      title: "",
      booth: "A-12",
    },
  });

  // Mock project data (single project)
  const [myProject, setMyProject] = useState({
    title: "",
    description: "",
    video_url: "",
    github_link: "",
    project_photos: [],
  });

  // Mock notifications
  const notifications = [
    {
      id: 1,
      type: "approval",
      title: "Project Approved!",
      message:
        'Your project "Smart Campus Navigator" has been approved for the exhibition.',
      time: "2 hours ago",
      read: false,
      icon: "checkmark-circle",
      iconColor: "#4CAF50",
    },
    {
      id: 2,
      type: "message",
      title: "New Message",
      message:
        "Tech Solutions Co. is interested in your project and sent you a message.",
      time: "5 hours ago",
      read: false,
      icon: "mail",
      iconColor: Colors.mainColor,
    },

    {
      id: 4,
      type: "info",
      title: "Expo Reminder",
      message: "TEDI-Expo starts in 3 days. Make sure your booth is ready!",
      time: "2 days ago",
      read: true,
      icon: "information-circle",
      iconColor: "#FF9800",
    },
  ];

  const pickImage = async () => {
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
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, // Reduced quality to 0.5 to reduce file size for better upload success
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0];

      try {
        const userId = await AsyncStorage.getItem("userId");

        if (!userId) {
          Alert.alert("Error", "User ID not found. Please login again.");
          return;
        }

        console.log("=== Photo Upload Debug ===");
        console.log("User ID:", userId);
        console.log("Photo URI:", selectedImage.uri);
        console.log("Photo width:", selectedImage.width);
        console.log("Photo height:", selectedImage.height);
        console.log("Photo file size:", selectedImage.fileSize);
        console.log(
          "API URL:",
          `${BASE_URL}/students/profile/${userId}/upload`
        );
        console.log("BASE_URL:", BASE_URL);
        console.log("========================");

        // Show loading alert
        Alert.alert("Uploading", "Please wait, uploading your photo...", [
          { text: "Cancel", onPress: () => console.log("Upload cancelled") },
        ]);

        // Upload to S3 immediately
        const uploadResult = await uploadStudentFiles(userId, {
          photo: selectedImage,
        });

        console.log("Upload result:", uploadResult);

        if (uploadResult.success) {
          // Update state with S3 URL
          setStudentData((prev) => ({
            ...prev,
            photo: uploadResult.data.photo_url,
            photo_url: uploadResult.data.photo_url,
            photo_name: uploadResult.data.photo_name,
          }));

          Alert.alert("Success", "Photo uploaded successfully!");
        } else {
          Alert.alert(
            "Upload Failed",
            uploadResult.message || "Failed to upload photo"
          );
        }
      } catch (error) {
        console.error("Error uploading photo:", error);

        let errorMessage = "Failed to upload photo";

        // Check for specific error types
        if (error.message.includes("Network request failed")) {
          errorMessage =
            "Network Error: Cannot connect to server.\n\nPlease check:\n1. Backend server is running\n2. Your device is on the same network\n3. Server IP address is correct: " +
            BASE_URL;
        } else if (error.message.includes("timeout")) {
          errorMessage =
            "Upload timeout. Please check your internet connection and try again.";
        } else if (error.message) {
          errorMessage = error.message;
        }

        Alert.alert("Upload Error", errorMessage);
      }
    }
  };

  const pickCV = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const selectedCV = result.assets[0];

        // Show loading alert
        Alert.alert("Uploading", "Uploading your CV...");

        try {
          const userId = await AsyncStorage.getItem("userId");

          // Upload to S3 immediately
          const uploadResult = await uploadStudentFiles(userId, {
            cv: selectedCV,
          });

          if (uploadResult.success) {
            // Update state with S3 URL
            setStudentData((prev) => ({
              ...prev,
              cv: uploadResult.data.cv_name
                ? uploadResult.data.cv_name.split("/").pop()
                : selectedCV.name,
              cv_url: uploadResult.data.cv_url,
              cv_name: uploadResult.data.cv_name,
              cvUri: null, // Clear local URI
            }));

            Alert.alert("Success", "CV uploaded successfully!");
          } else {
            Alert.alert("Error", uploadResult.message || "Failed to upload CV");
          }
        } catch (error) {
          console.error("Error uploading CV:", error);
          Alert.alert("Error", "Failed to upload CV: " + error.message);
        }
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick CV file");
    }
  };

  const downloadCV = async () => {
    if (!studentData.cv && !studentData.cv_url) {
      Alert.alert("No CV", "No CV file available to download");
      return;
    }

    try {
      // If there's a cv_url (from S3), open it in browser
      if (studentData.cv_url) {
        const { Linking } = require("react-native");
        const canOpen = await Linking.canOpenURL(studentData.cv_url);
        if (canOpen) {
          await Linking.openURL(studentData.cv_url);
        } else {
          Alert.alert("Error", "Cannot open CV URL");
        }
      }
      // If there's a local cvUri, use Sharing API
      else if (studentData.cvUri) {
        const { default: Sharing } = await import("expo-sharing");
        const isAvailable = await Sharing.isAvailableAsync();

        if (isAvailable) {
          await Sharing.shareAsync(studentData.cvUri);
        } else {
          Alert.alert("Info", "Sharing not available on this device");
        }
      } else {
        Alert.alert("Info", `CV: ${studentData.cv}`);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to download CV");
      console.error("CV download error:", error);
    }
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setStudentData((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (index) => {
    setStudentData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
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
      allowsMultipleSelection: true, // Enable multiple selection
      allowsEditing: false, // Disable editing when selecting multiple
      quality: 0.8,
      selectionLimit: 10, // Limit to 10 images
    });

    if (!result.canceled && result.assets) {
      // Add all selected images to the project_photos array
      setProjectData((prev) => ({
        ...prev,
        project_photos: [...(prev.project_photos || []), ...result.assets],
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
        project_photos: projectData.project_photos || [],
      };

      let result;
      if (editingProject && myProject) {
        // Update existing project
        result = await updateProject(userId, projectPayload);
      } else {
        // Create new project
        result = await createProject(userId, projectPayload);
      }

      if (result.success) {
        // Upload images if any were selected
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
            console.error("Error uploading images:", error);
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

        // Reset form and refresh
        setMyProject(result.data);
        setProjectData({
          title: "",
          description: "",
          video_url: "",
          project_photos: [],
          github_link: "",
        });
        setShowAddProject(false);
        setEditingProject(false);

        // Refresh project data to get updated images
        await fetchMyProject();
      } else {
        Alert.alert("Error", result.message || "Failed to save project");
      }
    } catch (error) {
      console.error("Error saving project:", error);
      Alert.alert("Error", "Failed to save project");
    }
  };

  const editProject = () => {
    if (myProject) {
      // Prepare project_photos in the format expected by ImagePicker
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
      });
      setEditingProject(true);
      setShowAddProject(true);
    }
  };

  const renderMyProjectSection = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>My Project</Text>
        {!myProject && (
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
              });
              setShowAddProject(true);
            }}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addProjectText}>Add Project</Text>
          </TouchableOpacity>
        )}
      </View>

      {myProject ? (
        <TouchableOpacity style={styles.projectCard} onPress={editProject}>
          <View style={styles.projectCardHeader}>
            <Text style={styles.projectCardTitle}>{myProject.title}</Text>
            <View style={styles.projectStatusContainer}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusInfo(myProject.status).color },
                ]}
              />
              <Text
                style={[
                  styles.projectStatusText,
                  { color: getStatusInfo(myProject.status).color },
                ]}
              >
                {getStatusInfo(myProject.status).text}
              </Text>
            </View>
          </View>

          <Text style={styles.projectCardDescription}>
            {myProject.description}
          </Text>

          {myProject.project_photos?.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.projectImagesContainer}
            >
              {myProject.project_photos.map((photo, index) => (
                <Image
                  key={index}
                  source={{
                    uri: typeof photo === "string" ? photo : photo.uri,
                  }}
                  style={styles.projectImage}
                />
              ))}
            </ScrollView>
          )}

          {myProject.video_url ? (
            <View style={styles.demoButton}>
              <Ionicons
                name="link-outline"
                size={16}
                color={Colors.mainColor}
              />
              <Text style={styles.demoButtonText}>View Demo</Text>
            </View>
          ) : null}

          <View style={styles.editProjectHint}>
            <Ionicons
              name="create-outline"
              size={16}
              color={Colors.mainColor}
            />
            <Text style={styles.editProjectHintText}>Tap to edit</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.emptyProjectCard}>
          <Ionicons name="cube-outline" size={60} color="#CCC" />
          <Text style={styles.emptyProjectText}>No project added yet</Text>
          <Text style={styles.emptyProjectSubtext}>
            Add your booth project to showcase your work
          </Text>
        </View>
      )}
    </ScrollView>
  );

  const renderProfileSection = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: studentData.photo }}
            style={styles.profileImageLarge}
          />
          <View style={styles.statusIndicator} />
        </View>
        <Text style={styles.profileNameLarge}>{studentData.name}</Text>
        <Text style={styles.profileMajor}>
          {studentData.major} • {studentData.year}
        </Text>
        <Text style={styles.profileEmail}>{studentData.email}</Text>
      </View>

      {/* Project Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="cube-outline" size={24} color={Colors.mainColor} />
          <Text style={styles.cardTitle}>My Project</Text>
        </View>
        <Text style={styles.projectTitle}>
          {studentData.project?.title || "No project"}
        </Text>
      </View>

      {/* Skills Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons
            name="code-slash-outline"
            size={24}
            color={Colors.mainColor}
          />
          <Text style={styles.cardTitle}>Skills</Text>
        </View>
        <View style={styles.skillsContainer}>
          {studentData.skills?.map((skill, index) => (
            <View key={index} style={styles.skillChip}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Bio Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="person-outline" size={24} color={Colors.mainColor} />
          <Text style={styles.cardTitle}>About Me</Text>
        </View>
        <Text style={styles.bioText}>{studentData.bio}</Text>
      </View>

      {/* CV Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons
            name="document-text-outline"
            size={24}
            color={Colors.mainColor}
          />
          <Text style={styles.cardTitle}>Curriculum Vitae</Text>
        </View>
        <TouchableOpacity style={styles.cvButton} onPress={downloadCV}>
          <Ionicons
            name={
              studentData.cv || studentData.cv_name
                ? "download-outline"
                : "document-outline"
            }
            size={20}
            color={
              studentData.cv || studentData.cv_name ? Colors.mainColor : "#999"
            }
          />
          <Text
            style={[
              styles.cvButtonText,
              !(studentData.cv || studentData.cv_name) &&
                styles.cvButtonTextDisabled,
            ]}
          >
            {studentData.cv || studentData.cv_name
              ? "Download CV"
              : "No CV uploaded"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => setShowEditProfile(true)}
      >
        <Ionicons name="create-outline" size={20} color="#fff" />
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
  // student data handlers
  const handleFetchStudentData = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");

      if (!userId) {
        Alert.alert("Error", "User ID not found. Please login again.");
        return;
      }

      const result = await getStudentData(userId);
      console.log("Fetched student data:", result); // Debug log

      // Handle unauthorized (401) error
      if (result.unauthorized) {
        Alert.alert("Session Expired", "Please login again.");
        // TODO: Navigate to login screen
        return;
      }

      if (result.success && result.data) {
        const fetchedData = result.data;
        setStudentData((prev) => ({
          ...prev,
          name: fetchedData.name || prev.name,
          email: fetchedData.email || prev.email,
          major: fetchedData.major || prev.major,
          year: fetchedData.year_of_study || fetchedData.year || prev.year,
          skills: Array.isArray(fetchedData.skills)
            ? fetchedData.skills
            : typeof fetchedData.skills === "string"
            ? JSON.parse(fetchedData.skills)
            : prev.skills,
          bio: fetchedData.bio || prev.bio,
          // Use photo_url from S3 if available, otherwise keep placeholder
          photo: fetchedData.photo_url || prev.photo,
          photo_url: fetchedData.photo_url || prev.photo_url,
          photo_name: fetchedData.photo_name || prev.photo_name,
          // Use cv_name for display if available
          cv: fetchedData.cv_name
            ? fetchedData.cv_name.split("/").pop()
            : prev.cv,
          cv_url: fetchedData.cv_url || prev.cv_url,
          cv_name: fetchedData.cv_name || prev.cv_name,
          project: fetchedData.project || prev.project,
        }));
      } else {
        console.warn("Failed to fetch student data:", result.message);
        Alert.alert("Error", result.message || "Failed to load profile data");
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      Alert.alert("Error", "An error occurred while loading your profile");
    }
  };

  const fetchMyProject = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      const result = await getProject(userId);
      console.log("Fetched project data:", result.data); // Debug log
      if (result.success && result.data) {
        // Backend returns both 'images' and 'project_photos' (as signed URLs)
        // Use project_photos if available (signed URLs), otherwise use images
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
          status: result.data.status || "pending",
          booth: result.data.booth || "",
          created_at: result.data.created_at || null,
          project_id: result.data.project_id || result.data.id || null,
          student_id: result.data.student_id || null,
        };
        console.log("Normalized project data:", projectData); // Debug log
        setMyProject(projectData);
      } else {
        // No project found
        setMyProject(null);
        console.log("No project found for user");
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      setMyProject(null);
    }
  };

  const handleUpdateStudentData = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");

      const result = await postStudentData(userId, studentData);

      if (result.success) {
        console.log("Student data updated successfully:", result.data);
        setStudentData((prev) => ({
          ...prev,
          ...result.data,
          project: result.data.project || prev.project,
        }));
      } else {
        console.warn("Failed to update student data:", result.message);
        alert("Update failed: " + result.message);
      }
    } catch (error) {
      console.error("Error updating student data:", error);
      alert("Error updating student data: " + error.message);
    }
  };

  //useEffects
  useEffect(() => {
    handleFetchStudentData();
    fetchMyProject();
  }, []);
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={Colors.mainColor}
        />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <Image
                source={{
                  uri:
                    studentData.photo ||
                    studentData.photo_url ||
                    "https://via.placeholder.com/150",
                }}
                style={styles.headerPhoto}
              />
              <View>
                <Text style={styles.headerGreeting}>Welcome back,</Text>
                <Text style={styles.headerName}>
                  {studentData.name
                    ? studentData.name.split(" ")[0]
                    : "Student"}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.notificationButton}
              onPress={() => setShowNotifications(true)}
            >
              <Ionicons name="notifications-outline" size={28} color="#fff" />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScroll}
          >
            <TouchableOpacity
              style={[styles.tab, activeTab === "profile" && styles.activeTab]}
              onPress={() => setActiveTab("profile")}
            >
              <Ionicons
                name={activeTab === "profile" ? "person" : "person-outline"}
                size={20}
                color={activeTab === "profile" ? "#fff" : Colors.mainColor}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "profile" && styles.activeTabText,
                ]}
              >
                Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "myprojects" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("myprojects")}
            >
              <Ionicons
                name={activeTab === "myprojects" ? "folder" : "folder-outline"}
                size={20}
                color={activeTab === "myprojects" ? "#fff" : Colors.mainColor}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "myprojects" && styles.activeTabText,
                ]}
              >
                My Project
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "students" && styles.activeTab]}
              onPress={() => setActiveTab("students")}
            >
              <Ionicons
                name={
                  activeTab === "students" ? "briefcase" : "briefcase-outline"
                }
                size={20}
                color={activeTab === "students" ? "#fff" : Colors.mainColor}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "students" && styles.activeTabText,
                ]}
              >
                Other Projects
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
        {activeTab === "profile" && renderProfileSection()}
        {activeTab === "myprojects" && renderMyProjectSection()}
        {activeTab === "students" && <ProjectsScreen />}
        {activeTab === "companies" && <CompaniesScreen />}
        {activeTab === "map" && (
          <MapScreen
            studentProject={
              myProject?.title || studentData.project?.title || "No Project"
            }
          />
        )}

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

        {/* Notifications Modal */}
        <Modal
          visible={showNotifications}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowNotifications(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Notifications</Text>
                <TouchableOpacity onPress={() => setShowNotifications(false)}>
                  <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {notifications.map((notification) => (
                  <TouchableOpacity
                    key={notification.id}
                    style={[
                      styles.notificationItem,
                      !notification.read && styles.unreadNotification,
                    ]}
                    onPress={() => {
                      // Mark as read logic
                      setUnreadCount(Math.max(0, unreadCount - 1));
                    }}
                  >
                    <View
                      style={[
                        styles.notificationIconContainer,
                        { backgroundColor: notification.iconColor + "20" },
                      ]}
                    >
                      <Ionicons
                        name={notification.icon}
                        size={24}
                        color={notification.iconColor}
                      />
                    </View>
                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationTitle}>
                        {notification.title}
                      </Text>
                      <Text style={styles.notificationMessage}>
                        {notification.message}
                      </Text>
                      <Text style={styles.notificationTime}>
                        {notification.time}
                      </Text>
                    </View>
                    {!notification.read && <View style={styles.unreadDot} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Edit Profile Modal */}
        <Modal
          visible={showEditProfile}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowEditProfile(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <TouchableOpacity onPress={() => setShowEditProfile(false)}>
                  <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                  style={styles.editPhotoContainer}
                  onPress={pickImage}
                >
                  <Image
                    source={{
                      uri:
                        studentData.photo ||
                        studentData.photo_url ||
                        "https://via.placeholder.com/150",
                    }}
                    style={styles.editPhoto}
                  />
                  <View style={styles.editPhotoButton}>
                    <Ionicons name="camera" size={20} color="#fff" />
                  </View>
                </TouchableOpacity>

                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={studentData.name}
                  onChangeText={(text) =>
                    setStudentData((prev) => ({ ...prev, name: text }))
                  }
                />

                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={studentData.email}
                  editable={false}
                />

                <Text style={styles.inputLabel}>Major</Text>
                <TextInput
                  style={styles.input}
                  value={studentData.major}
                  onChangeText={(text) =>
                    setStudentData((prev) => ({ ...prev, major: text }))
                  }
                />

                <Text style={styles.inputLabel}>Year of Study</Text>
                <TextInput
                  style={styles.input}
                  value={studentData.year}
                  onChangeText={(text) =>
                    setStudentData((prev) => ({ ...prev, year: text }))
                  }
                  placeholder="e.g., 3rd Year"
                />

                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={studentData.bio}
                  onChangeText={(text) =>
                    setStudentData((prev) => ({ ...prev, bio: text }))
                  }
                  multiline
                  numberOfLines={4}
                />

                <Text style={styles.inputLabel}>Skills</Text>
                <View style={styles.skillsEditor}>
                  <View style={styles.skillsList}>
                    {studentData.skills?.map((skill, index) => (
                      <View key={index} style={styles.skillItemWithRemove}>
                        <Text style={styles.skillItemText}>{skill}</Text>
                        <TouchableOpacity onPress={() => removeSkill(index)}>
                          <Ionicons
                            name="close-circle"
                            size={20}
                            color="#FF5252"
                          />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>

                  <View style={styles.addSkillContainer}>
                    <TextInput
                      style={styles.skillInput}
                      value={newSkill}
                      onChangeText={setNewSkill}
                      placeholder="Enter a skill"
                      onSubmitEditing={addSkill}
                    />
                    <TouchableOpacity
                      style={styles.addSkillButton}
                      onPress={addSkill}
                    >
                      <Ionicons name="add" size={24} color={Colors.mainColor} />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.inputLabel}>Curriculum Vitae</Text>
                <TouchableOpacity
                  style={styles.cvUploadButton}
                  onPress={pickCV}
                >
                  <Ionicons
                    name="cloud-upload-outline"
                    size={20}
                    color={Colors.mainColor}
                  />
                  <Text style={styles.cvUploadButtonText}>
                    {studentData.cv || "Upload CV (PDF)"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={async () => {
                    await handleUpdateStudentData();
                    // Refresh the profile to get latest S3 URLs
                    await handleFetchStudentData();
                    setShowEditProfile(false);
                    Alert.alert("Success", "Profile updated successfully!");
                  }}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
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
    paddingTop: Platform.OS === "ios" ? 10 : 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
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
  headerPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: "#fff",
    marginRight: 12,
  },
  headerGreeting: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.9,
  },
  headerName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  notificationButton: {
    position: "relative",
    padding: 5,
  },
  notificationBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#FF5252",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.mainColor,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  tabContainer: {
    backgroundColor: "#fff",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    gap: 6,
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
  tabContent: {
    flex: 1,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
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
  profileHeader: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 15,
  },
  profileImageLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: Colors.mainColor,
  },
  statusIndicator: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4CAF50",
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileNameLarge: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  profileMajor: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: "#999",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  boothTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  boothText: {
    fontSize: 14,
    color: Colors.mainColor,
    fontWeight: "600",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  skillChip: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.mainColor + "30",
  },
  skillText: {
    color: Colors.mainColor,
    fontSize: 14,
    fontWeight: "600",
  },
  bioText: {
    fontSize: 15,
    color: "#555",
    lineHeight: 24,
  },
  cvButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4FF",
    padding: 15,
    borderRadius: 10,
  },
  cvButtonText: {
    color: Colors.mainColor,
    fontSize: 14,
    fontWeight: "600",
  },
  cvButtonTextDisabled: {
    color: "#999",
  },
  cvUploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4FF",
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.mainColor + "30",
  },
  cvUploadButtonText: {
    color: Colors.mainColor,
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  editButton: {
    backgroundColor: Colors.mainColor,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 10,
    marginBottom: Platform.OS === "ios" ? 40 : 20,
    gap: 8,
    elevation: 3,
    shadowColor: Colors.mainColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  editButtonText: {
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
  notificationItem: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    gap: 12,
    alignItems: "flex-start",
  },
  unreadNotification: {
    backgroundColor: "#F0F8FF",
  },
  notificationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: "#999",
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.mainColor,
    marginTop: 5,
  },
  editPhotoContainer: {
    alignSelf: "center",
    marginVertical: 20,
    position: "relative",
  },
  editPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: Colors.mainColor,
  },
  editPhotoButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.mainColor,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
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
  skillsEditor: {
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: Colors.mainColor + "40",
    borderRadius: 10,
    padding: 15,
    backgroundColor: "#F8F9FA",
  },
  skillsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 15,
  },
  skillItemWithRemove: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.mainColor + "30",
  },
  skillItemText: {
    color: Colors.mainColor,
    fontSize: 14,
    fontWeight: "600",
  },
  addSkillContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  skillInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  addSkillButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.mainColor,
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
  editProjectHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    gap: 6,
  },
  editProjectHintText: {
    color: Colors.mainColor,
    fontSize: 14,
    fontWeight: "600",
  },
  addProjectButton: {
    backgroundColor: Colors.mainColor,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  addProjectText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  projectCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  projectCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  projectCardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    marginRight: 10,
  },
  projectStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  projectStatusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  projectCardDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 15,
  },
  projectImagesContainer: {
    marginBottom: 15,
  },
  projectImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  demoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 10,
    gap: 6,
  },
  demoButtonText: {
    color: Colors.mainColor,
    fontSize: 14,
    fontWeight: "600",
  },
  uploadImageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4FF",
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    gap: 10,
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
  notificationItem: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
    gap: 12,
    alignItems: "flex-start",
  },
  unreadNotification: {
    backgroundColor: "#F0F8FF",
  },
  notificationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: "#999",
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.mainColor,
    marginTop: 5,
  },
});

export default Student;
