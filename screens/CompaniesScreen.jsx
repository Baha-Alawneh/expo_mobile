import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/constants";
import { getAllCompanies } from "../apis/company/Company";
import { getAllOfferings } from "../apis/company/Offering";
import StarRating from "../components/StarRating";

const CompaniesScreen = ({ navigation }) => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState(null); // null, 'name', 'rating'
  const [sortOrder, setSortOrder] = useState("DESC"); // 'ASC' or 'DESC'
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCompanies = async () => {
    try {
      setError(null);

      // Fetch all offerings with sorting
      const offeringsResponse = await getAllOfferings(sortBy, sortOrder);
      console.log("Fetched offerings response:", offeringsResponse);

      if (offeringsResponse.success && offeringsResponse.data) {
        const offeringsData = offeringsResponse.data || [];

        // Log first offering to see structure
        if (offeringsData.length > 0) {
          console.log(
            "First offering raw data:",
            JSON.stringify(offeringsData[0], null, 2)
          );
        }

        // Fetch companies data to merge
        const companiesResponse = await getAllCompanies();
        const companiesMap = new Map(
          (companiesResponse.data || []).map((c) => [c.company_id, c])
        );

        // Merge offering data with company data
        const companiesWithOfferings = offeringsData.map((offering) => {
          const company = companiesMap.get(offering.company_id) || {};
          console.log("Processing offering:", {
            offering_id: offering.offering_id,
            offering_photos: offering.offering_photos,
            images: offering.images,
            has_offering_photos: !!offering.offering_photos,
            offering_photos_length: offering.offering_photos?.length,
          });
          return {
            ...company,
            offering_id: offering.offering_id,
            offering_name: offering.name,
            offering_description: offering.description,
            offering_price: offering.price,
            offering_photos: offering.offering_photos || offering.images || [],
            average_rating: offering.average_rating || 0,
            total_ratings: offering.total_ratings || 0,
          };
        });

        console.log("Companies with offerings:", companiesWithOfferings);
        if (companiesWithOfferings.length > 0) {
          console.log(
            "First merged company offering_photos:",
            companiesWithOfferings[0].offering_photos
          );
        }
        setCompanies(companiesWithOfferings);
      } else if (offeringsResponse.notFound) {
        setCompanies([]);
      } else {
        setError(offeringsResponse.message || "Failed to fetch offerings");
      }
    } catch (err) {
      console.error("Error fetching companies/offerings:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [sortBy, sortOrder]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCompanies();
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
  };

  const changeSortBy = (newSortBy) => {
    if (sortBy === newSortBy) {
      toggleSortOrder();
    } else {
      setSortBy(newSortBy);
      setSortOrder("DESC");
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="business-outline" size={80} color="#ccc" />
      <Text style={styles.emptyStateText}>No companies found</Text>
      <Text style={styles.emptyStateSubtext}>
        Participating companies will appear here
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="alert-circle-outline" size={80} color="#ff6b6b" />
      <Text style={styles.emptyStateText}>Error loading companies</Text>
      <Text style={styles.emptyStateSubtext}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={fetchCompanies}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.mainColor} />
        <Text style={styles.loadingText}>Loading companies...</Text>
      </View>
    );
  }

  if (error) {
    return <View style={styles.container}>{renderErrorState()}</View>;
  }

  // Filter companies based on search query
  const filteredCompanies = companies.filter((company) => {
    if (!searchQuery.trim()) return true;
    const searchLower = searchQuery.toLowerCase();
    const companyName = (company.company_name || "").toLowerCase();
    const offeringName = (company.offering_name || "").toLowerCase();
    return companyName.includes(searchLower) || offeringName.includes(searchLower);
  });

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Company Offerings</Text>
          <Text style={styles.sectionSubtitle}>
            {filteredCompanies.length} offerings
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search companies by name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Sorting Options */}
      <View style={styles.sortingContainer}>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === "name" && styles.sortButtonActive,
          ]}
          onPress={() => changeSortBy("name")}
        >
          <Ionicons
            name="text"
            size={16}
            color={sortBy === "name" ? Colors.mainColor : "#666"}
          />
          <Text
            style={[
              styles.sortButtonText,
              sortBy === "name" && styles.sortButtonTextActive,
            ]}
          >
            Name {sortBy === "name" && (sortOrder === "ASC" ? "↑" : "↓")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === "rating" && styles.sortButtonActive,
          ]}
          onPress={() => changeSortBy("rating")}
        >
          <Ionicons
            name="star"
            size={16}
            color={sortBy === "rating" ? Colors.mainColor : "#666"}
          />
          <Text
            style={[
              styles.sortButtonText,
              sortBy === "rating" && styles.sortButtonTextActive,
            ]}
          >
            Rating {sortBy === "rating" && (sortOrder === "ASC" ? "↑" : "↓")}
          </Text>
        </TouchableOpacity>

        {sortBy && (
          <TouchableOpacity
            style={styles.clearSortButton}
            onPress={() => setSortBy(null)}
          >
            <Ionicons name="close-circle" size={18} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredCompanies}
        keyExtractor={(item) =>
          item.company_id?.toString() || item.id?.toString()
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.mainColor]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        renderItem={({ item }) => {
          // Get the first offering image
          console.log(
            "Offering item:",
            item.company_name,
            "offering_photos:",
            item.offering_photos
          );
          let offeringImage = null;
          if (
            item.offering_photos &&
            Array.isArray(item.offering_photos) &&
            item.offering_photos.length > 0
          ) {
            // Find the first valid image - handle both string URLs and objects with uri property
            const firstPhoto = item.offering_photos.find(
              (photo) => photo && (typeof photo === "string" || photo.uri)
            );

            if (firstPhoto) {
              // If it's an object with uri property, extract it; otherwise use as-is
              offeringImage =
                typeof firstPhoto === "string" ? firstPhoto : firstPhoto.uri;
            }
          }
          console.log("Offering image URL:", offeringImage);

          return (
            <TouchableOpacity
              style={styles.companyCard}
              onPress={() => {
                navigation.navigate("CompanyDetailsScreen", {
                  company: item,
                });
              }}
            >
              <View style={styles.imageContainer}>
                {offeringImage ? (
                  <Image
                    source={{ uri: offeringImage }}
                    style={styles.offeringImage}
                    resizeMode="cover"
                    onError={(e) =>
                      console.log("Image load error:", e.nativeEvent.error)
                    }
                  />
                ) : (
                  <View style={[styles.offeringImage, styles.placeholderImage]}>
                    <Ionicons name="pricetag-outline" size={40} color="#ccc" />
                  </View>
                )}
                {/* Arrow overlay on image */}
                <View style={styles.arrowOverlay}>
                  <Ionicons name="chevron-forward" size={24} color="#000" />
                </View>
              </View>

              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>
                  {item.company_name || "Unnamed Company"}
                </Text>

                {item.offering_name && (
                  <Text style={styles.offeringName} numberOfLines={1}>
                    {item.offering_name}
                  </Text>
                )}

                {item.offering_description && (
                  <Text style={styles.offeringDescription} numberOfLines={2}>
                    {item.offering_description}
                  </Text>
                )}

                {item.offering_price && (
                  <Text style={styles.priceText}>${item.offering_price}</Text>
                )}

                {/* Rating Stars */}
                <View style={styles.ratingContainer}>
                  <StarRating rating={item.average_rating || 0} size={16} />
                  <Text style={styles.ratingText}>
                    {item.average_rating
                      ? item.average_rating.toFixed(1)
                      : "0.0"}
                    {item.total_ratings > 0 && ` (${item.total_ratings})`}
                  </Text>
                </View>

                <View style={styles.companyFooter}>
                  {item.booth_id && (
                    <View style={styles.boothTag}>
                      <Ionicons
                        name="location"
                        size={14}
                        color={Colors.mainColor}
                      />
                      <Text style={styles.boothText}>
                        Booth {item.booth_id}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  listContent: {
    paddingBottom: 20,
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    padding: 0,
  },
  clearButton: {
    padding: 5,
  },
  sortingContainer: {
    flexDirection: "row",
    marginBottom: 15,
    gap: 10,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    gap: 6,
  },
  sortButtonActive: {
    backgroundColor: Colors.mainColor + "15",
    borderColor: Colors.mainColor,
  },
  sortButtonText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  sortButtonTextActive: {
    color: Colors.mainColor,
    fontWeight: "600",
  },
  clearSortButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  companyCard: {
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
  imageContainer: {
    position: "relative",
    width: "100%",
  },
  offeringImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#f0f0f0",
  },
  arrowOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "transparent",
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  companyInfo: {
    padding: 15,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  offeringName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.mainColor,
    marginBottom: 6,
  },
  offeringDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  ratingText: {
    marginLeft: 6,
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  companyFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  boothTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  boothText: {
    fontSize: 14,
    color: Colors.mainColor,
    fontWeight: "600",
    marginLeft: 8,
  },
  boothText: {
    fontSize: 14,
    color: Colors.mainColor,
    fontWeight: "600",
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 15,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 5,
    textAlign: "center",
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
});

export default CompaniesScreen;
