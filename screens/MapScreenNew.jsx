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
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeInDown, 
  FadeInRight, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
} from 'react-native-reanimated';
import { Colors } from '../constants/constants';
import InteractiveMapMobile from '../components/InteractiveMap/InteractiveMapMobile';
import BoothDetailsModal from '../components/InteractiveMap/BoothDetailsModal';
import BuildingModal from '../components/InteractiveMap/BuildingModal';
import MapLegend from '../components/InteractiveMap/MapLegend';
import { API_URL } from '../constants/config';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_DESKTOP = SCREEN_WIDTH > 768;

// --- Animated Button Component ---
const ScaleButton = ({ onPress, style, children }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => { scale.value = withSpring(0.95); };
  const handlePressOut = () => { scale.value = withSpring(1); };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View style={[style, animatedStyle]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

// --- Admin Floating Action Menu ---
const AdminFabMenu = ({ visible, onAdd, onAutoAssign, onClear, onRefresh, onAddBorder }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!visible) return null;

  return (
    <View style={styles.fabContainer}>
      {expanded && (
        <View style={styles.fabMenu}>
          <ScaleButton onPress={() => { onClear(); setExpanded(false); }} style={[styles.fabItem, { backgroundColor: '#EF4444' }]}>
            <View style={styles.fabLabelContainer}><Text style={styles.fabLabel}>Clear All</Text></View>
            <Ionicons name="trash-bin" size={20} color="#fff" />
          </ScaleButton>
          
          <ScaleButton onPress={() => { onAutoAssign(); setExpanded(false); }} style={[styles.fabItem, { backgroundColor: '#3B82F6' }]}>
            <View style={styles.fabLabelContainer}><Text style={styles.fabLabel}>Auto Assign</Text></View>
            <Ionicons name="flash" size={20} color="#fff" />
          </ScaleButton>
          
          <ScaleButton onPress={() => { onAdd(); setExpanded(false); }} style={[styles.fabItem, { backgroundColor: '#8B5CF6' }]}>
            <View style={styles.fabLabelContainer}><Text style={styles.fabLabel}>Add Booth</Text></View>
            <Ionicons name="add" size={24} color="#fff" />
          </ScaleButton>

          <ScaleButton onPress={() => { onAddBorder(); setExpanded(false); }} style={[styles.fabItem, { backgroundColor: '#F59E0B' }]}>
            <View style={styles.fabLabelContainer}><Text style={styles.fabLabel}>Add Border</Text></View>
            <Ionicons name="construct-outline" size={20} color="#fff" />
          </ScaleButton>

          <ScaleButton onPress={() => { onRefresh(); setExpanded(false); }} style={[styles.fabItem, { backgroundColor: '#10B981' }]}>
            <View style={styles.fabLabelContainer}><Text style={styles.fabLabel}>Refresh</Text></View>
            <Ionicons name="refresh" size={20} color="#fff" />
          </ScaleButton>
        </View>
      )}
      
      <ScaleButton onPress={() => setExpanded(!expanded)} style={styles.fabMain}>
        <LinearGradient
          colors={['#2563EB', '#1E40AF']}
          style={styles.fabGradient}
        >
          <Ionicons name={expanded ? "close" : "settings"} size={28} color="#fff" />
        </LinearGradient>
      </ScaleButton>
    </View>
  );
};

const MapScreenNew = ({ navigation, route, userRole: userRoleProp, userId: userIdProp }) => {
  // Support both route.params (from navigation) and direct props (from direct component usage)
  const { userRole, userId } = route?.params || { userRole: userRoleProp, userId: userIdProp };
  
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
  
  // Border state
  const [borders, setBorders] = useState([]);
  const [showAddBorderModal, setShowAddBorderModal] = useState(false);
  
  // Buildings state
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [newBorderData, setNewBorderData] = useState({
    type: 'structural',
    orientation: 'horizontal',
    length: 50,
    thickness: 8,
    strokeStyle: 'solid',
    color: '#475569',
    x1: 100,
    y1: 100,
  });

  const isAdmin = userRole === 'admin';
  
  console.log('MapScreenNew - userRole:', userRole);
  console.log('MapScreenNew - isAdmin:', isAdmin);

  // Fetch booths and borders from API
  useEffect(() => {
    fetchBooths();
    fetchBorders();
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
        const data = await response.json();
        
        console.log('🔍 /booths API raw response:', JSON.stringify(data).substring(0, 200));
        
        // Unwrap the response - API returns {success: true, data: [...]}
        const boothsArray = data.data || data.booths || (Array.isArray(data) ? data : []);
        
        // Fetch borders and buildings
        fetchBorders();
        fetchBuildings();
        
        console.log('✓ Booths array extracted:', Array.isArray(boothsArray) ? `${boothsArray.length} booths` : `NOT AN ARRAY (type: ${typeof boothsArray})`);
        
        if (Array.isArray(boothsArray) && boothsArray.length > 0) {
          const booth36 = boothsArray.find(b => b.booth_number === 36 || b.booth_number === '36');
          console.log('🔍 API booth example (36):', booth36 ? JSON.stringify(booth36) : 'NOT FOUND IN API');
          
          // Convert booths from DB to mobile canvas
          // Database: positions in map pixels (range ~2000-5200), sizes in METERS
          // Divisor 2.5: scale EVERYTHING bigger (positions AND sizes)
          // This maintains proportions: bigger booths AND bigger spacing
          const convertedBooths = boothsArray.map(apiBooth => ({
            booth_id: apiBooth.booth_id,
            booth_number: apiBooth.booth_number,
            x: (apiBooth.location_x || 0) / 2.5,  // Position: scale by 2.5
            y: (apiBooth.location_y || 0) / 2.5,  // Position: scale by 2.5
            width: ((apiBooth.width || 3) * 20) / 2.5,  // Size: scale by 2.5
            height: ((apiBooth.height || 3) * 20) / 2.5, // Size: scale by 2.5
            zone_type: apiBooth.zone_type || 'standard',
            shape: apiBooth.shape_type || 'rectangle',
            assigned_to_project: apiBooth.assigned_to_project,
            assigned_to_company: apiBooth.assigned_to_company,
            assigned_to_student_id: apiBooth.assigned_to_student_id,
            assigned_to_company_id: apiBooth.assigned_to_company_id,
            assignee: apiBooth.assignee,
            status: apiBooth.status || 'available',
          }));
          
          console.log(`✓ Loaded ${convertedBooths.length} booths from database (scaled to mobile canvas)`);
          
          // Debug: Show first 3 booth coordinates
          if (convertedBooths.length > 0) {
            console.log('📍 First 3 booths after scaling:');
            convertedBooths.slice(0, 3).forEach(b => {
              console.log(`  Booth ${b.booth_number}: x=${b.x.toFixed(1)}, y=${b.y.toFixed(1)}, w=${b.width.toFixed(1)}, h=${b.height.toFixed(1)}`);
            });
            console.log(`📐 Canvas: 9600×6400 (divisor 2.5 - proportional scaling)`);
            console.log(`📏 3m booth = (3×20)/2.5 = 24 pixels with proportional spacing`);
          }
          
          setBooths(convertedBooths);

          // Find user's booth
          if (userRole === 'student' || userRole === 'company') {
            const myBooth = convertedBooths.find(b => 
              (userRole === 'student' && b.assigned_to_student_id === userId) ||
              (userRole === 'company' && b.assigned_to_company_id === userId)
            );
            if (myBooth) {
              setUserBooth(myBooth.booth_number);
            }
          }
        } else {
          console.log('⚠️ API returned no booths');
          setBooths([]);
        }
      } else {
        console.log('⚠️ Booths fetch failed');
        setBooths([]);
      }
    } catch (error) {
      console.error('Error fetching booths:', error);
      setBooths([]);
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

  const handleViewDetails = (booth) => {
    setSelectedBooth(null);
    
    if (booth.assigned_to_project) {
      navigation.navigate('ProjectDetailsScreen', { projectId: booth.assigned_to_project });
    } else if (booth.assigned_to_company) {
      navigation.navigate('CompanyDetailsScreen', { companyId: booth.assigned_to_company });
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

  const fetchBorders = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/borders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const bordersArray = data.data || data.borders || (Array.isArray(data) ? data : []);
        setBorders(bordersArray);
        console.log('✓ Borders loaded:', bordersArray.length);
      } else {
        console.log('⚠️ No borders found or endpoint not available');
        setBorders([]);
      }
    } catch (error) {
      console.error('Error fetching borders:', error);
      setBorders([]);
    }
  };

  const fetchBuildings = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/buildings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const buildingsArray = data.data || data.buildings || (Array.isArray(data) ? data : []);
        setBuildings(buildingsArray);
        console.log('✓ Buildings loaded:', buildingsArray.length);
      } else {
        console.log('⚠️ No buildings found or endpoint not available');
        setBuildings([]);
      }
    } catch (error) {
      console.error('Error fetching buildings:', error);
      setBuildings([]);
    }
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

  const handleAddBorder = async () => {
    try {
      // Calculate x2, y2 based on orientation and length
      const { x1, y1, orientation, length } = newBorderData;
      const x2 = orientation === 'horizontal' ? x1 + length : x1;
      const y2 = orientation === 'vertical' ? y1 + length : y1;

      const borderPayload = {
        ...newBorderData,
        x1,
        y1,
        x2,
        y2,
      };

      const response = await fetch(`${API_URL}/borders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`
        },
        body: JSON.stringify(borderPayload)
      });

      if (response.ok) {
        Alert.alert('Success', 'Border added successfully');
        setShowAddBorderModal(false);
        setNewBorderData({
          type: 'structural',
          orientation: 'horizontal',
          length: 50,
          thickness: 8,
          strokeStyle: 'solid',
          color: '#475569',
          x1: 100,
          y1: 100,
        });
        await fetchBorders();
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'Failed to add border');
      }
    } catch (error) {
      console.error('Error adding border:', error);
      Alert.alert('Error', 'Failed to add border. API endpoint may not be available yet.');
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
              
              // Fetch all projects - try /admin/projects first, then fallback to /projects
              let projectsResponse = await fetch(`${API_URL}/admin/projects`, {
                headers: { 'Authorization': `Bearer ${token}` },
              });
              
              // If admin endpoint fails, try regular endpoint
              if (!projectsResponse.ok) {
                projectsResponse = await fetch(`${API_URL}/projects`, {
                  headers: { 'Authorization': `Bearer ${token}` },
                });
              }
              
              // Fetch all companies
              const companiesResponse = await fetch(`${API_URL}/companies`, {
                headers: { 'Authorization': `Bearer ${token}` },
              });

              if (!projectsResponse.ok && !companiesResponse.ok) {
                Alert.alert('Error', 'Failed to fetch projects and companies');
                return;
              }

              let allProjects = { data: [], projects: [] };
              let allCompanies = { data: [], companies: [] };

              if (projectsResponse.ok) {
                allProjects = await projectsResponse.json();
                console.log('✓ Projects response:', JSON.stringify(allProjects, null, 2));
              } else {
                console.log('✗ Projects fetch failed:', projectsResponse.status, await projectsResponse.text());
              }

              if (companiesResponse.ok) {
                allCompanies = await companiesResponse.json();
                console.log('✓ Companies response:', allCompanies);
              } else {
                console.log('✗ Companies fetch failed:', companiesResponse.status);
              }

              // Extract data from API response structure - try multiple possible formats
              const projectsData = allProjects.data || allProjects.projects || allProjects;
              const companiesData = allCompanies.data || allCompanies.companies || allCompanies;

              const approvedProjects = Array.isArray(projectsData) 
                ? projectsData.filter(p => p.status === 'approved' || p.status === 'Approved')
                : [];

              const companies = Array.isArray(companiesData) ? companiesData : [];

              console.log('📊 Total projects fetched:', Array.isArray(projectsData) ? projectsData.length : 0);
              console.log('✓ Approved projects:', approvedProjects.length);
              if (Array.isArray(projectsData) && projectsData.length > 0) {
                console.log('📋 Project statuses:', projectsData.map(p => ({ id: p.project_id, status: p.status, type: p.type })));
              }
              console.log('🏢 Companies:', companies.length);
              if (companies.length > 0) {
                console.log('📋 Company types:', companies.map(c => ({ id: c.company_id, name: c.company_name, type: c.type })));
              }

              if (approvedProjects.length === 0 && companies.length === 0) {
                Alert.alert(
                  'No Items to Assign',
                  'No approved projects or active companies were found. Please ensure:\n\n• Projects are approved by admin\n• Companies are registered with a type\n• API endpoints are accessible',
                  [{ text: 'OK', style: 'default' }]
                );
                return;
              }

              console.log('✓ Ready to assign:', approvedProjects.length, 'projects +', companies.length, 'companies');

              // Filter available booths by zone type (check multiple assignment properties)
              // IMPORTANT: Only include booths that exist in database (have booth_id)
              const isBoothAvailable = (b) => b.booth_id && !b.assignee && !b.assigned_to_project && !b.assigned_to_company && !b.assigned_to_student_id && !b.assigned_to_company_id;
              const engineeringBooths = booths.filter(b => isBoothAvailable(b) && b.zone_type === 'engineering');
              const scienceBooths = booths.filter(b => isBoothAvailable(b) && b.zone_type === 'science');
              const sponsorBooths = booths.filter(b => isBoothAvailable(b) && b.zone_type === 'sponsor');
              const serviceBooths = booths.filter(b => isBoothAvailable(b) && b.zone_type === 'service');

              console.log('Available booths:');
              console.log('Engineering:', engineeringBooths.length, engineeringBooths.map(b => b.booth_number));
              console.log('Science:', scienceBooths.length, scienceBooths.map(b => b.booth_number));
              console.log('Sponsor:', sponsorBooths.length, sponsorBooths.map(b => b.booth_number));
              console.log('Service:', serviceBooths.length, serviceBooths.map(b => b.booth_number));
              
              // Debug: Check what properties service booths have
              if (serviceBooths.length > 0) {
                console.log('📍 Service booth example:', JSON.stringify(serviceBooths[0], null, 2));
              }

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
              console.log('Sponsor companies to assign:', sponsorCompanies.length);
              for (let i = 0; i < Math.min(sponsorCompanies.length, sponsorBooths.length); i++) {
                console.log(`Assigning company ${sponsorCompanies[i].company_id} (${sponsorCompanies[i].company_name}) to booth ${sponsorBooths[i].booth_number}`);
                const response = await fetch(`${API_URL}/booths/${sponsorBooths[i].booth_id || sponsorBooths[i].booth_number}/assign`, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ companyId: sponsorCompanies[i].company_id }),
                });
                const result = await response.json();
                console.log('Company assignment result:', response.status, result);
                if (response.ok) assignedCount++;
              }

              // Assign service companies
              const serviceCompanies = companies.filter(c => c.type === 'service');
              console.log('Service companies to assign:', serviceCompanies.length);
              for (let i = 0; i < Math.min(serviceCompanies.length, serviceBooths.length); i++) {
                console.log(`Assigning company ${serviceCompanies[i].company_id} (${serviceCompanies[i].company_name}) to booth ${serviceBooths[i].booth_number}`);
                const response = await fetch(`${API_URL}/booths/${serviceBooths[i].booth_id || serviceBooths[i].booth_number}/assign`, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ companyId: serviceCompanies[i].company_id }),
                });
                const result = await response.json();
                console.log('Company assignment result:', response.status, result);
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
    await fetchBorders();
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
        <ActivityIndicator size="large" color={Colors.mainColor} />
        <Text style={styles.loadingText}>Loading Map Geometry...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoid}
        >
          <View style={[styles.mainContainer, IS_DESKTOP && styles.desktopContainer]}>
            
            {/* Header Section */}
            <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.header}>
              <View style={styles.headerTop}>
                <View>
                  <Text style={styles.headerTitle}>Expo Floor Plan</Text>
                  <Text style={styles.headerSubtitle}>University Plaza • {booths.length} Booths</Text>
                </View>
                
                {userBooth && (
                  <ScaleButton onPress={handleNavigateToMyBooth}>
                    <LinearGradient
                      colors={[Colors.mainColor, '#4F46E5']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.myBoothButton}
                    >
                      <Ionicons name="navigate-circle" size={20} color="#fff" />
                      <Text style={styles.myBoothButtonText}>My Booth</Text>
                    </LinearGradient>
                  </ScaleButton>
                )}
              </View>

              {/* Search Bar */}
              <View style={styles.searchWrapper}>
                <Ionicons name="search-outline" size={20} color="#9CA3AF" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Find booth, zone, or company..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={handleSearch}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={clearSearch}>
                    <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>

            {/* Map Container */}
            <Animated.View 
              entering={FadeInDown.delay(300).duration(600)} 
              style={[
                styles.mapCard, 
                isFullscreen && styles.mapCardFullscreen
              ]}
            >
              <View style={styles.mapHeaderOverlay}>
                <Text style={styles.mapStatusText}>
                  {highlightedBooth ? `Highlighted: ${highlightedBooth}` : 'Live Map'}
                </Text>
              </View>

              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.mainColor]} />}
                scrollEnabled={!isFullscreen}
              >
                <InteractiveMapMobile
                  booths={booths}
                  borders={borders}
                  buildings={buildings}
                  onBoothPress={handleBoothPress}
                  onBuildingPress={(building) => setSelectedBuilding(building)}
                  userBoothNumber={userBooth}
                  highlightBoothNumber={highlightedBooth}
                  isFullscreen={isFullscreen}
                  isAdmin={isAdmin}
                  onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
                  onBoothDrag={(boothNumber, newX, newY) => {
                    setBooths(prev => prev.map(b => 
                      b.booth_number === boothNumber 
                        ? { ...b, x: newX, y: newY }
                        : b
                    ));
                  }}
                  onBoothDragEnd={async (boothNumber, newX, newY) => {
                    try {
                      const token = await AsyncStorage.getItem('token');
                      const booth = booths.find(b => b.booth_number === boothNumber);
                      if (booth) {
                        // Convert mobile pixels back to database scale (multiply by 2.5)
                        const dbX = newX * 2.5;
                        const dbY = newY * 2.5;
                        
                        await fetch(`${API_URL}/booths/${booth.booth_id}`, {
                          method: 'PUT',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            location_x: Math.round(dbX),
                            location_y: Math.round(dbY),
                          }),
                        });
                      }
                    } catch (error) {
                      console.error('Error saving booth position:', error);
                    }
                  }}
                />
              </ScrollView>
              
              {/* Floating Legend */}
              <View style={styles.legendWrapper}>
                <TouchableOpacity 
                  style={styles.legendToggle}
                  onPress={() => setLegendCollapsed(!legendCollapsed)}
                >
                  <Text style={styles.legendToggleText}>Zone Guide</Text>
                  <Ionicons name={legendCollapsed ? "chevron-up" : "chevron-down"} size={16} color="#4B5563" />
                </TouchableOpacity>
                {!legendCollapsed && (
                  <Animated.View entering={FadeInRight} style={styles.legendContent}>
                    <MapLegend />
                  </Animated.View>
                )}
              </View>
            </Animated.View>

            {/* Admin Floating Actions */}
            <AdminFabMenu 
              visible={isAdmin} 
              onAdd={() => setShowAddBoothModal(true)}
              onAddBorder={() => setShowAddBorderModal(true)}
              onAutoAssign={handleAutoAssign} 
              onClear={handleDeassignAll}
              onRefresh={onRefresh}
            />

          </View>
        </KeyboardAvoidingView>

        {/* Add Booth Modal */}
        <Modal
          visible={showAddBoothModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAddBoothModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Add New Booth</Text>
                  <Text style={styles.modalSubtitle}>Configure location and size</Text>
                </View>
                <TouchableOpacity onPress={() => setShowAddBoothModal(false)} style={styles.closeModalBtn}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Booth Number</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="grid-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                    <TextInput
                      style={styles.modalInput}
                      placeholder="e.g. B-102"
                      value={newBoothData.booth_number}
                      onChangeText={(t) => setNewBoothData({...newBoothData, booth_number: t})}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Zone Type</Text>
                  <View style={styles.zoneSelector}>
                    {['engineering', 'sponsor', 'service', 'science'].map((zone) => (
                      <TouchableOpacity
                        key={zone}
                        style={[
                          styles.zoneChip,
                          newBoothData.zone_type === zone && styles.zoneChipActive(zone)
                        ]}
                        onPress={() => setNewBoothData({...newBoothData, zone_type: zone})}
                      >
                        <Text style={[
                          styles.zoneChipText,
                          newBoothData.zone_type === zone && { color: '#fff' }
                        ]}>
                          {zone.charAt(0).toUpperCase() + zone.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>Width (m)</Text>
                    <TextInput
                      style={styles.modalInputSimple}
                      keyboardType="numeric"
                      placeholder="3.0"
                      value={String(newBoothData.width)}
                      onChangeText={(t) => setNewBoothData({...newBoothData, width: parseFloat(t) || 3.0})}
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.label}>Height (m)</Text>
                    <TextInput
                      style={styles.modalInputSimple}
                      keyboardType="numeric"
                      placeholder="3.0"
                      value={String(newBoothData.height)}
                      onChangeText={(t) => setNewBoothData({...newBoothData, height: parseFloat(t) || 3.0})}
                    />
                  </View>
                </View>
                
                <View style={styles.row}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>Pos X</Text>
                    <TextInput 
                      style={styles.modalInputSimple} 
                      placeholder="100" 
                      keyboardType="numeric"
                      value={String(newBoothData.location_x)}
                      onChangeText={(t) => setNewBoothData({...newBoothData, location_x: parseFloat(t) || 100})}
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.label}>Pos Y</Text>
                    <TextInput 
                      style={styles.modalInputSimple} 
                      placeholder="100" 
                      keyboardType="numeric"
                      value={String(newBoothData.location_y)}
                      onChangeText={(t) => setNewBoothData({...newBoothData, location_y: parseFloat(t) || 100})}
                    />
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity onPress={() => setShowAddBoothModal(false)} style={styles.btnSecondary}>
                  <Text style={styles.btnSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAddBooth} style={styles.btnPrimary}>
                  <LinearGradient
                    colors={[Colors.mainColor, '#4F46E5']}
                    style={styles.gradientBtn}
                  >
                    <Text style={styles.btnPrimaryText}>Create Booth</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Add Border Modal */}
        <Modal
          visible={showAddBorderModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAddBorderModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Add Border</Text>
                  <Text style={styles.modalSubtitle}>Create structural walls or zone boundaries</Text>
                </View>
                <TouchableOpacity onPress={() => setShowAddBorderModal(false)} style={styles.closeModalBtn}>
                  <Ionicons name="close" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Border Type</Text>
                  <View style={styles.zoneSelector}>
                    {['structural', 'zone', 'pathway'].map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.zoneChip,
                          newBorderData.type === type && {
                            backgroundColor: type === 'structural' ? '#475569' : type === 'zone' ? '#3B82F6' : '#10B981',
                            shadowColor: '#000',
                            shadowOpacity: 0.15,
                            shadowOffset: { width: 0, height: 2 },
                            elevation: 3,
                          }
                        ]}
                        onPress={() => {
                          const colors = { structural: '#475569', zone: '#3B82F6', pathway: '#10B981' };
                          const thicknesses = { structural: 8, zone: 6, pathway: 4 };
                          const styles = { structural: 'solid', zone: 'dashed', pathway: 'dotted' };
                          setNewBorderData({
                            ...newBorderData,
                            type,
                            color: colors[type],
                            thickness: thicknesses[type],
                            strokeStyle: styles[type]
                          });
                        }}
                      >
                        <Text style={[
                          styles.zoneChipText,
                          newBorderData.type === type && { color: '#fff' }
                        ]}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.helpText}>
                    {newBorderData.type === 'structural' && '• Solid gray walls (8px)'}
                    {newBorderData.type === 'zone' && '• Dashed blue boundaries (6px)'}
                    {newBorderData.type === 'pathway' && '• Dotted green paths (4px)'}
                  </Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Orientation</Text>
                  <View style={styles.zoneSelector}>
                    {['horizontal', 'vertical'].map((orient) => (
                      <TouchableOpacity
                        key={orient}
                        style={[
                          styles.zoneChip,
                          newBorderData.orientation === orient && {
                            backgroundColor: '#8B5CF6',
                            shadowColor: '#000',
                            shadowOpacity: 0.15,
                            shadowOffset: { width: 0, height: 2 },
                            elevation: 3,
                          }
                        ]}
                        onPress={() => setNewBorderData({...newBorderData, orientation: orient})}
                      >
                        <Text style={[
                          styles.zoneChipText,
                          newBorderData.orientation === orient && { color: '#fff' }
                        ]}>
                          {orient.charAt(0).toUpperCase() + orient.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Length (meters): {newBorderData.length}m</Text>
                  <View style={styles.sliderContainer}>
                    <Text style={styles.sliderLabel}>10m</Text>
                    <TextInput
                      style={styles.modalInputSimple}
                      keyboardType="numeric"
                      placeholder="50"
                      value={String(newBorderData.length)}
                      onChangeText={(t) => {
                        const val = parseFloat(t) || 10;
                        setNewBorderData({...newBorderData, length: Math.max(10, Math.min(100, val))});
                      }}
                    />
                    <Text style={styles.sliderLabel}>100m</Text>
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>Start X</Text>
                    <TextInput
                      style={styles.modalInputSimple}
                      keyboardType="numeric"
                      placeholder="100"
                      value={String(newBorderData.x1)}
                      onChangeText={(t) => setNewBorderData({...newBorderData, x1: parseFloat(t) || 100})}
                    />
                  </View>
                  <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.label}>Start Y</Text>
                    <TextInput
                      style={styles.modalInputSimple}
                      keyboardType="numeric"
                      placeholder="100"
                      value={String(newBorderData.y1)}
                      onChangeText={(t) => setNewBorderData({...newBorderData, y1: parseFloat(t) || 100})}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Preview</Text>
                  <View style={styles.borderPreview}>
                    <Text style={styles.borderPreviewText}>
                      {newBorderData.orientation === 'horizontal' ? '━' : '┃'} {newBorderData.type.toUpperCase()}
                    </Text>
                    <Text style={styles.borderPreviewDetail}>
                      From ({newBorderData.x1}, {newBorderData.y1}) • {newBorderData.length}m {newBorderData.orientation}
                    </Text>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity onPress={() => setShowAddBorderModal(false)} style={styles.btnSecondary}>
                  <Text style={styles.btnSecondaryText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAddBorder} style={styles.btnPrimary}>
                  <LinearGradient
                    colors={['#F59E0B', '#D97706']}
                    style={styles.gradientBtn}
                  >
                    <Text style={styles.btnPrimaryText}>Create Border</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <BoothDetailsModal
          visible={!!selectedBooth}
          booth={selectedBooth}
          onClose={handleCloseModal}
          onAssign={handleAssign}
          onDeassign={handleDeassign}
          onViewDetails={handleViewDetails}
          isAdmin={isAdmin}
        />

        <BuildingModal
          visible={!!selectedBuilding}
          building={selectedBuilding}
          onClose={() => setSelectedBuilding(null)}
        />

      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  desktopContainer: {
    maxWidth: 1024,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    color: '#64748B',
    fontSize: 16,
    fontWeight: '500',
  },
  
  // Header
  header: {
    marginTop: Platform.OS === 'android' ? 40 : 10,
    marginBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  myBoothButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 50,
    shadowColor: Colors.mainColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  myBoothButtonText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 14,
  },

  // Search
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
  },

  // Map Card
  mapCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 20,
    position: 'relative',
  },
  mapCardFullscreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    borderRadius: 0,
    margin: 0,
  },
  mapHeaderOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
    alignItems: 'center',
  },
  mapStatusText: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '700',
    color: Colors.mainColor,
    overflow: 'hidden',
  },
  fullscreenBtn: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  // Legend
  legendWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    zIndex: 10,
  },
  legendToggle: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  legendToggleText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
    marginRight: 6,
  },
  legendContent: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  // FAB Menu
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    alignItems: 'flex-end',
    zIndex: 100,
  },
  fabMenu: {
    marginBottom: 16,
    alignItems: 'flex-end',
    gap: 12,
  },
  fabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  fabLabelContainer: {
    position: 'absolute',
    right: 54,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    shadowOpacity: 0.1,
    elevation: 2,
  },
  fabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    whiteSpace: 'nowrap',
  },
  fabMain: {
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 6,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  fabGradient: {
    flex: 1,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 0,
    height: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  closeModalBtn: {
    padding: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
  },
  modalBody: {
    padding: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  modalInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    marginLeft: 10,
  },
  modalInputSimple: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 16,
    color: '#0F172A',
  },
  inputIcon: {
    opacity: 0.7,
  },
  zoneSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  zoneChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  zoneChipActive: (type) => ({
    backgroundColor: 
      type === 'engineering' ? '#3B82F6' : 
      type === 'science' ? '#10B981' : 
      type === 'sponsor' ? '#F59E0B' : '#8B5CF6',
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  }),
  zoneChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    gap: 16,
    backgroundColor: '#fff',
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  btnSecondary: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  btnSecondaryText: {
    color: '#475569',
    fontWeight: '600',
    fontSize: 16,
  },
  btnPrimary: {
    flex: 2,
    height: 50,
    borderRadius: 14,
    shadowColor: Colors.mainColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  gradientBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  helpText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
    fontStyle: 'italic',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  borderPreview: {
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  borderPreviewText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  borderPreviewDetail: {
    fontSize: 12,
    color: '#64748B',
  },
});

export default MapScreenNew;
