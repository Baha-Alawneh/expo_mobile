import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/constants";
import StarRating from "../components/StarRating";
import RatingModal from "../components/RatingModal";
import FeedbackList from "../components/FeedbackList";
import { getOfferingsByCompanyId } from "../apis/company/Offering";
import {
  getOfferingFeedback,
  getUserOfferingFeedback,
  submitOfferingFeedback,
} from "../apis/feedback/Feedback";
import { getUserId } from "../utils/auth";
import { BASE_URL } from "../constants/config";
import { getAuthHeaders } from "../utils/auth";

const CompanyDetailsScreen = ({ navigation, route }) => {
  const { company, fromAdmin } = route.params || {};
  const [offerings, setOfferings] = useState([]);
  const [loadingOffering, setLoadingOffering] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedOffering, setSelectedOffering] = useState(null);
  const [userFeedback, setUserFeedback] = useState(null);
  const [allFeedback, setAllFeedback] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState({ average: 0, count: 0 });
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (company && company.company_id) {
      fetchOffering();
    } else {
      setLoadingOffering(false);
    }
  }, [company]);

  useEffect(() => {
    if (offerings.length > 0 && offerings[0]?.offering_id) {
      loadFeedbackData();
      checkOwnership();
    }
  }, [offerings]);

  const checkOwnership = async () => {
    try {
      const userId = await getUserId();
      setIsOwner(company?.user_id === userId);
    } catch (error) {
      console.error("Error checking ownership:", error);
    }
  };

  const loadFeedbackData = async () => {
    if (offerings.length === 0) return;

    try {
      // Fetch feedback for all offerings (entity_type='offer')
      const allFeedbackPromises = offerings.map(offering => 
        getOfferingFeedback(offering.offering_id)
      );
      const feedbackResponses = await Promise.all(allFeedbackPromises);

      // Aggregate all feedback
      let allFeedbackData = [];
      let totalRating = 0;
      let totalCount = 0;

      feedbackResponses.forEach(response => {
        if (response.success && response.data) {
          const feedback = response.data.feedback || [];
          allFeedbackData = [...allFeedbackData, ...feedback];
          
          // Aggregate ratings
          const offeringAvg = response.data.average_rating || 0;
          const offeringCount = response.data.total_ratings || 0;
          totalRating += offeringAvg * offeringCount;
          totalCount += offeringCount;
        }
      });

      setAllFeedback(allFeedbackData);
      setFeedbackStats({
        average: totalCount > 0 ? totalRating / totalCount : 0,
        count: totalCount,
      });

      // Check if user has rated any offering (skip for guests)
      const isGuest = await AsyncStorage.getItem("isGuest");
      if (isGuest !== "true") {
        const userId = await getUserId();
        let userRating = null;
        for (const offering of offerings) {
          try {
            const userFeedbackResponse = await getUserOfferingFeedback(offering.offering_id);
            if (userFeedbackResponse.success && userFeedbackResponse.data) {
              userRating = userFeedbackResponse.data;
              break; // Found user's rating
            }
          } catch (error) {
            // Continue checking other offerings
          }
        }
        setUserFeedback(userRating);
      } else {
        // Guest user - no personal feedback
        setUserFeedback(null);
      }
    } catch (error) {
      console.error("Error loading feedback:", error);
    }
  };

  const handleRatingSubmit = async ({ rating, comment }) => {
    try {
      // Submit feedback for the first offering as a proxy for rating the company
      if (!offerings[0]?.offering_id) {
        Alert.alert("Error", "Unable to submit rating at this time.");
        return;
      }
      
      await submitOfferingFeedback(offerings[0].offering_id, rating, comment);
      setShowRatingModal(false);
      loadFeedbackData();
    } catch (error) {
      console.error("Error submitting rating:", error);
      Alert.alert("Error", "Failed to submit rating. Please try again.");
    }
  };

  const handleDeleteRating = async () => {
    try {
      if (!userFeedback?.feedback_id) {
        Alert.alert("Error", "Unable to delete rating at this time.");
        return;
      }

      const response = await fetch(
        `${BASE_URL}/feedback/${userFeedback.feedback_id}`,
        {
          method: "DELETE",
          headers: await getAuthHeaders(),
        }
      );

      const result = await response.json();
      if (result.success) {
        Alert.alert("Success", "Your rating has been deleted.");
        setShowRatingModal(false);
        loadFeedbackData();
      } else {
        Alert.alert("Error", result.message || "Failed to delete rating.");
      }
    } catch (error) {
      console.error("Error deleting rating:", error);
      Alert.alert("Error", "Failed to delete rating. Please try again.");
    }
  };

  const fetchOffering = async () => {
    try {
      setLoadingOffering(true);
      const result = await getOfferingsByCompanyId(company.company_id);
      if (result.success && result.data) {
        setOfferings(Array.isArray(result.data) ? result.data : [result.data]);
      }
    } catch (error) {
      console.log("Error fetching offering:", error);
    } finally {
      setLoadingOffering(false);
    }
  };

  const openLink = async (url) => {
    if (!url) return;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.log("Error opening link:", error);
    }
  };

  if (!company) {
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
            <Text style={styles.headerTitle}>Company Profile</Text>
            <View style={{ width: 24 }} />
          </LinearGradient>
          <View style={styles.centerContainer}>
            <Ionicons name="business-outline" size={80} color="#CCC" />
            <Text style={styles.errorText}>No company data available</Text>
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
          <Text style={styles.headerTitle}>Company Profile</Text>
          <View style={{ width: 24 }} />
        </LinearGradient>

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* 1️⃣ FIRST CARD: Company Header */}
          <View style={styles.headerCard}>
            <View style={styles.companyImageContainer}>
              {company.profile_image_url ? (
                <Image
                  source={{ uri: company.profile_image_url }}
                  style={styles.companyImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Ionicons name="business" size={60} color="#CCC" />
                </View>
              )}
            </View>
            <Text style={styles.companyName}>
              {company.company_name || "Unnamed Company"}
            </Text>
            {company.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{company.category}</Text>
              </View>
            )}
          </View>

          {/* 2️⃣ SECOND CARD: Company Information */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Ionicons
                name="information-circle"
                size={24}
                color={Colors.mainColor}
              />
              <Text style={[styles.cardTitle, { marginLeft: 8 }]}>
                Company Information
              </Text>
            </View>

            {/* Description */}
            {company.description ? (
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>Description</Text>
                <Text style={styles.infoValue}>{company.description}</Text>
              </View>
            ) : null}

            {/* Phone */}
            {company.phone ? (
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>Phone</Text>
                <View style={styles.infoRow}>
                  <Ionicons name="call" size={18} color={Colors.mainColor} />
                  <Text style={[styles.infoValueWithIcon, { marginLeft: 8 }]}>
                    {company.phone}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Email */}
            {company.email ? (
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>Email</Text>
                <View style={styles.infoRow}>
                  <Ionicons name="mail" size={18} color={Colors.mainColor} />
                  <Text style={[styles.infoValueWithIcon, { marginLeft: 8 }]}>
                    {company.email}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Website URL */}
            {company.website_url ? (
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>Website</Text>
                <TouchableOpacity
                  style={styles.websiteButton}
                  onPress={() => openLink(company.website_url)}
                >
                  <Ionicons name="globe" size={18} color={Colors.mainColor} />
                  <Text
                    style={[styles.websiteText, { marginLeft: 8 }]}
                    numberOfLines={1}
                  >
                    {company.website_url}
                  </Text>
                  <Ionicons
                    name="open-outline"
                    size={16}
                    color={Colors.mainColor}
                  />
                </TouchableOpacity>
              </View>
            ) : null}

            {/* Address */}
            {company.address ? (
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>Address</Text>
                <View style={styles.infoRow}>
                  <Ionicons
                    name="location"
                    size={18}
                    color={Colors.mainColor}
                  />
                  <Text style={[styles.infoValueWithIcon, { marginLeft: 8 }]}>
                    {company.address}
                  </Text>
                </View>
              </View>
            ) : null}

            {/* Booth Number */}
            {company.booth_id ? (
              <View style={styles.infoSection}>
                <Text style={styles.infoLabel}>Booth Number</Text>
                <View style={styles.boothBadge}>
                  <Ionicons
                    name="storefront"
                    size={18}
                    color={Colors.mainColor}
                  />
                  <Text style={styles.boothText}>Booth {company.booth_id}</Text>
                </View>
              </View>
            ) : null}
          </View>

          {/* 3️⃣ THIRD CARD: Ratings & Reviews */}
          {!fromAdmin && offerings.length > 0 && (
            <View style={styles.ratingsCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="star" size={24} color={Colors.mainColor} />
                <Text style={[styles.cardTitle, { marginLeft: 8 }]}>
                  Ratings & Reviews
                </Text>
              </View>

              <View style={styles.ratingOverviewCard}>
                <View style={styles.ratingValueContainer}>
                  <Text style={styles.ratingValueLarge}>
                    {feedbackStats.average.toFixed(1)}
                  </Text>
                  <StarRating rating={feedbackStats.average} size={28} />
                  <Text style={styles.ratingCountLarge}>
                    {feedbackStats.count}{" "}
                    {feedbackStats.count === 1 ? "rating" : "ratings"}
                  </Text>
                </View>

                {!isOwner && (
                  <TouchableOpacity
                    style={styles.rateButtonLarge}
                    onPress={async () => {
                      // Check if user is a guest
                      const AsyncStorage = require("@react-native-async-storage/async-storage").default;
                      const guestStatus = await AsyncStorage.getItem("isGuest");
                      
                      if (guestStatus === "true") {
                        Alert.alert(
                          "Login Required",
                          "Please log in or create an account to rate this company.",
                          [
                            {
                              text: "Cancel",
                              style: "cancel"
                            },
                            {
                              text: "Login",
                              onPress: async () => {
                                await AsyncStorage.removeItem("isGuest");
                                await AsyncStorage.removeItem("userType");
                                navigation.reset({
                                  index: 0,
                                  routes: [{ name: "Login" }],
                                });
                              }
                            }
                          ]
                        );
                        return;
                      }
                      
                      setShowRatingModal(true);
                    }}
                  >
                    <Ionicons name="star-outline" size={22} color="#fff" />
                    <Text style={styles.rateButtonTextLarge}>
                      {userFeedback ? "Edit Rating" : "Rate Company"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Feedback List */}
              {isOwner && allFeedback.length > 0 && (
                <View style={styles.feedbackListSection}>
                  <FeedbackList feedbackList={allFeedback} />
                </View>
              )}

              {!isOwner && allFeedback.length === 0 && (
                <Text style={styles.noReviewsText}>No reviews yet</Text>
              )}
              {isOwner && allFeedback.length === 0 && (
                <Text style={styles.noReviewsText}>No reviews yet</Text>
              )}
            </View>
          )}

          {/* 4️⃣ FOURTH CARD: Company Offerings */}
          <View style={styles.offeringCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="gift" size={24} color={Colors.mainColor} />
              <Text style={[styles.cardTitle, { marginLeft: 8 }]}>
                Company Offerings {offerings.length > 0 && `(${offerings.length})`}
              </Text>
            </View>

            {loadingOffering ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.mainColor} />
                <Text style={styles.loadingText}>Loading offerings...</Text>
              </View>
            ) : offerings.length > 0 ? (
              <View>
                {offerings.map((offering, offeringIndex) => (
                  <View key={offering.offering_id || offeringIndex} style={offeringIndex > 0 && styles.offeringDivider}>
                    {offerings.length > 1 && (
                      <Text style={styles.offeringNumber}>Offering {offeringIndex + 1}</Text>
                    )}
                    
                    {/* Offer Name/Title */}
                    {offering.name && (
                      <View style={styles.offeringSection}>
                        <Text style={styles.offeringLabel}>Offer Name</Text>
                        <Text style={styles.offeringName}>{offering.name}</Text>
                      </View>
                    )}

                    {/* Offer Description */}
                    {offering.description && (
                      <View style={styles.offeringSection}>
                        <Text style={styles.offeringLabel}>Description</Text>
                        <Text style={styles.offeringDescription}>
                          {offering.description}
                        </Text>
                      </View>
                    )}

                    {/* Price */}
                    {offering.price && (
                      <View style={styles.offeringSection}>
                        <Text style={styles.offeringLabel}>Price</Text>
                        <View style={styles.priceBadge}>
                          <Ionicons
                            name="pricetag"
                            size={18}
                            color={Colors.mainColor}
                          />
                          <Text style={[styles.priceText, { marginLeft: 8 }]}>
                            {offering.price}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* All Offer Images */}
                    {offering.offering_photos &&
                      offering.offering_photos.length > 0 && (
                        <View style={styles.offeringSection}>
                          <Text style={styles.offeringLabel}>
                            Images ({offering.offering_photos.length})
                          </Text>
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.imagesScroll}
                          >
                            {offering.offering_photos.map((photo, index) => (
                              <View key={index} style={styles.imageContainer}>
                                <Image
                                  source={{
                                    uri:
                                      typeof photo === "string" ? photo : photo.uri,
                                  }}
                                  style={styles.offeringImage}
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
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noOfferingContainer}>
                <Ionicons
                  name="information-circle-outline"
                  size={50}
                  color="#CCC"
                />
                <Text style={styles.noOfferingText}>
                  This company hasn't added any offerings yet
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
      <RatingModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSubmit={handleRatingSubmit}
        onDelete={userFeedback ? handleDeleteRating : null}
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
  },
  contentContainer: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 15,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    marginTop: 15,
    textAlign: "center",
  },

  // 1️⃣ FIRST CARD: Company Header
  headerCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  companyImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    overflow: "hidden",
    borderWidth: 4,
    borderColor: Colors.mainColor,
  },
  companyImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  placeholderImage: {
    width: 110,
    height: 110,
    justifyContent: "center",
    alignItems: "center",
  },
  companyName: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: "#F0F4FF",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.mainColor + "40",
  },
  categoryText: {
    fontSize: 15,
    color: Colors.mainColor,
    fontWeight: "600",
  },

  // 2️⃣ SECOND CARD: Company Information
  infoCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  
  // 3️⃣ THIRD CARD: Ratings & Reviews
  ratingsCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  ratingOverviewCard: {
    marginTop: 15,
    paddingVertical: 20,
    paddingHorizontal: 15,
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    alignItems: "center",
  },
  ratingValueContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  ratingValueLarge: {
    fontSize: 48,
    fontWeight: "bold",
    color: Colors.mainColor,
    marginBottom: 8,
  },
  ratingCountLarge: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  rateButtonLarge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.mainColor,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 10,
  },
  rateButtonTextLarge: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  feedbackListSection: {
    marginTop: 20,
  },
  noReviewsText: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
    fontStyle: "italic",
    marginTop: 15,
  },
  
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#F0F0F0",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  infoSection: {
    marginBottom: 18,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoValueWithIcon: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  websiteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4FF",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.mainColor + "30",
  },
  websiteText: {
    flex: 1,
    fontSize: 14,
    color: Colors.mainColor,
    fontWeight: "600",
  },
  boothBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4FF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: Colors.mainColor + "30",
  },
  boothText: {
    fontSize: 15,
    color: Colors.mainColor,
    fontWeight: "600",
  },

  // 3️⃣ THIRD CARD: Company Offering
  offeringCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 30,
  },
  offeringSection: {
    marginBottom: 18,
  },
  offeringLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  offeringName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  offeringDescription: {
    fontSize: 15,
    color: "#555",
    lineHeight: 24,
  },
  priceBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "#FFB74D",
  },
  priceText: {
    fontSize: 16,
    color: "#F57C00",
    fontWeight: "bold",
  },
  imagesScroll: {
    marginHorizontal: -5,
  },
  imageContainer: {
    position: "relative",
    marginHorizontal: 5,
  },
  offeringImage: {
    width: 220,
    height: 160,
    borderRadius: 15,
    backgroundColor: "#F5F5F5",
  },
  imageNumberBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  imageNumberText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
  noOfferingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noOfferingText: {
    fontSize: 15,
    color: "#999",
    marginTop: 15,
    textAlign: "center",
  },
  ratingContainer: {
    gap: 16,
    marginTop: 12,
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
  offeringDivider: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  offeringNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.mainColor,
    marginBottom: 16,
  },
});

export default CompanyDetailsScreen;
