import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  RefreshControl,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/constants';
import InteractiveMapMobile from '../components/InteractiveMap/InteractiveMapMobile';
import BoothDetailsModal from '../components/InteractiveMap/BoothDetailsModal';
import MapLegend from '../components/InteractiveMap/MapLegend';
import { BOOTH_DATA } from '../components/InteractiveMap/mapData';
import { API_URL } from '../constants/config';

const MapScreenNew = ({ navigation, route }) => {
  const { userRole, userId } = route.params || {};
  
  const [booths, setBooths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedBooth, setSelectedBooth] = useState(null);
  const [legendCollapsed, setLegendCollapsed] = useState(false);
  const [userBooth, setUserBooth] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedBooth, setHighlightedBooth] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAddBoothModal, setShowAddBoothModal] = useState(false);
  const [newBoothData, setNewBoothData] = useState({
    booth_number: '',
    zone_type: 'engineering',
    width: 3.0,
    height: 3.0,
    location_x: 100,
    location_y: 100,
  });

  const isAdmin = userRole === 'admin';
  
  console.log('MapScreenNew - userRole:', userRole);
  console.log('MapScreenNew - isAdmin:', isAdmin);

  // Fetch booths from API
  useEffect(() => {
    fetchBooths();
  }, []);

  const fetchBooths = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/booths`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        
        // Extract data array from API response
        const data = result.data || result;
        
        if (Array.isArray(data) && data.length > 0) {
          // Transform API data to match map format (like web does)
          const transformedBooths = data.map(booth => ({
            ...booth,
            id: booth.booth_number,
            x: booth.location_x,
            y: booth.location_y,
            width: booth.width * 20, // Convert meters to pixels
            height: booth.height * 20,
            type: booth.zone_type,
            label: booth.booth_number,
            shape: booth.shape_type,
            status: booth.status || ((booth.assigned_to_project || booth.assigned_to_company) ? 'occupied' : 'available'),
            assignee: booth.assignee || booth.project_title || booth.company_name,
          }));
          
          setBooths(transformedBooths);
        } else {
          // Fallback to layout data if API returns no booths
          setBooths(BOOTH_DATA);
        }

        // Find user's booth
        if (userRole === 'student' || userRole === 'company') {
          const myBooth = data.find(b => 
            (userRole === 'student' && b.assigned_to_student_id === userId) ||
            (userRole === 'company' && b.assigned_to_company_id === userId)
          );
          if (myBooth) {
            setUserBooth(myBooth.booth_number);
          }
        }
      } else {
        // Fallback to layout data
        setBooths(BOOTH_DATA);
      }
    } catch (error) {
      console.error('Error fetching booths:', error);
      // Fallback to layout data
      setBooths(BOOTH_DATA);
    } finally {
      setLoading(false);
    }
  };

  const handleBoothPress = (booth) => {
    setSelectedBooth(booth);
  };

  const handleCloseModal = () => {
    setSelectedBooth(null);
  };

  const handleAssign = (booth) => {
    // Navigate to assignment screen or show assignment modal
    Alert.alert(
      'Assign Booth',
      `Open assignment interface for Booth ${booth.booth_number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Assign',
          onPress: () => {
            // TODO: Navigate to assignment screen
            console.log('Navigate to assignment for booth', booth.booth_number);
          },
        },
      ]
    );
  };

  const handleDeassign = async (booth) => {
    Alert.alert(
      'De-assign Booth',
      `Remove current assignment from Booth ${booth.booth_number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'De-assign',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const response = await fetch(`${API_URL}/booths/${booth.booth_id}/deassign`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                Alert.alert('Success', 'Booth de-assigned successfully');
                fetchBooths(); // Refresh
                setSelectedBooth(null);
              } else {
                Alert.alert('Error', 'Failed to de-assign booth');
              }
            } catch (error) {
              console.error('Error de-assigning booth:', error);
              Alert.alert('Error', 'Failed to de-assign booth');
            }
          },
        },
      ]
    );
  };

  const handleViewDetails = async (booth) => {
    console.log('Booth details:', booth);
    setSelectedBooth(null);
    
    if (booth.assigned_to_project) {
      try {
        // Fetch full project details from API
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`${API_URL}/projects/${booth.assigned_to_project}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const result = await response.json();
          const projectData = result.data || result;
          
          // Navigate to ProjectDetails with full project object
          navigation.navigate('ProjectDetails', { project: projectData });
        } else {
          Alert.alert('Error', 'Failed to load project details');
        }
      } catch (error) {
        console.error('Error fetching project:', error);
        Alert.alert('Error', 'Failed to load project details');
      }
    } else if (booth.assigned_to_company) {
      navigation.navigate('CompanyProfile', { companyId: booth.assigned_to_company });
    }
  };

  const handleNavigateToMyBooth = () => {
    if (userBooth) {
      const myBoothData = booths.find(b => b.booth_number === userBooth);
      if (myBoothData) {
        setSelectedBooth(myBoothData);
      }
    }
  };

  const handleDeassignAll = () => {
    Alert.alert(
      'Clear All Assignments',
      '⚠️ WARNING: This will remove ALL booth assignments. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'De-assign All',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const response = await fetch(`${API_URL}/booths/unassign-all`, {
                method: 'PATCH',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (response.ok) {
                Alert.alert('Success', 'All booth assignments have been cleared');
                await fetchBooths();
              } else {
                Alert.alert('Error', 'Failed to clear assignments');
              }
            } catch (error) {
              console.error('Error clearing assignments:', error);
              Alert.alert('Error', 'Failed to clear assignments');
            }
          }
        }
      ]
    );
  };

  const handleAddBooth = async () => {
    // Validate booth number
    if (!newBoothData.booth_number || newBoothData.booth_number.trim() === '') {
      Alert.alert('Error', 'Please enter a booth number');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/booths`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
        },
        body: JSON.stringify(newBoothData)
      });

      if (response.ok) {
        Alert.alert('Success', 'Booth added successfully');
        setShowAddBoothModal(false);
        setNewBoothData({
          booth_number: '',
          zone_type: 'engineering',
          width: 3.0,
          height: 3.0,
          location_x: 100,
          location_y: 100,
        });
        await fetchBooths();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'Failed to add booth');
      }
    } catch (error) {
      console.error('Error adding booth:', error);
      Alert.alert('Error', 'Failed to add booth');
    }
  };

  const handleAutoAssign = async () => {
    Alert.alert(
      'Auto-Assign',
      'Auto-assign all approved projects and companies to available booths based on their zone type?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Auto-Assign',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              
              // Fetch all projects and filter approved ones
              const projectsResponse = await fetch(`${API_URL}/projects`, {
                headers: { 'Authorization': `Bearer ${token}` },
              });
              
              // Fetch all companies
              const companiesResponse = await fetch(`${API_URL}/companies`, {
                headers: { 'Authorization': `Bearer ${token}` },
              });

              if (!projectsResponse.ok || !companiesResponse.ok) {
                const errorText = !projectsResponse.ok ? await projectsResponse.text() : await companiesResponse.text();
                console.error('API Error:', errorText);
                Alert.alert('Error', 'Failed to fetch projects or companies');
                return;
              }

              const allProjects = await projectsResponse.json();
              const allCompanies = await companiesResponse.json();

              console.log('Projects response:', allProjects);
              console.log('Companies response:', allCompanies);

              // Extract data from API response structure
              const projectsData = allProjects.data || allProjects;
              const companiesData = allCompanies.data || allCompanies;

              // Filter only approved projects
              const approvedProjects = Array.isArray(projectsData) 
                ? projectsData.filter(p => p.status === 'approved')
                : [];

              const companies = Array.isArray(companiesData) ? companiesData : [];

              console.log('Approved projects:', approvedProjects.length);
              console.log('Companies:', companies.length);

              if (approvedProjects.length === 0 && companies.length === 0) {
                Alert.alert('Info', 'No approved projects or companies found to assign');
                return;
              }

              // Filter available booths by zone type
              const engineeringBooths = booths.filter(b => !b.assignee && b.zone_type === 'engineering');
              const scienceBooths = booths.filter(b => !b.assignee && b.zone_type === 'science');
              const sponsorBooths = booths.filter(b => !b.assignee && b.zone_type === 'sponsor');
              const serviceBooths = booths.filter(b => !b.assignee && b.zone_type === 'service');

              console.log('Available booths:');
              console.log('Engineering:', engineeringBooths.length, engineeringBooths.map(b => b.booth_number));
              console.log('Science:', scienceBooths.length, scienceBooths.map(b => b.booth_number));
              console.log('Sponsor:', sponsorBooths.length, sponsorBooths.map(b => b.booth_number));
              console.log('Service:', serviceBooths.length, serviceBooths.map(b => b.booth_number));

              let assignedCount = 0;

              // Assign engineering projects
              const engineeringProjects = approvedProjects.filter(p => p.type === 'engineering');
              console.log('Engineering projects to assign:', engineeringProjects.length);
              for (let i = 0; i < Math.min(engineeringProjects.length, engineeringBooths.length); i++) {
                console.log(`Assigning project ${engineeringProjects[i].project_id} to booth ${engineeringBooths[i].booth_id || engineeringBooths[i].booth_number}`);
                const response = await fetch(`${API_URL}/booths/${engineeringBooths[i].booth_id || engineeringBooths[i].booth_number}/assign`, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ projectId: engineeringProjects[i].project_id }),
                });
                const result = await response.json();
                console.log('Assignment result:', response.status, result);
                if (response.ok) assignedCount++;
              }

              // Assign science projects
              const scienceProjects = approvedProjects.filter(p => p.type === 'science');
              for (let i = 0; i < Math.min(scienceProjects.length, scienceBooths.length); i++) {
                const response = await fetch(`${API_URL}/booths/${scienceBooths[i].booth_id}/assign`, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ projectId: scienceProjects[i].project_id }),
                });
                if (response.ok) assignedCount++;
              }

              // Assign sponsor companies
              const sponsorCompanies = companies.filter(c => c.type === 'sponser' || c.type === 'sponsor');
              for (let i = 0; i < Math.min(sponsorCompanies.length, sponsorBooths.length); i++) {
                const response = await fetch(`${API_URL}/booths/${sponsorBooths[i].booth_id}/assign`, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ companyId: sponsorCompanies[i].company_id }),
                });
                if (response.ok) assignedCount++;
              }

              // Assign service companies
              const serviceCompanies = companies.filter(c => c.type === 'service');
              for (let i = 0; i < Math.min(serviceCompanies.length, serviceBooths.length); i++) {
                const response = await fetch(`${API_URL}/booths/${serviceBooths[i].booth_id}/assign`, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ companyId: serviceCompanies[i].company_id }),
                });
                if (response.ok) assignedCount++;
              }

              Alert.alert('Success', `Successfully auto-assigned ${assignedCount} projects/companies to booths!`);
              await fetchBooths();
            } catch (error) {
              console.error('Error auto-assigning:', error);
              Alert.alert('Error', 'Failed to auto-assign booths');
            }
          }
        }
      ]
    );
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBooths();
    setRefreshing(false);
  };

  // Search functionality
  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setHighlightedBooth(null);
      return;
    }

    const searchLower = text.toLowerCase();
    const found = booths.find((booth) => {
      const boothNum = (booth.booth_number || booth.boothNumber || '').toString();
      const zone = booth.zone?.toLowerCase() || '';
      const company = booth.companyName?.toLowerCase() || '';
      const project = booth.projectTitle?.toLowerCase() || '';
      
      return boothNum.includes(searchLower) ||
             zone.includes(searchLower) ||
             company.includes(searchLower) ||
             project.includes(searchLower);
    });

    setHighlightedBooth(found?.boothNumber || found?.booth_number || null);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setHighlightedBooth(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={Colors.mainColor} />
          <Text style={styles.loadingText}>Initializing Plaza Geometry</Text>
          <Text style={styles.loadingSubtext}>Loading booth assignments...</Text>
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Header with Search Bar */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerTitleSection}>
              <View style={styles.iconBox}>
                <Ionicons name="map" size={24} color={Colors.mainColor} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Expo Floor Plan</Text>
                <Text style={styles.headerSubtitle}>White Plaza, Najah University</Text>
              </View>
            </View>
            {userBooth && (
              <TouchableOpacity
                style={styles.myBoothButton}
                onPress={handleNavigateToMyBooth}
              >
                <Ionicons name="navigate" size={20} color="#fff" />
                <Text style={styles.myBoothButtonText}>My Booth</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#64748b" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by booth number, zone, company..."
              placeholderTextColor="#94a3b8"
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Admin Action Buttons - Debug: Always showing */}
        <View style={styles.adminActions}>
          <Text style={styles.adminActionsTitle}>
            Quick Actions {isAdmin ? '(Admin)' : '(Not Admin)'}
          </Text>
          <View style={styles.adminButtonsRow}>
            <TouchableOpacity style={[styles.adminButton, styles.addButton]} onPress={() => setShowAddBoothModal(true)}>
              <Ionicons name="add-circle" size={18} color="#fff" />
              <Text style={styles.adminButtonText}>Add Booth</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.adminButton, styles.autoAssignButton]} onPress={handleAutoAssign}>
              <Ionicons name="flash" size={18} color="#fff" />
              <Text style={styles.adminButtonText}>Auto-Assign</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.adminButton, styles.deassignButton]} onPress={handleDeassignAll}>
              <Ionicons name="close-circle" size={18} color="#fff" />
              <Text style={styles.adminButtonText}>Clear All</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.adminButton, styles.refreshButton]} onPress={onRefresh}>
              <Ionicons name="refresh" size={18} color="#fff" />
              <Text style={styles.adminButtonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Interactive Map with ScrollView for Refresh Control */}
        <View style={isFullscreen ? styles.mapContainerFullscreen : styles.mapContainer}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flex: 1 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.mainColor]} />
            }
          >
            <InteractiveMapMobile
              booths={booths}
              onBoothPress={handleBoothPress}
              userBoothNumber={userBooth}
              highlightBoothNumber={highlightedBooth}
              onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
              isFullscreen={isFullscreen}
              isAdmin={isAdmin}
              onBoothDrag={(boothNumber, newX, newY) => {
                // Update booth position in state
                setBooths(prev => prev.map(b => 
                  b.booth_number === boothNumber 
                    ? { ...b, x: newX, y: newY }
                    : b
                ));
              }}
              onBoothDragEnd={async (boothNumber, newX, newY) => {
                // Save booth position to API
                try {
                  const token = await AsyncStorage.getItem('token');
                  const booth = booths.find(b => b.booth_number === boothNumber);
                  if (booth) {
                    await fetch(`${API_URL}/booths/${booth.booth_id}`, {
                      method: 'PUT',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        location_x: newX,
                        location_y: newY,
                      }),
                    });
                  }
                } catch (error) {
                  console.error('Error saving booth position:', error);
                }
              }}
            />
          </ScrollView>
        </View>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <TouchableOpacity
            style={styles.legendHeader}
            onPress={() => setLegendCollapsed(!legendCollapsed)}
          >
            <Text style={styles.legendTitle}>Zones Legend</Text>
            <Ionicons
              name={legendCollapsed ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#64748b"
            />
          </TouchableOpacity>
          {!legendCollapsed && <MapLegend />}
        </View>

        {/* Add Booth Modal */}
        <Modal
          visible={showAddBoothModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAddBoothModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.addBoothModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Booth</Text>
                <TouchableOpacity onPress={() => setShowAddBoothModal(false)}>
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                <Text style={styles.inputLabel}>Booth Number *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., B001"
                  value={newBoothData.booth_number}
                  onChangeText={(text) => setNewBoothData({...newBoothData, booth_number: text})}
                />

                <Text style={styles.inputLabel}>Zone Type *</Text>
                <View style={styles.pickerContainer}>
                  {['engineering', 'sponsor', 'service', 'science'].map((zone) => (
                    <TouchableOpacity
                      key={zone}
                      style={[
                        styles.zonePill,
                        newBoothData.zone_type === zone && styles.zonePillActive
                      ]}
                      onPress={() => setNewBoothData({...newBoothData, zone_type: zone})}
                    >
                      <Text style={[
                        styles.zonePillText,
                        newBoothData.zone_type === zone && styles.zonePillTextActive
                      ]}>
                        {zone.charAt(0).toUpperCase() + zone.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.rowInputs}>
                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>Width (m)</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="3.0"
                      keyboardType="numeric"
                      value={String(newBoothData.width)}
                      onChangeText={(text) => setNewBoothData({...newBoothData, width: parseFloat(text) || 3.0})}
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>Height (m)</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="3.0"
                      keyboardType="numeric"
                      value={String(newBoothData.height)}
                      onChangeText={(text) => setNewBoothData({...newBoothData, height: parseFloat(text) || 3.0})}
                    />
                  </View>
                </View>

                <View style={styles.rowInputs}>
                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>Position X (px)</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="100"
                      keyboardType="numeric"
                      value={String(newBoothData.location_x)}
                      onChangeText={(text) => setNewBoothData({...newBoothData, location_x: parseFloat(text) || 100})}
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <Text style={styles.inputLabel}>Position Y (px)</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="100"
                      keyboardType="numeric"
                      value={String(newBoothData.location_y)}
                      onChangeText={(text) => setNewBoothData({...newBoothData, location_y: parseFloat(text) || 100})}
                    />
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => setShowAddBoothModal(false)}
                >
                  <Text style={styles.modalButtonCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSubmit]}
                  onPress={handleAddBooth}
                >
                  <Text style={styles.modalButtonText}>Add Booth</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Booth Details Modal */}
        <BoothDetailsModal
          visible={!!selectedBooth}
          booth={selectedBooth}
          onClose={handleCloseModal}
          onAssign={handleAssign}
          onDeassign={handleDeassign}
          onViewDetails={handleViewDetails}
          isAdmin={isAdmin}
        />
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  clearButton: {
    padding: 4,
  },
  myBoothButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: Colors.mainColor,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  myBoothButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  legendContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  legendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  adminActions: {
    backgroundColor: '#fff',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  adminActionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  adminButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  adminButton: {
    minWidth: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  autoAssignButton: {
    backgroundColor: '#3B82F6',
  },
  deassignButton: {
    backgroundColor: '#EF4444',
  },
  refreshButton: {
    backgroundColor: '#10B981',
  },
  addButton: {
    backgroundColor: '#8B5CF6',
  },
  adminButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  addBoothModal: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalContent: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#1F2937',
  },
  pickerContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  zonePill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  zonePillActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  zonePillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  zonePillTextActive: {
    color: '#6366F1',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F3F4F6',
  },
  modalButtonSubmit: {
    backgroundColor: '#8B5CF6',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonCancelText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
  mapContainer: {
    height: '55%',
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapContainerFullscreen: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default MapScreenNew;
