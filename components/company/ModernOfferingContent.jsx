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
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../../constants/constants";
import StarRating from "../StarRating";
import FeedbackList from "../FeedbackList";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getOffering,
  createOffering,
  updateOffering,
  uploadOfferingImages,
} from "../../apis/company/Offering";
import { getOfferingFeedback } from "../../apis/feedback/Feedback";

const ModernOfferingContent = ({ navigation }) => {
  const [myOffering, setMyOffering] = useState(null);
  const [showAddOffering, setShowAddOffering] = useState(false);
  const [editingOffering, setEditingOffering] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [allFeedback, setAllFeedback] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState({ average: 0, count: 0 });
  const [showTypeSelection, setShowTypeSelection] = useState(false);
  const [offeringType, setOfferingType] = useState("");
  const [offeringData, setOfferingData] = useState({
    name: "",
    description: "",
    price: "",
    offering_photos: [],
    type: "",
  });

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

  const fetchMyOffering = async () => {
    try {
      setError(null);
      const userId = await AsyncStorage.getItem("userId");

      if (!userId) {
        setError("Please login again");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const result = await getOffering(userId);
      console.log("Fetch offering result:", result);
      
      if (result.success && result.data) {
        console.log("Offering data from backend:", result.data);
        console.log("offering_photos from backend:", result.data.offering_photos);
        
        const photos =
          result.data.offering_photos &&
          Array.isArray(result.data.offering_photos) &&
          result.data.offering_photos.length > 0
            ? result.data.offering_photos
            : result.data.images && Array.isArray(result.data.images)
            ? result.data.images
            : [];

        console.log("Processed photos:", photos);

        const offeringData = {
          name: result.data.name || "",
          description: result.data.description || "",
          price: result.data.price || "",
          offering_photos: photos,
          offering_id: result.data.offering_id || null,
          company_id: result.data.company_id || null,
          status: result.data.status || "pending",
          type: result.data.type || "",
        };

        console.log("Setting myOffering to:", offeringData);
        setMyOffering(offeringData);
      } else {
        if (result.notFound) {
          setMyOffering(null);
        } else {
          setError(result.message || "Failed to fetch offering");
        }
      }
    } catch (error) {
      console.error("Error fetching offering:", error);
      setError("An unexpected error occurred");
      setMyOffering(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyOffering();
  };

  const handleAddOffering = () => {
    setEditingOffering(false);
    setOfferingData({
      name: "",
      description: "",
      price: "",
      offering_photos: [],
      type: "",
    });
    setShowTypeSelection(true);
  };

  const handleTypeSelection = (type) => {
    setOfferingType(type);
    setOfferingData((prev) => ({ ...prev, type }));
    setShowTypeSelection(false);
    setShowAddOffering(true);
  };

  const handleEditOffering = () => {
    if (myOffering) {
      // Map offering_photos to objects with uri property
      const preparedPhotos =
        myOffering.offering_photos && Array.isArray(myOffering.offering_photos)
          ? myOffering.offering_photos.map((photo, index) => {
              // Handle both string URLs and objects with uri property
              const photoUrl = typeof photo === "string" ? photo : photo?.uri;

              return {
                uri: photoUrl,
                fileName: photoUrl?.split("/").pop() || `photo_${index}.jpg`,
                type: "image/jpeg",
              };
            })
          : [];

      setEditingOffering(true);
      setOfferingType(myOffering.type || "");
      setOfferingData({
        name: myOffering.name || "",
        description: myOffering.description || "",
        price: myOffering.price || "",
        offering_photos: preparedPhotos,
        type: myOffering.type || "",
      });
      setShowAddOffering(true);
    }
  };

  const pickOfferingImage = async () => {
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
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Filter valid URIs and map to photo objects
      const newPhotos = result.assets
        .map((asset) => asset.uri)
        .filter((uri) => uri && uri.trim() !== "");

      if (newPhotos.length > 0) {
        // Map to photo objects with uri property
        const photoObjects = newPhotos.map((uri, index) => ({
          uri: uri,
          fileName: uri.split("/").pop() || `photo_${index}.jpg`,
          type: "image/jpeg",
        }));

        setOfferingData((prev) => ({
          ...prev,
          offering_photos: [...prev.offering_photos, ...photoObjects],
        }));
      }
    }
  };

  const removeImage = (index) => {
    setOfferingData((prev) => ({
      ...prev,
      offering_photos: prev.offering_photos.filter((_, i) => i !== index),
    }));
  };

  const handleSaveOffering = async () => {
    if (!offeringData.name.trim()) {
      Alert.alert("Error", "Please enter offering name");
      return;
    }

    // Validate type only for new offerings (not editing)
    if (!editingOffering && !offeringData.type && !offeringType) {
      Alert.alert("Error", "Please select an offering type");
      return;
    }

    try {
      const userId = await AsyncStorage.getItem("userId");

      if (!userId) {
        Alert.alert("Error", "Please login again");
        return;
      }

      // Separate old (existing HTTP URLs) and new (local file URIs) images
      const oldImages = (offeringData.offering_photos || []).filter(
        (photo) => photo && photo.uri && photo.uri.startsWith("http")
      );
      
      const newImagesToUpload = (offeringData.offering_photos || []).filter(
        (photo) => photo && photo.uri && !photo.uri.startsWith("http")
      );

      // Don't send image objects in the create/update payload
      const offeringPayload = {
        name: offeringData.name.trim(),
        description: offeringData.description?.trim() || "",
        price: offeringData.price?.trim() || "",
      };

      // Only add type for new offerings, not when editing
      if (!editingOffering) {
        offeringPayload.type = offeringData.type || offeringType;
      }

      let result;
      if (editingOffering && myOffering) {
        result = await updateOffering(userId, offeringPayload);
      } else {
        result = await createOffering(userId, offeringPayload);
      }

      if (result.success) {
        // Handle image updates
        if (editingOffering) {
          // Extract S3 keys from old HTTP URLs that should be kept
          const oldImagesToKeep = oldImages.map(photo => {
            const url = photo.uri;
            // Extract S3 key from signed URL (after amazonaws.com/)
            const match = url.match(/amazonaws\.com\/(.+?)(\?|$)/);
            return match ? decodeURIComponent(match[1]) : null;
          }).filter(Boolean);
          
          console.log("Old images to keep (S3 keys):", oldImagesToKeep);
          console.log("New images to upload:", newImagesToUpload.length);
          
          // Always upload if there are changes (new images or removed images)
          const hasImageChanges = newImagesToUpload.length > 0 || 
                                  (myOffering.offering_photos && 
                                   oldImages.length !== myOffering.offering_photos.length);
          
          if (hasImageChanges || newImagesToUpload.length > 0 || oldImagesToKeep.length > 0) {
            try {
              if (newImagesToUpload.length > 0 || oldImagesToKeep.length < (myOffering.offering_photos?.length || 0)) {
                Alert.alert("Uploading", "Updating offering images...");

                const uploadResult = await uploadOfferingImages(
                  userId,
                  newImagesToUpload,
                  oldImagesToKeep
                );

                if (uploadResult.success) {
                  Alert.alert("Success", "Offering and images updated successfully!");
                } else {
                  Alert.alert(
                    "Warning",
                    "Offering saved but image upload failed: " + uploadResult.message
                  );
                }
              } else {
                Alert.alert("Success", "Offering updated successfully!");
              }
            } catch (error) {
              console.error("Image upload error:", error);
              Alert.alert(
                "Warning",
                "Offering saved but image upload failed: " + error.message
              );
            }
          } else {
            Alert.alert("Success", "Offering updated successfully!");
          }
        } else {
          // Creating new offering
          if (newImagesToUpload.length > 0) {
            try {
              Alert.alert("Uploading", "Uploading offering images...");

              const uploadResult = await uploadOfferingImages(
                userId,
                newImagesToUpload,
                []
              );

              if (uploadResult.success) {
                Alert.alert("Success", "Offering and images added successfully!");
              } else {
                Alert.alert(
                  "Warning",
                  "Offering saved but image upload failed: " + uploadResult.message
                );
              }
            } catch (error) {
              console.error("Image upload error:", error);
              Alert.alert(
                "Warning",
                "Offering saved but image upload failed: " + error.message
              );
            }
          } else {
            Alert.alert("Success", "Offering added successfully!");
          }
        }

        // Safely set offering data
        if (result.data) {
          setMyOffering(result.data);
        }
        
        setOfferingData({
          name: "",
          description: "",
          price: "",
          offering_photos: [],
          type: "",
        });
        setShowAddOffering(false);
        setEditingOffering(false);

        await fetchMyOffering();
      } else {
        Alert.alert("Error", result.message || "Failed to save offering");
      }
    } catch (error) {
      console.error("Save offering error:", error);
      Alert.alert("Error", error.message || "An unexpected error occurred");
    }
  };

  const loadFeedbackData = async () => {
    if (!myOffering?.offering_id) {
      return;
    }

    try {
      const feedbackResponse = await getOfferingFeedback(myOffering.offering_id);

      if (feedbackResponse.success) {
        const allFeedbackData = feedbackResponse.data.feedback || [];
        const average = feedbackResponse.data.average_rating || 0;
        const count = feedbackResponse.data.total_ratings || 0;

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
      console.error("Error loading offering feedback:", error);
    }
  };

  useEffect(() => {
    fetchMyOffering();
  }, []);

  useEffect(() => {
    if (myOffering?.offering_id) {
      loadFeedbackData();
    }
  }, [myOffering?.offering_id]);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="pricetag-outline" size={80} color="#ccc" />
      </View>
      <Text style={styles.emptyStateTitle}>No Offering Yet</Text>
      <Text style={styles.emptyStateText}>
        Showcase your company's services or products by adding an offering
      </Text>
      <TouchableOpacity style={styles.addButton} onPress={handleAddOffering}>
        <LinearGradient
          colors={["#1b2e4f", "#2a4575"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.addButtonGradient}
        >
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add Offering</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="alert-circle-outline" size={80} color="#FF5252" />
      </View>
      <Text style={styles.emptyStateTitle}>Error Loading Offering</Text>
      <Text style={styles.emptyStateText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchMyOffering}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1b2e4f" />
        <Text style={styles.loadingText}>Loading offering...</Text>
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
        ) : myOffering ? (
          <View style={styles.offeringCard}>
            {/* Header with Edit Button */}
            <View style={styles.cardHeader}>
              <View style={styles.titleRow}>
                <View style={styles.iconTitleContainer}>
                  <View style={styles.iconCircle}>
                    <Ionicons name="pricetag" size={24} color="#1b2e4f" />
                  </View>
                  <Text style={styles.offeringName}>{myOffering.name}</Text>
                </View>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={handleEditOffering}
                >
                  <Ionicons name="create-outline" size={20} color="#1b2e4f" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Price Section */}
            {myOffering.price && (
              <>
                <View style={styles.priceSection}>
                  <Ionicons name="cash-outline" size={20} color="#1b2e4f" />
                  <Text style={styles.priceLabel}>Price:</Text>
                  <Text style={styles.priceValue}>{myOffering.price}</Text>
                </View>
                <View style={styles.divider} />
              </>
            )}

            {/* Description Section */}
            {myOffering.description && (
              <>
                <View style={styles.descriptionSection}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="document-text-outline" size={20} color="#1b2e4f" />
                    <Text style={styles.sectionTitle}>Description</Text>
                  </View>
                  <Text style={styles.descriptionText}>{myOffering.description}</Text>
                </View>
                <View style={styles.divider} />
              </>
            )}

            {/* Images Section */}
            {myOffering.offering_photos && myOffering.offering_photos.length > 0 && (
              <>
                <View style={styles.imagesSection}>
                  <View style={styles.sectionHeader}>
                    <Ionicons name="images-outline" size={20} color="#1b2e4f" />
                    <Text style={styles.sectionTitle}>Photos</Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.imagesScroll}
                  >
                    {myOffering.offering_photos
                      .filter((photo) => photo && (typeof photo === 'string' || photo.uri))
                      .map((photo, index) => {
                        const imageUri = typeof photo === 'string' ? photo : photo.uri;
                        return (
                          <Image
                            key={index}
                            source={{ uri: imageUri }}
                            style={styles.offeringImage}
                          />
                        );
                      })}
                  </ScrollView>
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

      {/* Add/Edit Offering Modal */}
      <Modal
        visible={showAddOffering}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowAddOffering(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient
            colors={["#1b2e4f", "#2a4575"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.modalHeader}
          >
            <TouchableOpacity
              onPress={() => setShowAddOffering(false)}
              style={styles.modalBackButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingOffering ? "Edit Offering" : "Add Offering"}
            </Text>
            <View style={{ width: 40 }} />
          </LinearGradient>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter offering name"
                value={offeringData.name}
                onChangeText={(text) =>
                  setOfferingData((prev) => ({ ...prev, name: text }))
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter offering description"
                value={offeringData.description}
                onChangeText={(text) =>
                  setOfferingData((prev) => ({ ...prev, description: text }))
                }
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Price</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter price (e.g., $100)"
                value={offeringData.price}
                onChangeText={(text) =>
                  setOfferingData((prev) => ({ ...prev, price: text }))
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Photos</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {offeringData.offering_photos?.map((photo, index) => {
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
                  onPress={pickOfferingImage}
                >
                  <Ionicons name="camera" size={32} color="#1b2e4f" />
                  <Text style={styles.addImageText}>Add Photo</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveOffering}>
              <LinearGradient
                colors={["#1b2e4f", "#2a4575"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.saveButtonGradient}
              >
                <Text style={styles.saveButtonText}>
                  {editingOffering ? "Update Offering" : "Create Offering"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Type Selection Modal */}
      <Modal
        visible={showTypeSelection}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowTypeSelection(false)}
      >
        <View style={styles.typeModalOverlay}>
          <View style={styles.typeModalContainer}>
            <Text style={styles.typeModalTitle}>What is your offering type?</Text>
            <Text style={styles.typeModalSubtitle}>
              Select your offering type to continue
            </Text>
            
            <TouchableOpacity
              style={styles.typeOption}
              onPress={() => handleTypeSelection("sponser")}
            >
              <Ionicons name="trophy" size={32} color="#1b2e4f" />
              <View style={styles.typeOptionContent}>
                <Text style={styles.typeOptionText}>Sponsor</Text>
                <Text style={styles.typeOptionDescription}>
                  Provide sponsorship opportunities
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.typeOption}
              onPress={() => handleTypeSelection("service")}
            >
              <Ionicons name="briefcase" size={32} color="#1b2e4f" />
              <View style={styles.typeOptionContent}>
                <Text style={styles.typeOptionText}>Service</Text>
                <Text style={styles.typeOptionDescription}>
                  Offer professional services
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
    backgroundColor: "#f5f7fa",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    marginBottom: 24,
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
    lineHeight: 24,
    marginBottom: 32,
  },
  addButton: {
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  addButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 12,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
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
  offeringCard: {
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
  offeringName: {
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
  priceSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1b2e4f",
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
  imagesSection: {
    gap: 12,
  },
  imagesScroll: {
    marginTop: 8,
  },
  offeringImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: "#f0f4ff",
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

export default ModernOfferingContent;
