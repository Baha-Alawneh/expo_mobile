import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import StarRating from "./StarRating";

/**
 * FeedbackList Component
 * Displays a list of feedback/reviews with ratings and comments
 *
 * @param {Array} feedbackList - Array of feedback objects
 * @param {boolean} loading - Loading state
 * @param {string} emptyMessage - Message to show when no feedback exists
 */
const FeedbackList = ({
  feedbackList = [],
  loading = false,
  emptyMessage = "No feedback yet",
}) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Helper function to check if comment should be displayed
  const hasValidComment = (comment) => {
    return comment !== null && 
           comment !== undefined && 
           typeof comment === 'string' && 
           comment.trim().length > 0;
  };

  const renderFeedbackItem = (item) => {
    // Safety check for item
    if (!item || !item.feedback_id) {
      return null;
    }

    return (
      <View key={item.feedback_id} style={styles.feedbackCard}>
        <View style={styles.feedbackHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {item.user_name && item.user_name.length > 0 
                  ? item.user_name.charAt(0).toUpperCase() 
                  : "U"}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{item.user_name || "Anonymous"}</Text>
              <Text style={styles.feedbackDate}>
                {item.created_at ? formatDate(item.created_at) : "Unknown date"}
              </Text>
            </View>
          </View>
          <StarRating rating={item.rating || 0} size={18} editable={false} />
        </View>

        {hasValidComment(item.comment) && (
          <View style={styles.commentContainer}>
            <Text style={styles.commentText}>{item.comment.trim()}</Text>
          </View>
        )}

        {item.updated_at && item.created_at && item.updated_at !== item.created_at && (
          <Text style={styles.editedText}>
            Edited {formatDate(item.updated_at)}
          </Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading feedback...</Text>
      </View>
    );
  }

  if (!feedbackList || feedbackList.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollContainer}
      showsVerticalScrollIndicator={true}
      nestedScrollEnabled={true}
    >
      {feedbackList.map((item) => renderFeedbackItem(item))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    maxHeight: 200,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 8,
  },
  feedbackCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  feedbackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 2,
  },
  feedbackDate: {
    fontSize: 12,
    color: "#999",
  },
  commentContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  commentText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  editedText: {
    fontSize: 11,
    color: "#999",
    fontStyle: "italic",
    marginTop: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },
  emptyText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
});

export default FeedbackList;
