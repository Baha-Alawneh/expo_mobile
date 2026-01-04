import React, { useState, useEffect } from "react";
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
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/constants";
import StarRating from "../components/StarRating";
import RatingModal from "../components/RatingModal";
import FeedbackList from "../components/FeedbackList";
import {
  getProjectFeedback,
  getUserProjectFeedback,
  submitProjectFeedback,
} from "../apis/feedback/Feedback";
import { getUserId } from "../utils/auth";

const ProjectDetailsScreen = ({ navigation, route }) => {
  const { project, fromAdmin } = route.params || {};
  
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userFeedback, setUserFeedback] = useState(null);
  const [allFeedback, setAllFeedback] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState({ average: 0, count: 0 });
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (project?.project_id) {
      loadFeedbackData();
      checkOwnership();
    }
  }, [project?.project_id]);

  const checkOwnership = async () => {
    try {
      const userId = await getUserId();
      if (project.students && project.students.length > 0) {
        const isProjectOwner = project.students.some(
          (student) => student.user_id === userId
        );
        setIsOwner(isProjectOwner);
      }
    } catch (error) {
      console.error("Error checking ownership:", error);
    }
  };

  const loadFeedbackData = async () => {
    try {
      setLoadingFeedback(true);

      // Validate project_id before making API calls
      if (!project?.project_id) {
        console.error("Cannot load feedback: project_id is missing");
        return;
      }

      // Get all feedback for the project
      const feedbackResponse = await getProjectFeedback(project.project_id);
      if (feedbackResponse?.success && feedbackResponse?.data) {
        setAllFeedback(Array.isArray(feedbackResponse.data.feedback) ? feedbackResponse.data.feedback : []);
        setFeedbackStats({
          average: feedbackResponse.data.average_rating || 0,
          count: feedbackResponse.data.total_ratings || 0,
        });
      } else {
        // Set defaults if response is invalid
        setAllFeedback([]);
        setFeedbackStats({ average: 0, count: 0 });
      }

      // Get user's own feedback if logged in
      try {
        const userFeedbackResponse = await getUserProjectFeedback(
          project.project_id
        );
        if (userFeedbackResponse?.success && userFeedbackResponse?.data) {
          setUserFeedback(userFeedbackResponse.data);
        } else {
          setUserFeedback(null);
        }
      } catch (error) {
        // User not logged in or hasn't rated yet
        console.log("No user feedback yet");
        setUserFeedback(null);
      }
    } catch (error) {
      console.error("Error loading feedback:", error);
      // Set safe defaults on error
      setAllFeedback([]);
      setFeedbackStats({ average: 0, count: 0 });
      setUserFeedback(null);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleRatingSubmit = async ({ rating, comment }) => {
    try {
      setSubmitting(true);
      
      // Validate project_id before submission
      if (!project?.project_id) {
        Alert.alert("Error", "Invalid project data. Please try again.");
        return;
      }
      
      console.log("📝 Submitting rating:", {
        project_id: project.project_id,
        rating,
        comment: comment || "",
        projectKeys: Object.keys(project),
      });
      
      await submitProjectFeedback(project.project_id, rating, comment || "");
      Alert.alert("Success", "Your rating has been submitted!");
      setShowRatingModal(false);
      
      // Reload feedback with a small delay to ensure backend has processed
      setTimeout(() => {
        loadFeedbackData();
      }, 500);
    } catch (error) {
      console.error("❌ Error submitting rating:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || error.message || "Failed to submit rating"
      );
    } finally {
      setSubmitting(false);
    }
  };

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
          <LinearGradient
            colors={[Colors.mainColor, '#2d4a7c']}
            style={styles.header}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Project Details</Text>
            <View style={{ width: 24 }} />
          </LinearGradient>
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
        <LinearGradient
          colors={[Colors.mainColor, '#2d4a7c']}
          style={styles.header}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Project Details</Text>
          <View style={{ width: 24 }} />
        </LinearGradient>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.modernProjectContainer}>
            {/* Header Section with Title and Status */}
            <View style={styles.modernProjectHeader}>
              <View style={styles.modernProjectTitleContainer}>
                <Ionicons name="cube" size={28} color={Colors.mainColor} />
                <Text style={[styles.modernProjectTitle, { marginLeft: 8 }]}>
                  {project.title}
                </Text>
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
                    {
                      color: getStatusInfo(project.status).color,
                      marginLeft: 8,
                    },
                  ]}
                >
                  {getStatusInfo(project.status).text}
                </Text>
              </View>
            </View>

            {/* Rating Section */}
            {!fromAdmin && (
              <View style={styles.modernProjectSection}>
                <View style={styles.modernSectionHeader}>
                  <Ionicons name="star" size={20} color="#FFD700" />
                  <Text style={[styles.modernSectionTitle, { marginLeft: 8 }]}>
                    Ratings & Reviews
                  </Text>
                </View>
                <View style={styles.ratingContainer}>
                  <View style={styles.ratingOverview}>
                    <Text style={styles.ratingValue}>
                      {feedbackStats.average.toFixed(1)}
                    </Text>
                    <StarRating rating={feedbackStats.average} size={24} />
                    <Text style={styles.ratingCount}>
                      {feedbackStats.count}{" "}
                      {feedbackStats.count === 1 ? "rating" : "ratings"}
                    </Text>
                  </View>
                  {!isOwner && (
                    <TouchableOpacity
                      style={styles.rateButton}
                      onPress={() => setShowRatingModal(true)}
                    >
                      <Ionicons name="star-outline" size={20} color="#fff" />
                      <Text style={styles.rateButtonText}>
                        {userFeedback ? "Edit Rating" : "Rate Project"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
                {isOwner && allFeedback && allFeedback.length > 0 && (
                  <View style={styles.feedbackSection}>
                    <FeedbackList feedbackList={allFeedback} />
                  </View>
                )}
              </View>
            )}

            {/* Description Section */}
            {project.description ? (
              <View style={styles.modernProjectSection}>
                <View style={styles.modernSectionHeader}>
                  <Ionicons
                    name="document-text"
                    size={20}
                    color={Colors.mainColor}
                  />
                  <Text style={[styles.modernSectionTitle, { marginLeft: 8 }]}>
                    Description
                  </Text>
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
                  <Text style={[styles.modernSectionTitle, { marginLeft: 8 }]}>
                    Team Members ({project.students.length})
                  </Text>
                </View>
                <View style={styles.modernTeamContainer}>
                  {project.students.map((student, index) => (
                    <TouchableOpacity
                      key={student.student_id || index}
                      style={styles.modernMemberCard}
                      onPress={() => {
                        // Navigate to student details screen with email only
                        navigation.navigate("StudentDetailsScreen", {
                          email: student.email,
                        });
                      }}
                    >
                      <View style={styles.modernMemberAvatar}>
                        {student.photo_url ? (
                          <Image
                            source={{ uri: student.photo_url }}
                            style={styles.memberAvatarImage}
                          />
                        ) : (
                          <Ionicons name="person" size={24} color="#fff" />
                        )}
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
                        name="chevron-forward"
                        size={20}
                        color={Colors.mainColor}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Booth Information */}
            {!fromAdmin && project.booth && (
              <View style={styles.modernProjectSection}>
                <View style={styles.modernSectionHeader}>
                  <Ionicons
                    name="location"
                    size={20}
                    color={Colors.mainColor}
                  />
                  <Text style={[styles.modernSectionTitle, { marginLeft: 8 }]}>
                    Booth Location
                  </Text>
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
                  <Text style={[styles.modernSectionTitle, { marginLeft: 8 }]}>
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
                  <Text style={[styles.modernSectionTitle, { marginLeft: 8 }]}>
                    Project Links
                  </Text>
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
      <RatingModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleRatingSubmit}
        initialRating={userFeedback?.rating}
        initialComment={userFeedback?.comment}
      />
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
    overflow: "hidden",
  },
  memberAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  ratingContainer: {
    paddingLeft: 28,
    gap: 16,
  },
  ratingOverview: {
    alignItems: "center",
    paddingVertical: 16,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    gap: 8,
  },
  ratingValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#333",
  },
  ratingCount: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  rateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.mainColor,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  rateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  feedbackSection: {
    marginTop: 16,
  },
});

export default ProjectDetailsScreen;
