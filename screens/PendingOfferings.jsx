import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getOfferingsByStatus,
  updateOfferingStatus,
} from "../apis/admin/Admin";

const { width } = Dimensions.get("window");

const PendingOfferings = ({ navigation, onBack }) => {
  const [activeTab, setActiveTab] = useState("pending");
  const [offerings, setOfferings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [offeringToReject, setOfferingToReject] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchOfferings();
  }, [activeTab]);

  const fetchOfferings = async () => {
    setLoading(true);
    const response = await getOfferingsByStatus(activeTab);
    if (response.success) {
      setOfferings(response.data);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOfferings();
    setRefreshing(false);
  };

  const handleApprove = (offering) => {
    Alert.alert(
      "Approve Offering",
      `Are you sure you want to approve "${offering.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          style: "default",
          onPress: () => updateStatus(offering.offering_id, "approved"),
        },
      ]
    );
  };

  const handleReject = (offering) => {
    setOfferingToReject(offering);
    setRejectionReason("");
    setShowRejectionModal(true);
  };

  const confirmRejection = () => {
    if (!rejectionReason.trim()) {
      Alert.alert("Required", "Please provide a rejection reason");
      return;
    }
    setShowRejectionModal(false);
    updateStatus(offeringToReject.offering_id, "rejected", rejectionReason);
  };

  const updateStatus = async (offeringId, status, rejection_reason = null) => {
    setProcessingId(offeringId);
    const response = await updateOfferingStatus(offeringId, status, rejection_reason);

    if (response.success) {
      Alert.alert("Success", response.message);
      // Remove the offering from the list
      setOfferings(offerings.filter((o) => o.offering_id !== offeringId));
    } else {
      Alert.alert("Error", response.message);
    }
    setProcessingId(null);
  };

  const OfferingCard = ({ offering }) => {
    const isProcessing = processingId === offering.offering_id;

    // Get the first image - check both offering_photos and images
    let offeringImage = null;
    const photos = offering.offering_photos || offering.images || [];
    
    console.log('Offering:', offering.name);
    console.log('offering_photos:', offering.offering_photos);
    console.log('images:', offering.images);
    console.log('photos array:', photos);
    
    if (Array.isArray(photos) && photos.length > 0) {
      const firstPhoto = photos[0];
      console.log('First photo:', firstPhoto);
      // Check if it's a string (URL) or object
      if (typeof firstPhoto === "string") {
        offeringImage = firstPhoto;
      } else if (firstPhoto && firstPhoto.uri) {
        offeringImage = firstPhoto.uri;
      }
    }
    
    console.log('Final offeringImage:', offeringImage);

    return (
      <TouchableOpacity
        style={styles.offeringCard}
        onPress={() => {
          navigation.navigate("CompanyDetailsScreen", {
            company: {
              company_id: offering.company_id,
              company_name: offering.company_name,
              email: offering.company_email,
              profile_image_url: offering.profile_image_url,
            },
            fromAdmin: true,
          });
        }}
        activeOpacity={0.7}
      >
        {/* Offering Image - Full Width at Top */}
        {offeringImage ? (
          <Image
            source={{ uri: offeringImage }}
            style={styles.offeringImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.offeringImage, styles.placeholderImage]}>
            <Ionicons name="image-outline" size={40} color="#ccc" />
          </View>
        )}

        {/* Offering Info Below Image */}
        <View style={styles.offeringInfo}>
          {/* Title with Price */}
          <View style={styles.titleRow}>
            <Text style={styles.offeringTitle} numberOfLines={2}>
              {offering.name}
            </Text>
            {offering.price && (
              <View style={styles.priceTag}>
                <Text style={styles.priceText}>${offering.price}</Text>
              </View>
            )}
          </View>

          {/* Company Name */}
          <Text style={styles.companyName} numberOfLines={1}>
            {offering.company_name}
          </Text>

          {/* Description */}
          <Text style={styles.offeringDescription} numberOfLines={2}>
            {offering.description}
          </Text>

          {/* Action Buttons */}
          {activeTab === "pending" && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.rejectButton, isProcessing && styles.buttonDisabled]}
                onPress={(e) => {
                  e.stopPropagation();
                  handleReject(offering);
                }}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#FF7675" />
                ) : (
                  <>
                    <Ionicons name="close-circle" size={20} color="#FF7675" />
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.approveButton, isProcessing && styles.buttonDisabled]}
                onPress={(e) => {
                  e.stopPropagation();
                  handleApprove(offering);
                }}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                    <Text style={styles.approveButtonText}>Approve</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
          
          {/* Status Badge for Approved/Rejected */}
          {activeTab !== "pending" && (
            <View style={styles.statusBadgeContainer}>
              <View style={[
                styles.statusBadge,
                activeTab === "approved" ? styles.approvedBadge : styles.rejectedBadge
              ]}>
                <Ionicons 
                  name={activeTab === "approved" ? "checkmark-circle" : "close-circle"} 
                  size={16} 
                  color="#FFF" 
                />
                <Text style={styles.statusBadgeText}>
                  {activeTab === "approved" ? "Approved" : "Rejected"}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Chevron Icon */}
        <Ionicons
          name="chevron-forward"
          size={24}
          color="#B2BEC3"
          style={styles.chevronIcon}
        />
      </TouchableOpacity>
    );
  };

  if (loading && offerings.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack || (() => navigation.goBack())}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#2D3436" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Offerings</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{offerings.length}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "pending" && styles.activeTab]}
          onPress={() => setActiveTab("pending")}
        >
          <Text style={[styles.tabText, activeTab === "pending" && styles.activeTabText]}>
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "approved" && styles.activeTab]}
          onPress={() => setActiveTab("approved")}
        >
          <Text style={[styles.tabText, activeTab === "approved" && styles.activeTabText]}>
            Approved
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "rejected" && styles.activeTab]}
          onPress={() => setActiveTab("rejected")}
        >
          <Text style={[styles.tabText, activeTab === "rejected" && styles.activeTabText]}>
            Rejected
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search offerings by name..."
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

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6C5CE7"]}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6C5CE7" />
          </View>
        ) : (() => {
          // Filter offerings based on search query
          const filteredOfferings = offerings.filter((offering) => {
            if (!searchQuery.trim()) return true;
            const searchLower = searchQuery.toLowerCase();
            const name = (offering.name || "").toLowerCase();
            const companyName = (offering.company_name || "").toLowerCase();
            return name.includes(searchLower) || companyName.includes(searchLower);
          });

          return filteredOfferings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons 
                name={searchQuery ? "search-outline" : (
                  activeTab === "pending" ? "checkmark-done-circle" :
                  activeTab === "approved" ? "folder-open-outline" :
                  "close-circle-outline"
                )} 
                size={80} 
                color="#DFE6E9" 
              />
              <Text style={styles.emptyTitle}>
                {searchQuery ? "No Results Found" : (
                  activeTab === "pending" ? "All Clear!" :
                  activeTab === "approved" ? "No Approved Offerings" :
                  "No Rejected Offerings"
                )}
              </Text>
              <Text style={styles.emptyText}>
                {searchQuery 
                  ? "Try a different search term"
                  : activeTab === "pending" 
                    ? "No pending offerings to review at the moment"
                    : `No ${activeTab} offerings found`}
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>
                {activeTab === "pending" && "Review and approve company offerings"}
                {activeTab === "approved" && "Successfully approved offerings"}
                {activeTab === "rejected" && "Rejected offerings"}
              </Text>
              {filteredOfferings.map((offering, index) => (
                <OfferingCard key={`${offering.offering_id}-${index}`} offering={offering} />
              ))}
              <View style={{ height: 100 }} />
            </>
          );
        })()}
      </ScrollView>

      {/* Rejection Reason Modal */}
      <Modal
        visible={showRejectionModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowRejectionModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rejection Reason</Text>
              <TouchableOpacity onPress={() => setShowRejectionModal(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              Please provide a reason for rejecting "{offeringToReject?.name}"
            </Text>
            <TextInput
              style={styles.textArea}
              multiline
              numberOfLines={4}
              placeholder="Enter rejection reason (required)"
              value={rejectionReason}
              onChangeText={setRejectionReason}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowRejectionModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, !rejectionReason.trim() && styles.disabledButton]}
                onPress={confirmRejection}
                disabled={!rejectionReason.trim()}
              >
                <Text style={styles.confirmButtonText}>Reject Offering</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#FFF",
    paddingTop: 30,
    paddingBottom: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D3436",
    flex: 1,
    marginLeft: 10,
  },
  badge: {
    backgroundColor: "#6C5CE7",
    borderRadius: 16,
    minWidth: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#6C5CE7",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#636E72",
  },
  activeTabText: {
    color: "#6C5CE7",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginHorizontal: 20,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 14,
    color: "#636E72",
    marginTop: 20,
    marginBottom: 15,
  },
  offeringCard: {
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
  offeringImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#f0f0f0",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  offeringInfo: {
    padding: 15,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  offeringTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginRight: 10,
  },
  priceTag: {
    backgroundColor: "#00B894",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  companyName: {
    fontSize: 14,
    color: "#6C5CE7",
    fontWeight: "600",
    marginBottom: 6,
  },
  offeringDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
  },
  approveButton: {
    flex: 1,
    backgroundColor: "#00B894",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  approveButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 6,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FF7675",
  },
  rejectButtonText: {
    color: "#FF7675",
    fontSize: 15,
    fontWeight: "bold",
    marginLeft: 6,
  },
  statusBadgeContainer: {
    marginTop: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  approvedBadge: {
    backgroundColor: "#00B894",
  },
  rejectedBadge: {
    backgroundColor: "#FF7675",
  },
  statusBadgeText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
  },
  chevronIcon: {
    position: "absolute",
    right: 15,
    top: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3436",
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#636E72",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 500,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D3436",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#636E72",
    marginBottom: 16,
    lineHeight: 20,
  },
  textArea: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#DFE6E9",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: "#2D3436",
    minHeight: 100,
    textAlignVertical: "top",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#636E72",
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#FF7675",
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFF",
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default PendingOfferings;
