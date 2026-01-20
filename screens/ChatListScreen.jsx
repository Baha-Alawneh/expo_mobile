import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Image,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ChatListItem from "../components/ChatListItem";
import {
  subscribeToChats,
  getUsersByType,
  createOrGetChat,
} from "../utils/chatService";
import { getStudentData } from "../apis/student/Student";
import { getCompanyData } from "../apis/company/Company";

const { width } = Dimensions.get("window");

const ChatListScreen = ({ navigation }) => {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserType, setCurrentUserType] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [chats, setChats] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [displayList, setDisplayList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    initializeUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      // Subscribe to existing chats
      const unsubscribe = subscribeToChats(currentUserId, (chatList) => {
        setChats(chatList);
        setLoading(false);
      });

      // Fetch all users for discovery
      fetchAllUsers();

      return () => unsubscribe();
    }
  }, [currentUserId]);

  useEffect(() => {
    updateDisplayList();
  }, [chats, allUsers, selectedFilter, searchQuery]);

  const initializeUser = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      const userType = await AsyncStorage.getItem("userType");
      setCurrentUserId(userId);
      setCurrentUserType(userType);
    } catch (error) {
      console.error("Error initializing user:", error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      // Fetch only students and companies (exclude visitors and admins)
      const [studentsResult, companiesResult] =
        await Promise.all([
          getUsersByType("student"),
          getUsersByType("company"),
        ]);

      // Extract data arrays from results
      const students = studentsResult.success ? studentsResult.data : [];
      const companies = companiesResult.success ? companiesResult.data : [];

      // Fetch profile images from backend API for each user
      const enrichedStudents = await Promise.all(
        students.map(async (user) => {
          try {
            const profileResult = await getStudentData(user.id);
            if (profileResult.success && profileResult.data) {
              return {
                ...user,
                photoUrl: profileResult.data.photo_url || user.photoUrl || "",
              };
            }
          } catch (err) {
            console.log(`Error fetching student ${user.id} profile:`, err);
          }
          return user;
        })
      );

      const enrichedCompanies = await Promise.all(
        companies.map(async (user) => {
          try {
            const profileResult = await getCompanyData(user.id);
            if (profileResult.success && profileResult.data) {
              return {
                ...user,
                photoUrl: profileResult.data.profile_image_url || user.photoUrl || "",
              };
            }
          } catch (err) {
            console.log(`Error fetching company ${user.id} profile:`, err);
          }
          return user;
        })
      );

      const combined = [...enrichedStudents, ...enrichedCompanies].filter(
        (user) => user.id !== currentUserId // Exclude current user
      );

      setAllUsers(combined);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const updateDisplayList = () => {
    // Get user IDs that already have chats
    const chatUserIds = new Set(chats.map((chat) => chat.otherUser.id));

    // Filter users based on selected filter
    let filteredUsers = allUsers;
    if (selectedFilter !== "all") {
      filteredUsers = allUsers.filter((user) => user.type === selectedFilter);
    }

    // Create display items: existing chats + new users
    const items = [];

    // Add existing chats first
    const filteredChats =
      selectedFilter === "all"
        ? chats
        : chats.filter((chat) => chat.otherUser.type === selectedFilter);

    items.push(
      ...filteredChats.map((chat) => ({
        ...chat,
        hasChat: true,
      }))
    );

    // Add users without chats
    const usersWithoutChats = filteredUsers.filter(
      (user) => !chatUserIds.has(user.id)
    );

    items.push(
      ...usersWithoutChats.map((user) => ({
        id: `new-${user.id}`,
        otherUser: user,
        lastMessage: "",
        lastMessageTime: null,
        unreadCount: 0,
        hasChat: false,
      }))
    );

    // Apply search filter if search query exists
    let finalItems = items;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      finalItems = items.filter((item) =>
        item.otherUser.name.toLowerCase().includes(query)
      );
    }

    setDisplayList(finalItems);
  };

  const handleItemPress = async (item) => {
    if (item.hasChat) {
      // Navigate to existing conversation
      navigation.navigate("ConversationScreen", {
        chatId: item.id,
        otherUser: item.otherUser,
      });
    } else {
      // Create new chat and navigate
      try {
        const result = await createOrGetChat(currentUserId, item.otherUser.id);
        if (result.success) {
          navigation.navigate("ConversationScreen", {
            chatId: result.chatId,
            otherUser: item.otherUser,
          });
        }
      } catch (error) {
        console.error("Error creating chat:", error);
      }
    }
  };

  const renderFilterTab = (filter, label, icon = null) => {
    const isActive = selectedFilter === filter;
    return (
      <TouchableOpacity
        style={[styles.filterTab, isActive && styles.filterTabActive]}
        onPress={() => setSelectedFilter(filter)}
        activeOpacity={0.7}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={isActive ? Colors.mainColor : "#666"}
            style={styles.filterIcon}
          />
        )}
        <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
          {label}
        </Text>
        {isActive && <View style={styles.filterIndicator} />}
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }) => {
    if (item.hasChat) {
      // Render existing chat
      return <ChatListItem chat={item} onPress={() => handleItemPress(item)} />;
    } else {
      // Render new user (no chat yet)
      const getAvatarColor = (type) => {
        switch (type) {
          case "student":
            return "#4CAF50";
          case "company":
            return "#2196F3";
          default:
            return "#9E9E9E";
        }
      };

      return (
        <TouchableOpacity
          style={styles.newUserItem}
          onPress={() => handleItemPress(item)}
          activeOpacity={0.7}
        >
          {item.otherUser.photoUrl ? (
            <Image
              source={{ uri: item.otherUser.photoUrl }}
              style={styles.newUserAvatarImage}
            />
          ) : (
            <View
              style={[
                styles.newUserAvatar,
                { backgroundColor: getAvatarColor(item.otherUser.type) },
              ]}
            >
              <Ionicons name="person" size={24} color="#fff" />
            </View>
          )}
          <View style={styles.newUserInfo}>
            <Text style={styles.newUserName}>{item.otherUser.name}</Text>
            <Text style={styles.newUserType}>
              {item.otherUser.type === "student"
                ? "Student"
                : item.otherUser.type === "company"
                ? "Company"
                : "Visitor"}
              {" • "}
              <Text style={styles.newUserSubtext}>Tap to start chat</Text>
            </Text>
          </View>
          <Ionicons
            name="chatbubble-outline"
            size={20}
            color={Colors.mainColor}
          />
        </TouchableOpacity>
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.mainColor} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchAllUsers}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {renderFilterTab("all", "All")}
          {renderFilterTab("student", "Students", "school")}
          {renderFilterTab("company", "Companies", "business")}
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* User/Chat List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.mainColor} />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : displayList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={80} color="#E0E0E0" />
            <Text style={styles.emptyText}>
              {searchQuery.trim() ? "No results found" : "No users found"}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery.trim()
                ? `No matches for "${searchQuery}"`
                : selectedFilter === "all"
                ? "Check back later or refresh"
                : `No ${selectedFilter}s available`}
            </Text>
          </View>
        ) : (
          <FlatList
            data={displayList}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.mainColor,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: Colors.mainColor,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  refreshButton: {
    padding: 4,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
    flex: 1,
    textAlign: "center",
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    position: "relative",
  },
  filterTabActive: {
    backgroundColor: "#F8F9FA",
  },
  filterIcon: {
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  filterTextActive: {
    color: Colors.mainColor,
    fontWeight: "700",
  },
  filterIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.mainColor,
    borderRadius: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#999",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#999",
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#B0B0B0",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  newUserItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  newUserAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.mainColor,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  newUserAvatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: "#f0f0f0",
  },
  newUserInfo: {
    flex: 1,
  },
  newUserName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  newUserType: {
    fontSize: 13,
    color: "#666",
    textTransform: "capitalize",
  },
  newUserSubtext: {
    fontSize: 13,
    color: Colors.mainColor,
    fontStyle: "italic",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default ChatListScreen;
