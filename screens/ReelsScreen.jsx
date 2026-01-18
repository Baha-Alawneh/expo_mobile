import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAllReels, getUserReels } from "../apis/reel/Reel";
import { getStudentData } from "../apis/student/Student";
import { getCompanyData } from "../apis/company/Company";
import ReelsFeed from "../components/ReelsFeed";
import MyReelsTab from "../components/MyReelsTab";
import { useFocusEffect } from "@react-navigation/native";

const ReelsScreen = ({ navigation, route }) => {
  const { userRole } = route.params || {};
  
  // States
  const [activeTab, setActiveTab] = useState("all"); // "all" or "my-account"
  const [subTab, setSubTab] = useState("my-reels"); // "my-reels" or "add-new" (for my-account tab)
  const [allReels, setAllReels] = useState([]);
  const [myReels, setMyReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);

  // Check if user can upload (student or company)
  const canUpload = userRole === "student" || userRole === "company";

  // Load user data
  useEffect(() => {
    loadUserData();
  }, []);

  // Reload reels when screen comes into focus or when activeTab/userId changes
  useFocusEffect(
    useCallback(() => {
      const fetchReels = async () => {
        try {
          setLoading(true);
          
          if (activeTab === "all") {
            const response = await getAllReels();
            if (response.success) {
              setAllReels(response.data || []);
            }
          } else if (activeTab === "my-account" && userId) {
            const response = await getUserReels(userId);
            if (response.success) {
              setMyReels(response.data || []);
            }
          }
        } catch (error) {
          console.error("Error fetching reels:", error);
          Alert.alert("Error", "Failed to load reels. Please try again.");
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      };

      fetchReels();
    }, [activeTab, userId])
  );

  const loadUserData = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId");
      const storedUserName = await AsyncStorage.getItem("userName");
      const storedUserEmail = await AsyncStorage.getItem("userEmail");
      
      setUserId(storedUserId);
      
      // Fetch user's profile image from their reels (same as All Reels page)
      let profileImage = null;
      if (storedUserId) {
        try {
          const reelsResponse = await getUserReels(storedUserId);
          console.log('Fetched user reels for profile:', reelsResponse.success, 'Count:', reelsResponse.data?.length);
          
          if (reelsResponse.success && reelsResponse.data && reelsResponse.data.length > 0) {
            const firstReel = reelsResponse.data[0];
            
            // Use the same fields as All Reels page
            profileImage = firstReel.user_photo || firstReel.student_photo || firstReel.company_photo || null;
            
            console.log('My Account profile image fields:', {
              user_photo: !!firstReel.user_photo,
              student_photo: !!firstReel.student_photo,
              company_photo: !!firstReel.company_photo,
              selected: !!profileImage
            });
            
            if (profileImage) {
              console.log('My Account profile image URL (first 100 chars):', profileImage.substring(0, 100));
            }
          } else {
            console.log('No reels found for user, cannot load profile image');
          }
        } catch (err) {
          console.log("Could not fetch profile image from reels:", err);
        }
      }
      
      setUserData({
        name: storedUserName,
        email: storedUserEmail,
        profileImage: profileImage,
      });
      
      console.log('User data set:', {
        name: storedUserName,
        email: storedUserEmail,
        hasProfileImage: !!profileImage
      });
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const refreshReels = useCallback(async () => {
    try {
      setLoading(true);
      
      if (activeTab === "all") {
        const response = await getAllReels();
        if (response.success) {
          setAllReels(response.data || []);
        }
      } else if (activeTab === "my-account" && userId) {
        const response = await getUserReels(userId);
        if (response.success) {
          setMyReels(response.data || []);
          
          // Update profile image from reels data (same as All Reels page)
          if (response.data && response.data.length > 0) {
            const firstReel = response.data[0];
            const profileImage = firstReel.user_photo || firstReel.student_photo || firstReel.company_photo || null;
            
            setUserData(prev => ({
              ...prev,
              profileImage: profileImage,
            }));
            
            console.log('Refreshed My Account profile image:', !!profileImage);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching reels:", error);
      Alert.alert("Error", "Failed to load reels. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, userId]);

  const handleRefresh = () => {
    setRefreshing(true);
    refreshReels();
  };

  const handleReelUploaded = () => {
    // Refresh both feeds after upload
    refreshReels();
    setSubTab("my-reels");
  };

  const handleReelDeleted = () => {
    // Refresh feeds after deletion
    refreshReels();
  };

  const renderTabButtons = () => {
    if (!canUpload) {
      // Visitors only see "All Reels"
      return (
        <View style={styles.tabContainer}>
          <View style={styles.singleTab}>
            <Ionicons name="play-circle" size={24} color={Colors.mainColor} />
            <Text style={styles.singleTabText}>All Reels</Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "all" && styles.activeTab]}
          onPress={() => setActiveTab("all")}
        >
          <Ionicons
            name="play-circle"
            size={22}
            color={activeTab === "all" ? Colors.mainColor : "#666"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "all" && styles.activeTabText,
            ]}
          >
            All Reels
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "my-account" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("my-account")}
        >
          <Ionicons
            name="person-circle"
            size={22}
            color={activeTab === "my-account" ? Colors.mainColor : "#666"}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "my-account" && styles.activeTabText,
            ]}
          >
            My Account
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.mainColor} />
          <Text style={styles.loadingText}>Loading reels...</Text>
        </View>
      );
    }

    if (activeTab === "all") {
      return (
        <ReelsFeed
          reels={allReels}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          navigation={navigation}
        />
      );
    }

    if (activeTab === "my-account") {
      return (
        <MyReelsTab
          userId={userId}
          userData={userData}
          myReels={myReels}
          subTab={subTab}
          setSubTab={setSubTab}
          onReelUploaded={handleReelUploaded}
          onReelDeleted={handleReelDeleted}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.mainColor} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reels</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Tab Buttons */}
      {renderTabButtons()}

      {/* Content */}
      <View style={styles.content}>{renderContent()}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.mainColor,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  headerRight: {
    width: 40,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  singleTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderBottomWidth: 3,
    borderBottomColor: Colors.mainColor,
  },
  singleTabText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.mainColor,
    marginLeft: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: Colors.mainColor,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginLeft: 6,
  },
  activeTabText: {
    color: Colors.mainColor,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
});

export default ReelsScreen;
