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
import StarRating from "../components/StarRating";
import FeedbackList from "../components/FeedbackList";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getOffering,
  createOffering,
  updateOffering,
} from "../apis/company/Offering";
import { getOfferingFeedback } from "../apis/feedback/Feedback";

const MyOfferingScreen = ({ navigation }) => {
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
      if (result.success && result.data) {
        const photos =
          result.data.offering_photos &&
          Array.isArray(result.data.offering_photos) &&
          result.data.offering_photos.length > 0
            ? result.data.offering_photos
            : result.data.images && Array.isArray(result.data.images)
            ? result.data.images
            : [];

        const offeringData = {
          name: result.data.name || "",
          description: result.data.description || "",
          price: result.data.price || "",
          offering_photos: photos,
          offering_id: result.data.offering_id || null,
          company_id: result.data.company_id || null,
          status: result.data.status || "pending",
        };

        setMyOffering(offeringData);
      } else {
        // Handle case where company doesn't have an offering yet
        if (result.notFound) {
          setMyOffering(null);
        } else {
          setError(result.message || "Failed to fetch offering");
        }
      }
    } catch (error) {
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
    // Show type selection modal first for new offerings
    setShowTypeSelection(true);
  };

  const handleTypeSelection = (type) => {
    setOfferingType(type);
    setOfferingData((prev) => ({ ...prev, type }));
    setShowTypeSelection(false);
    setShowAddOffering(true);
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
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newPhotos = result.assets || [result];
      setOfferingData((prev) => ({
        ...prev,
        offering_photos: [...(prev.offering_photos || []), ...newPhotos],
      }));
    }
  };

  const saveOffering = async () => {
    if (!offeringData.name.trim()) {
      Alert.alert("Error", "Please enter an offering name");
      return;
    }

    // Validate type only for new offerings (not editing)
    if (!editingOffering && !offeringData.type && !offeringType) {
      Alert.alert("Error", "Please select an offering type");
      return;
    }

    try {
      const userId = await AsyncStorage.getItem("userId");

      const offeringPayload = {
        name: offeringData.name.trim(),
        description: offeringData.description.trim(),
        price: offeringData.price?.trim() || "",
        offering_photos: offeringData.offering_photos || [],
        type: offeringData.type || offeringType,
      };

      let result;
      if (editingOffering && myOffering) {
        result = await updateOffering(userId, offeringPayload);
      } else {
        result = await createOffering(userId, offeringPayload);
      }

      if (result.success) {
        Alert.alert(
          "Success",
          editingOffering
            ? "Offering updated successfully!"
            : "Offering added successfully!"
        );

        setMyOffering(result.data);
        setOfferingData({
          name: "",
          description: "",
          price: "",
          offering_photos: [],
        });
        setShowAddOffering(false);
        setEditingOffering(false);

        await fetchMyOffering();
      } else {
        Alert.alert("Error", result.message || "Failed to save offering");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to save offering");
    }
  };

  const editOffering = () => {
    if (myOffering) {
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

      setOfferingData({
        name: myOffering.name || "",
        description: myOffering.description || "",
        price: myOffering.price || "",
        offering_photos: preparedPhotos,
      });
      setEditingOffering(true);
      setShowAddOffering(true);
    }
  };

  const loadFeedbackData = async () => {
    if (!myOffering?.offering_id) {
      console.log("No offering_id available for feedback");
      return;
    }

    try {
      console.log("Loading feedback for offering:", myOffering.offering_id);
      const feedbackResponse = await getOfferingFeedback(
        myOffering.offering_id
      );
      console.log("Offering feedback response:", feedbackResponse);

      if (feedbackResponse.success) {
        const allFeedbackData = feedbackResponse.data.feedback || [];
        const average = feedbackResponse.data.average_rating || 0;
        const count = feedbackResponse.data.total_ratings || 0;

        // Filter to only show feedback with comments (non-empty)
        const feedbackWithComments = allFeedbackData.filter(
          (item) => item.comment && item.comment.trim().length > 0
        );

        console.log("Setting offering feedback:", { 
          total: allFeedbackData.length,
          withComments: feedbackWithComments.length, 
          average, 
          count 
        });
        setAllFeedback(feedbackWithComments);
        setFeedbackStats({
          average: average,
          count: count,
        });
      } else {
        console.log(
          "Offering feedback response not successful:",
          feedbackResponse.message
        );
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
      <Ionicons name="pricetag-outline" size={80} color="#ccc" />
      <Text style={[styles.emptyStateText, { marginTop: 16 }]}>
        No offering found
      </Text>
      <Text style={styles.emptyStateSubtext}>
        Add your company offering to showcase your services or products
      </Text>
      <TouchableOpacity
        style={styles.addOfferingButtonLarge}
        onPress={handleAddOffering}
      >
        <Ionicons name="add-circle" size={24} color="#fff" />
        <Text style={[styles.addOfferingButtonLargeText, { marginLeft: 8 }]}>
          Add Offering
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="alert-circle-outline" size={80} color="#ff6b6b" />
      <Text style={[styles.emptyStateText, { marginTop: 16 }]}>
        Error loading offering
      </Text>
      <Text style={styles.emptyStateSubtext}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchMyOffering}>
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
            <Text style={styles.headerTitle}>My Offering</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.mainColor} />
            <Text style={styles.loadingText}>Loading offering...</Text>
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
          <Text style={styles.headerTitle}>My Offering</Text>
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
            {!myOffering && !error && (
              <TouchableOpacity
                style={styles.addOfferingButton}
                onPress={handleAddOffering}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={[styles.addOfferingText, { marginLeft: 8 }]}>
                  Add Offering
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {error ? (
            renderErrorState()
          ) : myOffering ? (
            <View style={styles.modernOfferingContainer}>
              {/* Header Section with Name and Status */}
              <View style={styles.modernOfferingHeader}>
                <View style={styles.modernOfferingTitleContainer}>
                  <Ionicons
                    name="pricetag"
                    size={28}
                    color={Colors.mainColor}
                  />
                  <Text style={[styles.modernOfferingTitle, { marginLeft: 8 }]}>
                    {myOffering.name}
                  </Text>
                </View>
                <View
                  style={[
                    styles.modernStatusBadge,
                    {
                      backgroundColor:
                        getStatusInfo(myOffering.status).color + "20",
                    },
                  ]}
                >
                  <Ionicons
                    name={getStatusInfo(myOffering.status).icon}
                    size={16}
                    color={getStatusInfo(myOffering.status).color}
                  />
                  <Text
                    style={[
                      styles.modernStatusText,
                      { color: getStatusInfo(myOffering.status).color },
                      { marginLeft: 8 },
                    ]}
                  >
                    {getStatusInfo(myOffering.status).text}
                  </Text>
                </View>
              </View>

              {/* Price Badge */}
              {myOffering.price && (
                <View style={styles.priceBadge}>
                  <Ionicons name="cash" size={20} color={Colors.mainColor} />
                  <Text style={[styles.priceText, { marginLeft: 8 }]}>
                    {myOffering.price}
                  </Text>
                </View>
              )}

              {/* Description Section */}
              {myOffering.description ? (
                <View style={styles.modernOfferingSection}>
                  <View style={styles.modernSectionHeader}>
                    <Ionicons
                      name="document-text"
                      size={20}
                      color={Colors.mainColor}
                    />
                    <Text
                      style={[styles.modernSectionTitle, { marginLeft: 8 }]}
                    >
                      Description
                    </Text>
                  </View>
                  <Text style={styles.modernOfferingDescription}>
                    {myOffering.description}
                  </Text>
                </View>
              ) : null}

              {/* Rating & Feedback Section */}
              <View style={styles.modernOfferingSection}>
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
                  <View style={styles.feedbackSection}>
                    <FeedbackList feedbackList={allFeedback} />
                  </View>
                </View>
              </View>

              {/* Offering Images Gallery */}
              {myOffering.offering_photos?.length > 0 && (
                <View style={styles.modernOfferingSection}>
                  <View style={styles.modernSectionHeader}>
                    <Ionicons
                      name="images"
                      size={20}
                      color={Colors.mainColor}
                    />
                    <Text
                      style={[styles.modernSectionTitle, { marginLeft: 8 }]}
                    >
                      Gallery ({myOffering.offering_photos.length})
                    </Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.modernImageGallery}
                  >
                    {myOffering.offering_photos.map((photo, index) => (
                      <View key={index} style={styles.modernImageCard}>
                        <Image
                          source={{
                            uri: typeof photo === "string" ? photo : photo.uri,
                          }}
                          style={styles.modernOfferingImage}
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

              {/* Edit Button */}
              <TouchableOpacity
                style={styles.modernEditButton}
                onPress={editOffering}
              >
                <Ionicons name="create" size={20} color="#fff" />
                <Text style={[styles.modernEditButtonText, { marginLeft: 8 }]}>
                  Edit Offering
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            renderEmptyState()
          )}
        </ScrollView>

        {/* Add/Edit Offering Modal */}
        <Modal
          visible={showAddOffering}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            setShowAddOffering(false);
            setEditingOffering(false);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingOffering ? "Edit Offering" : "Add Offering"}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowAddOffering(false);
                    setEditingOffering(false);
                  }}
                >
                  <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView 
                showsVerticalScrollIndicator={false}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                <Text style={styles.inputLabel}>Offering Name</Text>
                <TextInput
                  style={styles.input}
                  value={offeringData.name}
                  onChangeText={(text) =>
                    setOfferingData((prev) => ({ ...prev, name: text }))
                  }
                  placeholder="Enter offering name"
                />

                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={offeringData.description}
                  onChangeText={(text) =>
                    setOfferingData((prev) => ({ ...prev, description: text }))
                  }
                  multiline
                  numberOfLines={4}
                  placeholder="Describe your offering"
                />

                <Text style={styles.inputLabel}>Price</Text>
                <TextInput
                  style={styles.input}
                  value={offeringData.price}
                  onChangeText={(text) =>
                    setOfferingData((prev) => ({ ...prev, price: text }))
                  }
                  placeholder="e.g., $99/month or Contact for pricing"
                />

                <Text style={styles.inputLabel}>Offering Images</Text>
                <TouchableOpacity
                  style={styles.uploadImageButton}
                  onPress={pickOfferingImage}
                >
                  <Ionicons
                    name="camera-outline"
                    size={24}
                    color={Colors.mainColor}
                  />
                  <Text style={[styles.uploadImageText, { marginLeft: 8 }]}>
                    {offeringData.offering_photos?.length > 0
                      ? `${offeringData.offering_photos.length} image(s) selected`
                      : "Select Multiple Images"}
                  </Text>
                </TouchableOpacity>

                {offeringData.offering_photos?.length > 0 && (
                  <ScrollView horizontal style={styles.selectedImagesContainer}>
                    {offeringData.offering_photos.map((photo, index) => (
                      <View key={index} style={styles.selectedImageContainer}>
                        <Image
                          source={{ uri: photo.uri || photo }}
                          style={styles.selectedImage}
                        />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() =>
                            setOfferingData((prev) => ({
                              ...prev,
                              offering_photos: prev.offering_photos.filter(
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
                  onPress={saveOffering}
                >
                  <Text style={styles.saveButtonText}>
                    {editingOffering ? "Update Offering" : "Add Offering"}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Offering Type Selection Modal */}
        <Modal
          visible={showTypeSelection}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowTypeSelection(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>What is your offering type?</Text>
                <TouchableOpacity onPress={() => setShowTypeSelection(false)}>
                  <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.typeSelectionContainer}>
                <Text style={styles.typeSelectionSubtitle}>
                  Select your offering type to continue
                </Text>
                
                <TouchableOpacity
                  style={styles.typeOptionButton}
                  onPress={() => handleTypeSelection('sponser')}
                >
                  <View style={styles.typeOptionIcon}>
                    <Ionicons name="trophy" size={40} color={Colors.mainColor} />
                  </View>
                  <Text style={styles.typeOptionTitle}>Sponser</Text>
                  <Text style={styles.typeOptionDescription}>
                    Provide sponsorship opportunities
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.typeOptionButton}
                  onPress={() => handleTypeSelection('service')}
                >
                  <View style={styles.typeOptionIcon}>
                    <Ionicons name="briefcase" size={40} color={Colors.mainColor} />
                  </View>
                  <Text style={styles.typeOptionTitle}>Service</Text>
                  <Text style={styles.typeOptionDescription}>
                    Offer professional services
                  </Text>
                </TouchableOpacity>
              </View>
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
  addOfferingButton: {
    backgroundColor: Colors.mainColor,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addOfferingText: {
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
  addOfferingButtonLarge: {
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
  addOfferingButtonLargeText: {
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
  modernOfferingContainer: {
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
  modernOfferingHeader: {
    marginBottom: 20,
  },
  modernOfferingTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  modernOfferingTitle: {
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
    marginBottom: 12,
  },
  modernStatusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  priceBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4FF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: Colors.mainColor + "30",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.mainColor,
  },
  modernOfferingSection: {
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
  modernOfferingDescription: {
    fontSize: 15,
    color: "#666",
    lineHeight: 24,
    paddingLeft: 28,
  },
  modernImageGallery: {
    marginLeft: 28,
  },
  modernImageCard: {
    position: "relative",
    marginRight: 12,
  },
  modernOfferingImage: {
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
    height: "90%",
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
  feedbackSection: {
    marginTop: 16,
  },
  typeSelectionContainer: {
    padding: 20,
    gap: 16,
  },
  typeSelectionSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  typeOptionButton: {
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    gap: 8,
  },
  typeOptionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.mainColor + "20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  typeOptionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  typeOptionDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});

export default MyOfferingScreen;
