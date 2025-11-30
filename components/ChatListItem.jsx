import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/constants";

const ChatListItem = ({ chat, onPress }) => {
  const formatTime = (date) => {
    if (!date) return "";
    const d = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "student":
        return "school";
      case "company":
        return "business";
      case "visitor":
        return "eye";
      default:
        return "person";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "student":
        return "#667eea";
      case "company":
        return "#f5576c";
      case "visitor":
        return "#00f2fe";
      default:
        return Colors.GRAY;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, chat.unreadCount > 0 && styles.unreadContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        {chat.otherUser.photoUrl ? (
          <Image
            source={{ uri: chat.otherUser.photoUrl }}
            style={styles.avatar}
          />
        ) : (
          <View
            style={[
              styles.avatarPlaceholder,
              { backgroundColor: getTypeColor(chat.otherUser.type) },
            ]}
          >
            <Ionicons name="person" size={24} color="#fff" />
          </View>
        )}
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: getTypeColor(chat.otherUser.type) },
          ]}
        >
          <Ionicons
            name={getTypeIcon(chat.otherUser.type)}
            size={10}
            color="#fff"
          />
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>
            {chat.otherUser.name}
          </Text>
          <Text style={styles.time}>{formatTime(chat.lastMessageTime)}</Text>
        </View>

        <View style={styles.messageRow}>
          <Text
            style={[
              styles.lastMessage,
              chat.unreadCount > 0 && styles.unreadMessage,
            ]}
            numberOfLines={1}
          >
            {chat.lastMessage || "No messages yet"}
          </Text>
          {chat.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  unreadContainer: {
    backgroundColor: "#F8F9FF",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E0E0E0",
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  typeBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: "#999",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
    flex: 1,
    marginRight: 8,
  },
  unreadMessage: {
    fontWeight: "600",
    color: "#333",
  },
  unreadBadge: {
    backgroundColor: Colors.mainColor,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  unreadText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
});

export default ChatListItem;
