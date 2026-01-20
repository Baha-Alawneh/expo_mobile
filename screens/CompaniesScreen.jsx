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
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/constants";
import { getApprovedCompanies } from "../apis/company/Company";
import StarRating from "../components/StarRating";

const CompaniesScreen = ({ navigation }) => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState(null); // null, 'name', 'rating'
  const [sortOrder, setSortOrder] = useState("DESC"); // 'ASC' or 'DESC'

  const fetchCompanies = async () => {
    try {
      setError(null);

      // Fetch only approved companies with sorting
      const companiesResponse = await getApprovedCompanies(sortBy, sortOrder);
      console.log("Fetched approved companies response:", companiesResponse);

      if (companiesResponse.success && companiesResponse.data) {
        setCompanies(companiesResponse.data || []);
      } else {
        setError(companiesResponse.message || "Failed to fetch companies");
      }
    } catch (err) {
      console.error("Error fetching companies:", err);
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
        Approved companies will appear here
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
    const description = (company.description || "").toLowerCase();
    const address = (company.address || "").toLowerCase();
    return (
      companyName.includes(searchLower) ||
      description.includes(searchLower) ||
      address.includes(searchLower)
    );
  });

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Companies</Text>
          <Text style={styles.sectionSubtitle}>
            {filteredCompanies.length} approved {filteredCompanies.length === 1 ? 'company' : 'companies'}
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search companies..."
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
        keyExtractor={(item) => item.company_id?.toString() || item.id?.toString()}
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
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.companyCard}
            onPress={() => {
              navigation.navigate("CompanyDetailsScreen", {
                company: item,
              });
            }}
          >
            {/* Company Image */}
            <View style={styles.imageContainer}>
              {item.profile_image_url ? (
                <Image
                  source={{ uri: item.profile_image_url }}
                  style={styles.companyImage}
                  resizeMode="cover"
                  onError={(e) =>
                    console.log("Image load error:", e.nativeEvent.error)
                  }
                />
              ) : (
                <View style={[styles.companyImage, styles.placeholderImage]}>
                  <Ionicons name="business" size={40} color="#ccc" />
                </View>
              )}
              {/* Arrow overlay on image */}
              <View style={styles.arrowOverlay}>
                <Ionicons name="chevron-forward" size={24} color="#000" />
              </View>
            </View>

            {/* Company Info */}
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>
                {item.company_name || "Unnamed Company"}
              </Text>

              {item.description && (
                <Text style={styles.companyDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              )}

              {item.address && (
                <View style={styles.addressContainer}>
                  <Ionicons name="location" size={14} color="#666" />
                  <Text style={styles.addressText} numberOfLines={1}>
                    {item.address}
                  </Text>
                </View>
              )}

              {/* Rating */}
              <View style={styles.ratingContainer}>
                <StarRating rating={item.average_rating || 0} size={16} />
                <Text style={styles.ratingText}>
                  {item.average_rating && !isNaN(item.average_rating)
                    ? Number(item.average_rating).toFixed(1)
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
                {item.type && (
                  <View style={styles.typeTag}>
                    <Text style={styles.typeText}>{item.type}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
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
    alignItems: "center",
    marginBottom: 15,
    gap: 10,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    gap: 6,
  },
  sortButtonActive: {
    backgroundColor: "#F0F4FF",
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
    padding: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  ratingText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
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
  companyImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#f0f0f0",
  },
  arrowOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
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
  companyDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 6,
  },
  addressText: {
    fontSize: 13,
    color: "#666",
    flex: 1,
  },
  companyFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
    fontSize: 13,
    color: Colors.mainColor,
    fontWeight: "600",
    marginLeft: 4,
  },
  typeTag: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  typeText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
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
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
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
