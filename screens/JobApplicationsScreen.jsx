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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getJobApplications, downloadCV } from '../apis/jobs/jobs';
import { createOrGetChat } from '../utils/chatService';

const JobApplicationsScreen = ({ route, navigation }) => {
  const { jobId } = route.params;
  const [applications, setApplications] = useState([]);
  const [jobInfo, setJobInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await getJobApplications(jobId);
      console.log('Applications response:', response);
      setApplications(response.data || []);
      setJobInfo(response.jobInfo);
    } catch (error) {
      Alert.alert('Error', 'Failed to load applications');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDownloadCV = async (applicationId, studentName) => {
    try {
      const response = await downloadCV(applicationId);
      if (response.success && response.data.url) {
        // Open the CV URL in browser
        await Linking.openURL(response.data.url);
      } else {
        Alert.alert('Error', 'CV not available');
      }
    } catch (error) {
      console.error('Error downloading CV:', error);
      Alert.alert('Error', 'Failed to download CV');
    }
  };

  const handleContactStudent = async (app) => {
    try {
      // Get current user ID from storage
      const currentUserId = await AsyncStorage.getItem('userId');
      if (!currentUserId) {
        Alert.alert('Error', 'Please log in again');
        return;
      }

      // Create or get chat between company and student
      const result = await createOrGetChat(currentUserId, app.user_id);
      
      if (result.success) {
        // Navigate with the proper chatId
        navigation.navigate('ConversationScreen', { 
          chatId: result.chatId,
          otherUser: {
            id: app.user_id,
            name: app.student_name,
            email: app.email,
            type: 'student',
            photoUrl: null
          }
        });
      } else {
        Alert.alert('Error', 'Failed to create chat');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      Alert.alert('Error', 'Failed to open chat');
    }
  };

  const openEmail = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const openPhone = (phone) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
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
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Applications</Text>
          {jobInfo && (
            <Text style={styles.headerSubtitle}>{jobInfo.title}</Text>
          )}
        </View>
        <View style={styles.backButton} />
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{applications.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#f59e0b' }]}>
            {applications.filter(a => a.status === 'pending').length}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#10b981' }]}>
            {applications.filter(a => a.status === 'accepted').length}
          </Text>
          <Text style={styles.statLabel}>Accepted</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            fetchApplications();
          }} />
        }
      >
        {applications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#cbd5e1" />
            <Text style={styles.emptyText}>No applications yet</Text>
            <Text style={styles.emptySubtext}>
              Applications will appear here when students apply
            </Text>
          </View>
        ) : (
          applications.map((app) => (
            <View key={app.application_id} style={styles.applicationCard}>
              {/* Header */}
              <View style={styles.cardHeader}>
                <View style={styles.studentAvatar}>
                  <Text style={styles.avatarText}>
                    {app.student_name?.charAt(0)?.toUpperCase() || 'S'}
                  </Text>
                </View>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>
                    {app.student_name || 'Student'}
                  </Text>
                  <Text style={styles.studentEmail}>
                    {app.email}
                  </Text>
                  <Text style={styles.appliedDateSmall}>
                    Applied {new Date(app.applied_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={() => handleContactStudent(app)}
                >
                  <Ionicons name="chatbubble-ellipses" size={18} color="#fff" />
                  <Text style={styles.buttonText}>Contact</Text>
                </TouchableOpacity>
                {app.cv_name && (
                  <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={() => handleDownloadCV(app.application_id, app.student_name)}
                  >
                    <Ionicons name="download" size={18} color="#fff" />
                    <Text style={styles.buttonText}>View CV</Text>
                  </TouchableOpacity>
                )}
              </View>



              {/* Cover Letter */}
              {app.cover_letter && (
                <View style={styles.coverLetterSection}>
                  <Text style={styles.sectionTitle}>Cover Letter</Text>
                  <Text style={styles.coverLetterText} numberOfLines={3}>
                    {app.cover_letter}
                  </Text>
                  <TouchableOpacity
                    onPress={() => Alert.alert('Cover Letter', app.cover_letter)}
                  >
                    <Text style={styles.readMoreText}>Read more</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Student Details */}
              <View style={styles.detailsGrid}>
                {app.major && (
                  <View style={styles.detailItem}>
                    <Ionicons name="book" size={16} color="#3b82f6" />
                    <Text style={styles.detailLabel}>Major</Text>
                    <Text style={styles.detailValue}>{app.major}</Text>
                  </View>
                )}
                {app.graduation_year && (
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar" size={16} color="#3b82f6" />
                    <Text style={styles.detailLabel}>Graduation Year</Text>
                    <Text style={styles.detailValue}>{app.graduation_year}</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
  },
  backButton: { padding: 8 },
  headerContent: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  headerSubtitle: { fontSize: 13, color: '#e0e7ff', marginTop: 2 },
  statsContainer: { flexDirection: 'row', padding: 16, gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  statValue: { fontSize: 24, fontWeight: '700', color: '#1e293b' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
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
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 2, borderBottomColor: '#f1f5f9' },
  studentAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#fff' },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
  studentEmail: { fontSize: 13, color: '#64748b', marginBottom: 2 },
  appliedDateSmall: { fontSize: 12, color: '#94a3b8' },
  actionButtons: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  buttonText: { fontSize: 14, fontWeight: '600', color: '#fff' },
  coverLetterSection: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 8 },
  coverLetterText: { fontSize: 13, color: '#64748b', lineHeight: 20 },
  readMoreText: { fontSize: 12, color: '#3b82f6', fontWeight: '600', marginTop: 4 },
  detailsGrid: { flexDirection: 'row', gap: 12, marginBottom: 12, backgroundColor: '#f8fafc', padding: 12, borderRadius: 12 },
  detailItem: {
    flex: 1,
    gap: 4,
  },
  detailLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { fontSize: 14, color: '#1e293b', fontWeight: '600' },
});

export default JobApplicationsScreen;
