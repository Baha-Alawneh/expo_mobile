import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getDashboardStats } from "../apis/admin/Admin";

const { width } = Dimensions.get("window");

const AdminDashboard = ({ navigation, onNavigateToAnalytics, onTabChange }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const response = await getDashboardStats();
    if (response.success) {
      setStats(response.data);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  if (loading && !stats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: "#6C5CE7" }]}
              onPress={() => onTabChange && onTabChange("projects")}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="document-text" size={24} color="#FFF" />
              </View>
              <Text style={styles.actionText}>Review Projects</Text>
              {stats?.projects?.pending > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{stats.projects.pending}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: "#00B894" }]}
              onPress={() => onTabChange && onTabChange("offers")}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="briefcase" size={24} color="#FFF" />
              </View>
              <Text style={styles.actionText}>Review Offers</Text>
              {stats?.offerings?.pending > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{stats.offerings.pending}</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: "#FD79A8" }]}
              onPress={() => onTabChange && onTabChange("notify")}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="send" size={24} color="#FFF" />
              </View>
              <Text style={styles.actionText}>Send Notice</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: "#FDCB6E" }]}
              onPress={onNavigateToAnalytics}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="analytics" size={24} color="#FFF" />
              </View>
              <Text style={styles.actionText}>Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics Overview</Text>

          {/* Projects Stats */}
          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <View style={styles.statsIconWrapper}>
                <Ionicons name="folder-open" size={20} color="#6C5CE7" />
              </View>
              <Text style={styles.statsCardTitle}>Projects</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats?.projects?.total || 0}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: "#00B894" }]}>
                  {stats?.projects?.approved || 0}
                </Text>
                <Text style={styles.statLabel}>Approved</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: "#FDCB6E" }]}>
                  {stats?.projects?.pending || 0}
                </Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: "#FF7675" }]}>
                  {stats?.projects?.rejected || 0}
                </Text>
                <Text style={styles.statLabel}>Rejected</Text>
              </View>
            </View>
          </View>

          {/* Companies Offerings Stats */}
          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <View style={styles.statsIconWrapper}>
                <Ionicons name="business" size={20} color="#00B894" />
              </View>
              <Text style={styles.statsCardTitle}>Companies Offerings</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats?.offerings?.total || 0}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: "#00B894" }]}>
                  {stats?.offerings?.approved || 0}
                </Text>
                <Text style={styles.statLabel}>Approved</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: "#FDCB6E" }]}>
                  {stats?.offerings?.pending || 0}
                </Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: "#FF7675" }]}>
                  {stats?.offerings?.rejected || 0}
                </Text>
                <Text style={styles.statLabel}>Rejected</Text>
              </View>
            </View>
          </View>

          {/* Students, Companies & Visitors Registered Stats */}
          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <View style={styles.statsIconWrapper}>
                <Ionicons name="people" size={20} color="#74B9FF" />
              </View>
              <Text style={styles.statsCardTitle}>Registered Users</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats?.students?.total || 0}</Text>
                <Text style={styles.statLabel}>Students</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats?.companies?.total || 0}</Text>
                <Text style={styles.statLabel}>Companies</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats?.visitors?.total || 0}</Text>
                <Text style={styles.statLabel}>Visitors</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity (7 Days)</Text>
          <View style={styles.activityCard}>
            <View style={styles.activityRow}>
              <View style={styles.activityIcon}>
                <Ionicons name="folder" size={18} color="#6C5CE7" />
              </View>
              <Text style={styles.activityText}>
                {stats?.recentActivity?.projects || 0} new projects submitted
              </Text>
            </View>
            <View style={styles.activityRow}>
              <View style={styles.activityIcon}>
                <Ionicons name="briefcase" size={18} color="#00B894" />
              </View>
              <Text style={styles.activityText}>
                {stats?.recentActivity?.offers || 0} new offers submitted by companies
              </Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
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
    paddingTop: 60,
    paddingBottom: 20,
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
  headerGreeting: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2D3436",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#636E72",
    marginTop: 2,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingBottom: 80,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D3436",
    marginBottom: 15,
  },
  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionCard: {
    width: (width - 60) / 2,
    height: 120,
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  actionText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  badge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#FF3838",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  statsCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  statsIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statsCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2D3436",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#636E72",
  },
  activityCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityText: {
    fontSize: 14,
    color: "#2D3436",
    flex: 1,
  },
});

export default AdminDashboard;
