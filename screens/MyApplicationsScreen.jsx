import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getMyApplications } from '../apis/jobs/jobs';

const MyApplicationsScreen = ({ navigation }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await getMyApplications();
      setApplications(response.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load applications');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'accepted': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#64748b';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'time';
      case 'accepted': return 'checkmark-circle';
      case 'rejected': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const filteredApplications = applications.filter(app => 
    filter === 'all' || app.status === filter
  );

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#3b82f6', '#8b5cf6']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Applications</Text>
        <View style={styles.backButton} />
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#f59e0b' }]}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#10b981' }]}>{stats.accepted}</Text>
          <Text style={styles.statLabel}>Accepted</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#ef4444' }]}>{stats.rejected}</Text>
          <Text style={styles.statLabel}>Rejected</Text>
        </View>
      </View>

      {/* Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
        {['all', 'pending', 'accepted', 'rejected'].map(status => (
          <TouchableOpacity
            key={status}
            style={[styles.filterChip, filter === status && styles.activeFilterChip]}
            onPress={() => setFilter(status)}
          >
            <Text style={[styles.filterText, filter === status && styles.activeFilterText]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            fetchApplications();
          }} />
        }
      >
        {filteredApplications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>
              {filter === 'all' ? 'No applications yet' : `No ${filter} applications`}
            </Text>
            <Text style={styles.emptySubtext}>
              {filter === 'all' ? 'Start applying to jobs to see them here' : 'Try changing the filter'}
            </Text>
          </View>
        ) : (
          filteredApplications.map((app) => (
            <View key={app.application_id} style={styles.applicationCard}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <View style={styles.companyAvatar}>
                  <Text style={styles.avatarText}>
                    {app.company_name?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.jobInfo}>
                  <Text style={styles.jobTitle}>{app.job_title}</Text>
                  <Text style={styles.companyName}>{app.company_name}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(app.status) + '20' }]}>
                  <Ionicons
                    name={getStatusIcon(app.status)}
                    size={14}
                    color={getStatusColor(app.status)}
                  />
                </View>
              </View>

              {/* Job Details */}
              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Ionicons name="briefcase-outline" size={14} color="#64748b" />
                  <Text style={styles.detailText}>{app.job_type}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="location-outline" size={14} color="#64748b" />
                  <Text style={styles.detailText}>{app.location}</Text>
                </View>
              </View>

              {/* Status Info */}
              <View style={[styles.statusRow, { backgroundColor: getStatusColor(app.status) + '10' }]}>
                <View style={styles.statusInfo}>
                  <Text style={[styles.statusLabel, { color: getStatusColor(app.status) }]}>
                    {app.status.toUpperCase()}
                  </Text>
                  {app.status === 'pending' && (
                    <Text style={styles.statusHint}>Your application is under review</Text>
                  )}
                  {app.status === 'accepted' && (
                    <Text style={styles.statusHint}>Congratulations! You've been accepted</Text>
                  )}
                  {app.status === 'rejected' && (
                    <Text style={styles.statusHint}>Better luck next time</Text>
                  )}
                </View>
              </View>

              {/* Cover Letter Preview */}
              {app.cover_letter && (
                <TouchableOpacity
                  style={styles.coverLetterPreview}
                  onPress={() => Alert.alert('Your Cover Letter', app.cover_letter)}
                >
                  <Ionicons name="document-text" size={16} color="#3b82f6" />
                  <Text style={styles.coverLetterText} numberOfLines={1}>
                    {app.cover_letter}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                </TouchableOpacity>
              )}

              {/* Footer */}
              <View style={styles.cardFooter}>
                <Text style={styles.appliedDate}>
                  Applied on {new Date(app.applied_at).toLocaleDateString()}
                </Text>
                {app.deadline && (
                  <View style={styles.deadlineInfo}>
                    <Ionicons name="time-outline" size={12} color="#f59e0b" />
                    <Text style={styles.deadlineText}>
                      Deadline: {new Date(app.deadline).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  statsContainer: { flexDirection: 'row', padding: 16, gap: 8 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  statValue: { fontSize: 20, fontWeight: '700', color: '#1e293b' },
  statLabel: { fontSize: 10, color: '#64748b', marginTop: 4 },
  filterContainer: { paddingHorizontal: 16, marginBottom: 16 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  activeFilterChip: { backgroundColor: '#3b82f6' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#64748b' },
  activeFilterText: { color: '#fff' },
  content: { flex: 1, paddingHorizontal: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, color: '#64748b', marginTop: 16 },
  emptySubtext: { fontSize: 14, color: '#94a3b8', marginTop: 8, textAlign: 'center' },
  applicationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  companyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#fff' },
  jobInfo: { flex: 1 },
  jobTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  companyName: { fontSize: 13, color: '#64748b', marginTop: 2 },
  statusBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  detailText: { fontSize: 12, color: '#64748b' },
  statusRow: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  statusInfo: {},
  statusLabel: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  statusHint: { fontSize: 12, color: '#64748b' },
  coverLetterPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  coverLetterText: { flex: 1, fontSize: 12, color: '#64748b' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appliedDate: { fontSize: 11, color: '#94a3b8' },
  deadlineInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  deadlineText: { fontSize: 11, color: '#f59e0b', fontWeight: '600' },
});

export default MyApplicationsScreen;
