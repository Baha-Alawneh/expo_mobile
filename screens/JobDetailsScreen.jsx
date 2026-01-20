import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getJobById, applyToJob, checkApplicationStatus } from '../apis/jobs/jobs';

const JobDetailsScreen = ({ route, navigation }) => {
  const { jobId } = route.params;
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasApplied, setHasApplied] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    fetchJobDetails();
    checkIfApplied();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await getJobById(jobId);
      setJob(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load job details');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfApplied = async () => {
    try {
      const response = await checkApplicationStatus(jobId);
      setHasApplied(response.data.hasApplied);
    } catch (error) {
      console.error('Failed to check application status', error);
    }
  };

  const handleApply = async () => {
    if (!coverLetter.trim()) {
      Alert.alert('Error', 'Please write a cover letter');
      return;
    }

    try {
      await applyToJob(jobId, { cover_letter: coverLetter });
      Alert.alert('Success', 'Application submitted successfully');
      setShowApplyModal(false);
      setCoverLetter('');
      setHasApplied(true);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit application');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Job not found</Text>
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
        <Text style={styles.headerTitle}>Job Details</Text>
        <View style={styles.backButton} />
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Company Info */}
        <View style={styles.companySection}>
          <View style={styles.companyAvatar}>
            <Text style={styles.companyInitial}>
              {job.company_name?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.companyName}>{job.company_name}</Text>
        </View>

        {/* Job Title & Type */}
        <View style={styles.titleSection}>
          <Text style={styles.jobTitle}>{job.title}</Text>
          <View style={styles.badges}>
            <View style={[styles.typeBadge, styles[`${job.job_type}Badge`]]}>
              <Text style={styles.typeText}>{job.job_type}</Text>
            </View>
            {job.is_active ? (
              <View style={styles.activeBadge}>
                <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                <Text style={styles.activeText}>Active</Text>
              </View>
            ) : (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveText}>Inactive</Text>
              </View>
            )}
          </View>
        </View>

        {/* Key Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="location" size={20} color="#3b82f6" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Location</Text>
                <Text style={styles.infoValue}>{job.location}</Text>
              </View>
            </View>
            {job.salary_range && (
              <View style={styles.infoItem}>
                <Ionicons name="cash" size={20} color="#10b981" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Salary</Text>
                  <Text style={styles.infoValue}>{job.salary_range}</Text>
                </View>
              </View>
            )}
          </View>
          {job.deadline && (
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="time" size={20} color="#f59e0b" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Application Deadline</Text>
                  <Text style={styles.infoValue}>
                    {new Date(job.deadline).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Description</Text>
          <Text style={styles.sectionContent}>{job.description}</Text>
        </View>

        {/* Requirements */}
        {job.requirements && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Requirements</Text>
            <Text style={styles.sectionContent}>{job.requirements}</Text>
          </View>
        )}

        {/* Responsibilities */}
        {job.responsibilities && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Responsibilities</Text>
            <Text style={styles.sectionContent}>{job.responsibilities}</Text>
          </View>
        )}

        {/* Posted Date */}
        <Text style={styles.postedDate}>
          Posted on {new Date(job.created_at).toLocaleDateString()}
        </Text>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Apply Button */}
      {job.is_active && (
        <View style={styles.footer}>
          {hasApplied ? (
            <View style={styles.appliedButton}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.appliedText}>Already Applied</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowApplyModal(true)}
            >
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.applyButtonText}>Apply Now</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Apply Modal */}
      <Modal visible={showApplyModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Apply for {job.title}</Text>
              <TouchableOpacity onPress={() => {
                setShowApplyModal(false);
                setCoverLetter('');
              }}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
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
                  }}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleApply}>
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
  content: { flex: 1 },
  companySection: { alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  companyAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  companyInitial: { fontSize: 32, fontWeight: '700', color: '#fff' },
  companyName: { fontSize: 18, fontWeight: '600', color: '#1e293b' },
  titleSection: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  jobTitle: { fontSize: 24, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
  badges: { flexDirection: 'row', gap: 8 },
  typeBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  'full-timeBadge': { backgroundColor: '#dcfce7' },
  'part-timeBadge': { backgroundColor: '#fef3c7' },
  internshipBadge: { backgroundColor: '#dbeafe' },
  contractBadge: { backgroundColor: '#f3e8ff' },
  typeText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize', color: '#1e293b' },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#dcfce7',
  },
  activeText: { fontSize: 12, fontWeight: '600', color: '#10b981' },
  inactiveBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#fee2e2' },
  inactiveText: { fontSize: 12, fontWeight: '600', color: '#ef4444' },
  infoCard: { backgroundColor: '#fff', margin: 16, padding: 20, borderRadius: 12, elevation: 2 },
  infoRow: { marginBottom: 16 },
  infoItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#64748b', marginBottom: 4 },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  section: { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, padding: 20, borderRadius: 12, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
  sectionContent: { fontSize: 14, color: '#64748b', lineHeight: 22 },
  postedDate: { fontSize: 13, color: '#94a3b8', textAlign: 'center', marginVertical: 16 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: '#fff', elevation: 8 },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
  },
  applyButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  appliedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#dcfce7',
    paddingVertical: 16,
    borderRadius: 12,
  },
  appliedText: { fontSize: 16, fontWeight: '700', color: '#10b981' },
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
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 4 },
  hint: { fontSize: 12, color: '#94a3b8', marginBottom: 12 },
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
  cancelBtn: { flex: 1, backgroundColor: '#e2e8f0', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
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

export default JobDetailsScreen;
