import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../constants/constants";

const MessageBubble = ({ message, isCurrentUser }) => {
  const formatTime = (date) => {
    if (!date) return "";
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <View
      style={[
        styles.container,
        isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
        ]}
      >
        {!isCurrentUser && (
          <Text style={styles.senderName}>{message.senderName}</Text>
        )}
        <Text
          style={[
            styles.messageText,
            isCurrentUser ? styles.currentUserText : styles.otherUserText,
          ]}
        >
          {message.text}
        </Text>
        <Text
          style={[
            styles.timeText,
            isCurrentUser ? styles.currentUserTime : styles.otherUserTime,
          ]}
        >
          {formatTime(message.createdAt)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  currentUserContainer: {
    alignItems: "flex-end",
  },
  otherUserContainer: {
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  currentUserBubble: {
    backgroundColor: Colors.mainColor,
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.mainColor,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  currentUserText: {
    color: "#fff",
  },
  otherUserText: {
    color: "#333",
  },
  timeText: {
    fontSize: 11,
    marginTop: 4,
  },
  currentUserTime: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "right",
  },
  otherUserTime: {
    color: "#999",
    textAlign: "left",
  },
});

export default MessageBubble;
