import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getAllJobs, getJobById, applyToJob } from '../apis/jobs/jobs';

const StudentJobsScreen = ({ navigation }) => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filterType, jobs]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await getAllJobs();
      setJobs(response.data || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to load jobs');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...jobs];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(job => job.job_type === filterType);
    }

    setFilteredJobs(filtered);
  };

  const handleApply = (job) => {
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const submitApplication = async () => {
    if (!coverLetter.trim()) {
      Alert.alert('Error', 'Please write a cover letter');
      return;
    }

    try {
      await applyToJob(selectedJob.job_id, coverLetter);
      Alert.alert('Success', 'Application submitted successfully');
      setShowApplyModal(false);
      setCoverLetter('');
      setSelectedJob(null);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit application');
    }
  };

  const viewJobDetails = (job) => {
    navigation.navigate('JobDetails', { jobId: job.job_id });
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
      {/* Search & Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#94a3b8" />
            </TouchableOpacity>
          ) : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          {['all', 'Full Time Job', 'Full Time Internship', 'Part Time Job', 'Part Time Internship'].map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.filterChip, filterType === type && styles.activeFilterChip]}
              onPress={() => setFilterType(type)}
            >
              <Text style={[styles.filterText, filterType === type && styles.activeFilterText]}>
                {type === 'all' ? 'All Jobs' : type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            fetchJobs();
          }} />
        }
      >
        {/* Results Count */}
        <Text style={styles.resultsText}>
          {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'} Found
        </Text>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>No jobs found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
          </View>
        ) : (
          filteredJobs.map((job) => (
            <TouchableOpacity
              key={job.job_id}
              style={styles.jobCard}
              onPress={() => viewJobDetails(job)}
            >
              {/* Company Info */}
              <View style={styles.companyRow}>
                <View style={styles.companyAvatar}>
                  <Text style={styles.companyInitial}>
                    {job.company_name?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.companyInfo}>
                  <Text style={styles.companyName}>{job.company_name}</Text>
                  <View style={styles.jobTypeContainer}>
                    <View style={[styles.typeBadge, styles[`${job.job_type}Badge`]]}>
                      <Text style={styles.typeText}>{job.job_type}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Job Title */}
              <Text style={styles.jobTitle}>{job.title}</Text>

              {/* Description */}
              <Text style={styles.jobDescription} numberOfLines={2}>
                {job.description}
              </Text>

              {/* Info Grid */}
              <View style={styles.jobInfo}>
                <View style={styles.infoItem}>
                  <Ionicons name="location-outline" size={16} color="#64748b" />
                  <Text style={styles.infoText}>{job.location}</Text>
                </View>
                {job.salary_range && (
                  <View style={styles.infoItem}>
                    <Ionicons name="cash-outline" size={16} color="#64748b" />
                    <Text style={styles.infoText}>{job.salary_range}</Text>
                  </View>
                )}
                {job.deadline && (
                  <View style={styles.infoItem}>
                    <Ionicons name="time-outline" size={16} color="#64748b" />
                    <Text style={styles.infoText}>
                      Deadline: {new Date(job.deadline).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => handleApply(job)}
                >
                  <Ionicons name="send" size={16} color="#fff" />
                  <Text style={styles.applyButtonText}>Apply Now</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => viewJobDetails(job)}
                >
                  <Text style={styles.detailsButtonText}>View Details</Text>
                  <Ionicons name="chevron-forward" size={16} color="#3b82f6" />
                </TouchableOpacity>
              </View>

              {/* Posted Date */}
              <Text style={styles.postedDate}>
                Posted {new Date(job.created_at).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Apply Modal */}
      <Modal visible={showApplyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Apply for {selectedJob?.title}</Text>
              <TouchableOpacity onPress={() => {
                setShowApplyModal(false);
                setCoverLetter('');
                setSelectedJob(null);
              }}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.companyNameInModal}>{selectedJob?.company_name}</Text>
              
              <View style={styles.quickInfo}>
                <View style={styles.quickInfoItem}>
                  <Ionicons name="location" size={16} color="#64748b" />
                  <Text style={styles.quickInfoText}>{selectedJob?.location}</Text>
                </View>
                <View style={styles.quickInfoItem}>
                  <Ionicons name="briefcase" size={16} color="#64748b" />
                  <Text style={styles.quickInfoText}>{selectedJob?.job_type}</Text>
                </View>
              </View>

              <Text style={styles.label}>Cover Letter *</Text>
              <Text style={styles.hint}>
                Explain why you're interested and what makes you a great fit
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={coverLetter}
                onChangeText={setCoverLetter}
                placeholder="Write your cover letter here..."
                multiline
                numberOfLines={10}
                textAlignVertical="top"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    setShowApplyModal(false);
                    setCoverLetter('');
                    setSelectedJob(null);
                  }}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={submitApplication}>
                  <Ionicons name="send" size={16} color="#fff" />
                  <Text style={styles.submitBtnText}>Submit Application</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  searchContainer: { backgroundColor: '#fff', padding: 16, paddingTop: 16, elevation: 2 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#1e293b' },
  filterContainer: { flexDirection: 'row', gap: 8 },
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
  content: { flex: 1, padding: 16 },
  resultsText: { fontSize: 14, color: '#64748b', marginBottom: 12, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, color: '#64748b', marginTop: 16 },
  emptySubtext: { fontSize: 14, color: '#94a3b8', marginTop: 8 },
  jobCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  companyRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  companyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  companyInitial: { fontSize: 20, fontWeight: '700', color: '#fff' },
  companyInfo: { flex: 1 },
  companyName: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
  jobTypeContainer: { flexDirection: 'row' },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  'full-timeBadge': { backgroundColor: '#dcfce7' },
  'part-timeBadge': { backgroundColor: '#fef3c7' },
  internshipBadge: { backgroundColor: '#dbeafe' },
  contractBadge: { backgroundColor: '#f3e8ff' },
  typeText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize', color: '#1e293b' },
  jobTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 8 },
  jobDescription: { fontSize: 13, color: '#64748b', marginBottom: 12, lineHeight: 20 },
  jobInfo: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  infoText: { fontSize: 11, color: '#64748b' },
  actions: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  applyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
  },
  applyButtonText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  detailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  detailsButtonText: { fontSize: 14, fontWeight: '600', color: '#3b82f6' },
  postedDate: { fontSize: 11, color: '#94a3b8', textAlign: 'right' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', flex: 1, paddingRight: 12 },
  modalBody: { padding: 20 },
  companyNameInModal: { fontSize: 14, color: '#64748b', marginBottom: 12 },
  quickInfo: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  quickInfoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  quickInfoText: { fontSize: 12, color: '#64748b' },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 4 },
  hint: { fontSize: 12, color: '#94a3b8', marginBottom: 8 },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
  },
  textArea: { height: 200, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20, marginBottom: 20 },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnText: { color: '#475569', fontWeight: '600', fontSize: 14 },
  submitBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    paddingVertical: 14,
    borderRadius: 8,
  },
  submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});

export default StudentJobsScreen;
