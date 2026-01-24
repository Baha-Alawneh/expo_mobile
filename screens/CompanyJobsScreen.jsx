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
import {
  createJobOffer,
  getCompanyJobs,
  updateJobOffer,
  deleteJobOffer,
  toggleJobStatus,
} from '../apis/jobs/jobs';

const CompanyJobsScreen = ({ navigation }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    workType: 'Full Time',
    positionType: 'Job',
    location: '',
    salary_range: '',
    requirements: '',
    responsibilities: '',
    deadline: '',
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      console.log('Fetching company jobs...');
      const response = await getCompanyJobs();
      console.log('Response:', response);
      setJobs(response.data || []);
    } catch (error) {
      console.error('Full error:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      Alert.alert('Error', error.response?.data?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      // Combine workType and positionType into job_type
      const jobData = {
        ...formData,
        job_type: `${formData.workType} ${formData.positionType}`,
      };
      delete jobData.workType;
      delete jobData.positionType;

      if (editingJob) {
        await updateJobOffer(editingJob.job_id, jobData);
        Alert.alert('Success', 'Job updated successfully');
      } else {
        await createJobOffer(jobData);
        Alert.alert('Success', 'Job created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchJobs();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to save job');
    }
  };

  const handleEdit = (job) => {
    setEditingJob(job);
    // Parse job_type into workType and positionType
    const parts = job.job_type.split(' ');
    const workType = parts.slice(0, -1).join(' ') || 'Full Time';
    const positionType = parts[parts.length - 1] || 'Job';
    
    setFormData({
      title: job.title,
      description: job.description,
      workType: workType,
      positionType: positionType,
      location: job.location,
      salary_range: job.salary_range || '',
      requirements: job.requirements || '',
      responsibilities: job.responsibilities || '',
      deadline: job.deadline ? job.deadline.split('T')[0] : '',
    });
    setShowModal(true);
  };

  const handleDelete = (jobId) => {
    Alert.alert(
      'Delete Job',
      'Are you sure you want to delete this job?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteJobOffer(jobId);
              Alert.alert('Success', 'Job deleted successfully');
              fetchJobs();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete job');
            }
          },
        },
      ]
    );
  };

  const handleToggleStatus = async (jobId, currentStatus) => {
    try {
      await toggleJobStatus(jobId, currentStatus);
      fetchJobs();
    } catch (error) {
      Alert.alert('Error', 'Failed to update job status');
    }
  };

  const viewApplications = (jobId) => {
    navigation.navigate('JobApplications', { jobId });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      workType: 'Full Time',
      positionType: 'Job',
      location: '',
      salary_range: '',
      requirements: '',
      responsibilities: '',
      deadline: '',
    });
    setEditingJob(null);
  };

  const stats = {
    total: jobs.length,
    active: jobs.filter(j => j.is_active).length,
    applications: jobs.reduce((sum, j) => sum + (j.applications_count || 0), 0),
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
      {/* Header with Add Button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Job Positions</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          <Ionicons name="add-circle" size={24} color="#3b82f6" />
          <Text style={styles.addButtonText}>New Position</Text>
        </TouchableOpacity>
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
        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Jobs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.active}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.applications}</Text>
            <Text style={styles.statLabel}>Applications</Text>
          </View>
        </View>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>No jobs posted yet</Text>
            <TouchableOpacity style={styles.createButton} onPress={() => setShowModal(true)}>
              <Text style={styles.createButtonText}>Create First Job</Text>
            </TouchableOpacity>
          </View>
        ) : (
          jobs.map((job) => (
            <View key={job.job_id} style={[styles.jobCard, !job.is_active && styles.inactiveCard]}>
              {/* Header */}
              <View style={styles.jobHeader}>
                <View style={styles.jobTitleRow}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <View style={[styles.statusBadge, job.is_active ? styles.activeBadge : styles.inactiveBadge]}>
                    <Text style={styles.statusText}>{job.is_active ? 'Active' : 'Inactive'}</Text>
                  </View>
                </View>
                <View style={[styles.typeBadge, styles[`${job.job_type}Badge`]]}>
                  <Text style={styles.typeText}>{job.job_type}</Text>
                </View>
              </View>

              {/* Body */}
              <Text style={styles.jobDescription} numberOfLines={2}>
                {job.description}
              </Text>

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
                <View style={[styles.infoItem, styles.highlightInfo]}>
                  <Ionicons name="people-outline" size={16} color="#3b82f6" />
                  <Text style={styles.highlightText}>{job.applications_count || 0} Applicants</Text>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionBtn, job.is_active ? styles.warningBtn : styles.successBtn]}
                  onPress={() => handleToggleStatus(job.job_id, job.is_active)}
                >
                  <Ionicons name={job.is_active ? 'pause' : 'play'} size={14} color="#fff" />
                  <Text style={styles.actionText}>{job.is_active ? 'Pause' : 'Activate'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.secondaryBtn]} onPress={() => handleEdit(job)}>
                  <Ionicons name="pencil" size={14} color="#fff" />
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.primaryBtn]} onPress={() => viewApplications(job.job_id)}>
                  <Ionicons name="eye" size={14} color="#fff" />
                  <Text style={styles.actionText}>View ({job.applications_count || 0})</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.dangerBtn]} onPress={() => handleDelete(job.job_id)}>
                  <Ionicons name="trash" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Create/Edit Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingJob ? 'Edit Job' : 'Create Job'}</Text>
              <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.label}>Job Title *</Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData({...formData, title: text})}
                placeholder="e.g., Software Engineer"
              />

              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({...formData, description: text})}
                placeholder="Job description..."
                multiline
                numberOfLines={4}
              />

              <Text style={styles.label}>Work Type *</Text>
              <View style={styles.pickerContainer}>
                <TouchableOpacity
                  style={[styles.pickerButton, formData.workType === 'Full Time' && styles.pickerButtonActive]}
                  onPress={() => setFormData({...formData, workType: 'Full Time'})}
                >
                  <Text style={[styles.pickerButtonText, formData.workType === 'Full Time' && styles.pickerButtonTextActive]}>Full Time</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.pickerButton, formData.workType === 'Part Time' && styles.pickerButtonActive]}
                  onPress={() => setFormData({...formData, workType: 'Part Time'})}
                >
                  <Text style={[styles.pickerButtonText, formData.workType === 'Part Time' && styles.pickerButtonTextActive]}>Part Time</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Position Type *</Text>
              <View style={styles.pickerContainer}>
                <TouchableOpacity
                  style={[styles.pickerButton, formData.positionType === 'Job' && styles.pickerButtonActive]}
                  onPress={() => setFormData({...formData, positionType: 'Job'})}
                >
                  <Text style={[styles.pickerButtonText, formData.positionType === 'Job' && styles.pickerButtonTextActive]}>Job</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.pickerButton, formData.positionType === 'Internship' && styles.pickerButtonActive]}
                  onPress={() => setFormData({...formData, positionType: 'Internship'})}
                >
                  <Text style={[styles.pickerButtonText, formData.positionType === 'Internship' && styles.pickerButtonTextActive]}>Internship</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Location *</Text>
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(text) => setFormData({...formData, location: text})}
                placeholder="e.g., New York, Remote"
              />

              <Text style={styles.label}>Salary Range</Text>
              <TextInput
                style={styles.input}
                value={formData.salary_range}
                onChangeText={(text) => setFormData({...formData, salary_range: text})}
                placeholder="e.g., $80,000 - $120,000"
              />

              <Text style={styles.label}>Requirements</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.requirements}
                onChangeText={(text) => setFormData({...formData, requirements: text})}
                placeholder="Job requirements..."
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Deadline (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={formData.deadline}
                onChangeText={(text) => setFormData({...formData, deadline: text})}
                placeholder="e.g., 2026-12-31"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowModal(false); resetForm(); }}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                  <Text style={styles.submitBtnText}>{editingJob ? 'Update' : 'Create'}</Text>
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: '#1e293b', 
    flex: 1 
  },
  addButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eff6ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  pageTitle: { fontSize: 20, fontWeight: '700', color: '#1e293b', flex: 1 },
  content: { flex: 1, padding: 16 },
  statsContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 12, alignItems: 'center', elevation: 2 },
  statValue: { fontSize: 24, fontWeight: '700', color: '#1e293b' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, color: '#64748b', marginTop: 16, marginBottom: 24 },
  createButton: { backgroundColor: '#3b82f6', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  createButtonText: { color: '#fff', fontWeight: '600' },
  jobCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  inactiveCard: { opacity: 0.6 },
  jobHeader: { marginBottom: 12 },
  jobTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  jobTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  activeBadge: { backgroundColor: '#dcfce7' },
  inactiveBadge: { backgroundColor: '#fee2e2' },
  statusText: { fontSize: 10, fontWeight: '600' },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  'full-timeBadge': { backgroundColor: '#dcfce7' },
  'part-timeBadge': { backgroundColor: '#fef3c7' },
  internshipBadge: { backgroundColor: '#dbeafe' },
  contractBadge: { backgroundColor: '#f3e8ff' },
  typeText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  jobDescription: { fontSize: 13, color: '#64748b', marginBottom: 12, lineHeight: 20 },
  jobInfo: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f8fafc', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6 },
  infoText: { fontSize: 11, color: '#64748b' },
  highlightInfo: { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe' },
  highlightText: { fontSize: 11, color: '#1e40af', fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 6 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: 6 },
  actionText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  primaryBtn: { backgroundColor: '#3b82f6' },
  secondaryBtn: { backgroundColor: '#8b5cf6' },
  successBtn: { backgroundColor: '#10b981' },
  warningBtn: { backgroundColor: '#f59e0b' },
  dangerBtn: { backgroundColor: '#ef4444', flex: 0, paddingHorizontal: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  modalBody: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 14 },
  textArea: { height: 100, textAlignVertical: 'top' },
  pickerContainer: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  pickerButton: { 
    flex: 1, 
    paddingVertical: 12, 
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc', 
    borderWidth: 2, 
    borderColor: '#e2e8f0', 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  pickerButtonActive: { 
    backgroundColor: '#eff6ff', 
    borderColor: '#3b82f6' 
  },
  pickerButtonText: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#64748b' 
  },
  pickerButtonTextActive: { 
    color: '#3b82f6' 
  },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 20, marginBottom: 20 },
  cancelBtn: { flex: 1, backgroundColor: '#e2e8f0', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  cancelBtnText: { color: '#475569', fontWeight: '600', fontSize: 14 },
  submitBtn: { flex: 1, backgroundColor: '#3b82f6', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});

export default CompanyJobsScreen;
