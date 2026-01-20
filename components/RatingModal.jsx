import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import StarRating from "./StarRating";

/**
 * RatingModal Component
 * Modal for submitting/editing ratings and comments
 *
 * @param {boolean} visible - Whether modal is visible
 * @param {function} onClose - Callback when modal closes
 * @param {function} onSubmit - Callback when rating is submitted
 * @param {function} onDelete - Callback when rating is deleted
 * @param {number} initialRating - Initial rating value
 * @param {string} initialComment - Initial comment value
 * @param {string} title - Modal title
 * @param {boolean} loading - Submission loading state
 */
const RatingModal = ({
  visible = false,
  onClose = () => {},
  onSubmit = () => {},
  onDelete = null,
  initialRating = 0,
  initialComment = "",
  title = "Rate and Review",
  loading = false,
}) => {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment || "");

  // Update state when initial values change
  useEffect(() => {
    setRating(initialRating);
    setComment(initialComment || "");
  }, [initialRating, initialComment]);

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert(
        "Rating Required",
        "Please select a rating before submitting"
      );
      return;
    }

    onSubmit({ rating, comment });
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.ratingSection}>
              <Text style={styles.sectionLabel}>Your Rating</Text>
              <View style={styles.ratingContainer}>
                <StarRating
                  rating={rating}
                  editable={true}
                  onRatingChange={setRating}
                  size={40}
                />
              </View>
              <Text style={styles.ratingHint}>Tap a star to rate</Text>
            </View>

            <View style={styles.commentSection}>
              <Text style={styles.sectionLabel}>
                Your Comment <Text style={styles.optionalText}>(Optional)</Text>
              </Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Share your thoughts..."
                placeholderTextColor="#999"
                value={comment}
                onChangeText={setComment}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.characterCount}>
                {(comment || "").length} / 500 characters
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              {onDelete && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => {
                    Alert.alert(
                      "Delete Rating",
                      "Are you sure you want to delete your rating?",
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "Delete",
                          style: "destructive",
                          onPress: onDelete,
                        },
                      ]
                    );
                  }}
                  disabled={loading}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  loading && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={loading || rating === 0}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? "Submitting..." : "Submit"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  scrollContent: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 20,
    color: "#666",
  },
  ratingSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  optionalText: {
    fontSize: 14,
    fontWeight: "400",
    color: "#999",
  },
  ratingContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  ratingHint: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
  },
  commentSection: {
    marginBottom: 24,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: "#333",
    minHeight: 100,
    backgroundColor: "#FAFAFA",
  },
  characterCount: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F0F0F0",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#FF3B30",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#B0B0B0",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default RatingModal;
