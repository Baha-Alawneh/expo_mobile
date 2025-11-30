import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MessageBubble from "../components/MessageBubble";
import ChatListItem from "../components/ChatListItem";
import {
  getUsersByType,
  createOrGetChat,
  sendMessage,
  subscribeToMessages,
  subscribeToChats,
  markMessagesAsRead,
} from "../utils/chatService";

const ChatScreen = ({ navigation }) => {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserName, setCurrentUserName] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    initializeUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      const unsubscribe = subscribeToChats(currentUserId, (chatList) => {
        setChats(chatList);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [currentUserId]);

  useEffect(() => {
    filterChats();
  }, [chats, selectedFilter]);

  useEffect(() => {
    if (selectedChat) {
      const unsubscribe = subscribeToMessages(selectedChat.id, (msgs) => {
        setMessages(msgs);
        // Auto-scroll to bottom when new messages arrive
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      });

      // Mark messages as read when opening chat
      markMessagesAsRead(selectedChat.id, currentUserId);

      return () => unsubscribe();
    }
  }, [selectedChat]);

  const initializeUser = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      const userName = (await AsyncStorage.getItem("userName")) || "You";
      setCurrentUserId(userId);
      setCurrentUserName(userName);
    } catch (error) {
      console.error("Error initializing user:", error);
    }
  };

  const filterChats = () => {
    if (selectedFilter === "all") {
      setFilteredChats(chats);
    } else {
      setFilteredChats(
        chats.filter((chat) => chat.otherUser.type === selectedFilter)
      );
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    markMessagesAsRead(chat.id, currentUserId);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat) return;

    setSendingMessage(true);
    const text = messageText.trim();
    setMessageText("");

    try {
      await sendMessage(selectedChat.id, currentUserId, text, currentUserName);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessageText(text); // Restore message on error
    } finally {
      setSendingMessage(false);
    }
  };

  const handleStartNewChat = async (user) => {
    try {
      const result = await createOrGetChat(currentUserId, user.id);
      if (result.success) {
        // Find or create chat object
        const existingChat = chats.find((c) => c.id === result.chatId);
        if (existingChat) {
          setSelectedChat(existingChat);
        } else {
          // Create temporary chat object
          const newChat = {
            id: result.chatId,
            otherUser: user,
            lastMessage: "",
            unreadCount: 0,
          };
          setSelectedChat(newChat);
        }
      }
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const renderSidebar = () => (
    <View style={styles.sidebar}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            selectedFilter === "all" && styles.filterTabActive,
          ]}
          onPress={() => setSelectedFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              selectedFilter === "all" && styles.filterTextActive,
            ]}
          >
            All
          </Text>
          {selectedFilter === "all" && <View style={styles.filterIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            selectedFilter === "student" && styles.filterTabActive,
          ]}
          onPress={() => setSelectedFilter("student")}
        >
          <Ionicons
            name="school"
            size={18}
            color={selectedFilter === "student" ? Colors.mainColor : "#999"}
          />
          <Text
            style={[
              styles.filterText,
              selectedFilter === "student" && styles.filterTextActive,
            ]}
          >
            Students
          </Text>
          {selectedFilter === "student" && (
            <View style={styles.filterIndicator} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            selectedFilter === "company" && styles.filterTabActive,
          ]}
          onPress={() => setSelectedFilter("company")}
        >
          <Ionicons
            name="business"
            size={18}
            color={selectedFilter === "company" ? Colors.mainColor : "#999"}
          />
          <Text
            style={[
              styles.filterText,
              selectedFilter === "company" && styles.filterTextActive,
            ]}
          >
            Companies
          </Text>
          {selectedFilter === "company" && (
            <View style={styles.filterIndicator} />
          )}
        </TouchableOpacity>
      </View>

      {/* Chat List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.mainColor} />
        </View>
      ) : filteredChats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptySubtext}>
            Start chatting by selecting a user
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatListItem chat={item} onPress={() => handleChatSelect(item)} />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );

  const renderChatWindow = () => {
    if (!selectedChat) {
      return (
        <View style={styles.noChatSelected}>
          <Ionicons name="chatbubbles" size={80} color="#E0E0E0" />
          <Text style={styles.noChatText}>Select a conversation</Text>
          <Text style={styles.noChatSubtext}>
            Choose a chat from the list to start messaging
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.chatWindow}>
        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setSelectedChat(null)}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.mainColor} />
          </TouchableOpacity>

          <View style={styles.chatHeaderUser}>
            {selectedChat.otherUser.photoUrl ? (
              <Image
                source={{ uri: selectedChat.otherUser.photoUrl }}
                style={styles.chatHeaderAvatar}
              />
            ) : (
              <View style={styles.chatHeaderAvatarPlaceholder}>
                <Ionicons name="person" size={24} color="#fff" />
              </View>
            )}
            <View style={styles.chatHeaderInfo}>
              <Text style={styles.chatHeaderName}>
                {selectedChat.otherUser.name}
              </Text>
              <Text style={styles.chatHeaderType}>
                {selectedChat.otherUser.type}
              </Text>
            </View>
          </View>
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isCurrentUser={item.senderId === currentUserId}
            />
          )}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
        />

        {/* Message Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.messageInput}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!messageText.trim() || sendingMessage) &&
                  styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!messageText.trim() || sendingMessage}
            >
              {sendingMessage ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.mainColor} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Messages</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {renderSidebar()}
          {renderChatWindow()}
        </View>
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
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerBackButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  headerSpacer: {
    width: 32,
  },
  mainContent: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    width: "40%",
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderRightColor: "#E0E0E0",
  },
  filterContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    backgroundColor: "#F8F9FA",
  },
  filterTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    position: "relative",
  },
  filterTabActive: {
    backgroundColor: "#fff",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#999",
  },
  filterTextActive: {
    color: Colors.mainColor,
  },
  filterIndicator: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.mainColor,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#999",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#ccc",
    marginTop: 8,
    textAlign: "center",
  },
  chatWindow: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  noChatSelected: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  noChatText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#999",
    marginTop: 20,
  },
  noChatSubtext: {
    fontSize: 14,
    color: "#ccc",
    marginTop: 8,
    textAlign: "center",
  },
  chatHeader: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 4,
    marginRight: 12,
  },
  chatHeaderUser: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  chatHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  chatHeaderAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.mainColor,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  chatHeaderType: {
    fontSize: 12,
    color: "#999",
    textTransform: "capitalize",
  },
  messagesList: {
    paddingVertical: 16,
    flexGrow: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  messageInput: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: "#333",
    maxHeight: 100,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.mainColor,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: Colors.mainColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
    elevation: 0,
    shadowOpacity: 0,
  },
});

export default ChatScreen;
