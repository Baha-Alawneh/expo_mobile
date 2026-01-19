import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
  Modal,
  TextInput,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/constants";
import {
  getPendingCompanies,
  getCompaniesByStatus,
  updateCompanyStatus,
} from "../apis/admin/Admin";

const PendingCompanies = ({ navigation }) => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState("pending");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    fetchCompanies();
  }, [selectedTab]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      let result;

      if (selectedTab === "pending") {
        result = await getPendingCompanies();
      } else {
        result = await getCompaniesByStatus(selectedTab);
      }

      if (result.success) {
        setCompanies(result.data || []);
      } else {
        Alert.alert("Error", result.message || "Failed to fetch companies");
        setCompanies([]);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      Alert.alert("Error", "An unexpected error occurred");
      setCompanies([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCompanies();
  };

  const handleApprove = (company) => {
    Alert.alert(
      "Approve Company",
      `Are you sure you want to approve "${company.company_name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          style: "default",
          onPress: () => updateStatus(company.company_id, "approved"),
        },
      ]
    );
  };

  const handleReject = (company) => {
    setSelectedCompany(company);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectionReason.trim()) {
      Alert.alert("Error", "Please provide a rejection reason");
      return;
    }

    setShowRejectModal(false);
    await updateStatus(selectedCompany.company_id, "rejected", rejectionReason);
    setSelectedCompany(null);
    setRejectionReason("");
  };

  const updateStatus = async (companyId, status, reason = null) => {
    try {
      const result = await updateCompanyStatus(companyId, status, reason);

      if (result.success) {
        Alert.alert(
          "Success",
          `Company ${status === "approved" ? "approved" : "rejected"} successfully`
        );
        fetchCompanies();
      } else {
        Alert.alert("Error", result.message || "Failed to update company status");
      }
    } catch (error) {
      console.error("Error updating company status:", error);
      Alert.alert("Error", "An unexpected error occurred");
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "#4CAF50";
      case "rejected":
        return "#FF5252";
      case "pending":
      default:
        return "#FF9800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "checkmark-circle";
      case "rejected":
        return "close-circle";
      case "pending":
      default:
        return "time";
    }
  };

  const openWebsite = (url) => {
    if (url) {
      Linking.openURL(url.startsWith("http") ? url : `https://${url}`);
    }
  };

  const renderCompanyCard = (company) => {
    const statusColor = getStatusColor(company.status);
    const statusIcon = getStatusIcon(company.status);

    return (
      <View key={company.company_id} style={styles.companyCard}>
        {/* Company Header */}
        <View style={styles.companyHeader}>
          <View style={styles.companyLogoContainer}>
            {company.profile_image_url ? (
              <Image
                source={{ uri: company.profile_image_url }}
                style={styles.companyLogo}
              />
            ) : (
              <View style={[styles.companyLogo, styles.companyLogoPlaceholder]}>
                <Ionicons name="business" size={32} color="#9CA3AF" />
              </View>
            )}
          </View>

          <View style={styles.companyInfo}>
            <Text style={styles.companyName} numberOfLines={1}>
              {company.company_name}
            </Text>
            <View style={styles.companyTypeContainer}>
              <Ionicons name="briefcase-outline" size={14} color="#6B7280" />
              <Text style={styles.companyType}>{company.type || "Company"}</Text>
            </View>
          </View>

          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Ionicons name={statusIcon} size={16} color="#fff" />
          </View>
        </View>

        {/* Company Details */}
        <View style={styles.companyDetails}>
          {company.email && (
            <View style={styles.detailRow}>
              <Ionicons name="mail-outline" size={18} color="#6B7280" />
              <Text style={styles.detailText} numberOfLines={1}>
                {company.email}
              </Text>
            </View>
          )}

          {company.phone && (
            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={18} color="#6B7280" />
              <Text style={styles.detailText}>{company.phone}</Text>
            </View>
          )}

          {company.address && (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={18} color="#6B7280" />
              <Text style={styles.detailText} numberOfLines={2}>
                {company.address}
              </Text>
            </View>
          )}

          {company.website_url && (
            <TouchableOpacity
              style={styles.detailRow}
              onPress={() => openWebsite(company.website_url)}
            >
              <Ionicons name="globe-outline" size={18} color="#3B82F6" />
              <Text style={[styles.detailText, styles.linkText]} numberOfLines={1}>
                {company.website_url}
              </Text>
            </TouchableOpacity>
          )}

          {company.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionLabel}>Description:</Text>
              <Text style={styles.descriptionText} numberOfLines={3}>
                {company.description}
              </Text>
            </View>
          )}

          {company.rejection_reason && (
            <View style={styles.rejectionContainer}>
              <Ionicons name="information-circle" size={18} color="#FF5252" />
              <Text style={styles.rejectionText}>
                Reason: {company.rejection_reason}
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons - Only show for pending companies */}
        {company.status === "pending" && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleReject(company)}
            >
              <Ionicons name="close-circle-outline" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleApprove(company)}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Registration Date */}
        <View style={styles.footer}>
          <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
          <Text style={styles.footerText}>
            Registered: {new Date(company.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.mainColor} />
      <View style={styles.container}>
        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === "pending" && styles.activeTab]}
            onPress={() => setSelectedTab("pending")}
          >
            <Ionicons
              name="time"
              size={20}
              color={selectedTab === "pending" ? "#fff" : "#6B7280"}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === "pending" && styles.activeTabText,
              ]}
            >
              Pending
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === "approved" && styles.activeTab]}
            onPress={() => setSelectedTab("approved")}
          >
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={selectedTab === "approved" ? "#fff" : "#6B7280"}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === "approved" && styles.activeTabText,
              ]}
            >
              Approved
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === "rejected" && styles.activeTab]}
            onPress={() => setSelectedTab("rejected")}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={selectedTab === "rejected" ? "#fff" : "#6B7280"}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === "rejected" && styles.activeTabText,
              ]}
            >
              Rejected
            </Text>
          </TouchableOpacity>
        </View>

        {/* Companies List */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.mainColor} />
            <Text style={styles.loadingText}>Loading companies...</Text>
          </View>
        ) : companies.length === 0 ? (
          <View style={styles.centerContainer}>
            <Ionicons name="business-outline" size={80} color="#CCC" />
            <Text style={styles.emptyText}>
              No {selectedTab} companies found
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.mainColor]}
              />
            }
          >
            {companies.map(renderCompanyCard)}
          </ScrollView>
        )}

        {/* Rejection Modal */}
        <Modal
          visible={showRejectModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowRejectModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Reject Company</Text>
                <TouchableOpacity onPress={() => setShowRejectModal(false)}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalSubtitle}>
                Company: {selectedCompany?.company_name}
              </Text>

              <Text style={styles.inputLabel}>Rejection Reason *</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Please provide a reason for rejection..."
                value={rejectionReason}
                onChangeText={setRejectionReason}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowRejectModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={confirmReject}
                >
                  <Text style={styles.confirmButtonText}>Reject Company</Text>
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
    backgroundColor: "#f8fafc",
  },
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    gap: 6,
  },
  activeTab: {
    backgroundColor: Colors.mainColor,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeTabText: {
    color: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
  },
  companyCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  companyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  companyLogoContainer: {
    marginRight: 12,
  },
  companyLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  companyLogoPlaceholder: {
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  companyTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  companyType: {
    fontSize: 14,
    color: "#6B7280",
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  companyDetails: {
    gap: 10,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
  },
  linkText: {
    color: "#3B82F6",
    textDecorationLine: "underline",
  },
  descriptionContainer: {
    marginTop: 8,
  },
  descriptionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
  },
  rejectionContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#FEE2E2",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  rejectionText: {
    flex: 1,
    fontSize: 13,
    color: "#DC2626",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  approveButton: {
    backgroundColor: "#10B981",
  },
  rejectButton: {
    backgroundColor: "#EF4444",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#9CA3AF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#111827",
    minHeight: 100,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  confirmButton: {
    backgroundColor: "#EF4444",
  },
  cancelButtonText: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default PendingCompanies;
