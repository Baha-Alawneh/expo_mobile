import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { sendNotification, getAllUsers } from "../apis/admin/Admin";

const ICON_OPTIONS = [
  { name: "notifications", label: "Bell" },
  { name: "information-circle", label: "Info" },
  { name: "checkmark-circle", label: "Success" },
  { name: "warning", label: "Warning" },
  { name: "alert-circle", label: "Alert" },
  { name: "mail", label: "Mail" },
  { name: "megaphone", label: "Announcement" },
  { name: "star", label: "Star" },
  { name: "flame", label: "Hot" },
  { name: "trophy", label: "Achievement" },
];

const TARGET_OPTIONS = [
  { value: "all", label: "All Users", icon: "people" },
  { value: "students", label: "All Students", icon: "school" },
  { value: "companies", label: "All Companies", icon: "business" },
  { value: "specific", label: "Specific User", icon: "person" },
];

const SendNotification = ({ navigation, onBack }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("notifications");
  const [targetType, setTargetType] = useState("all");
  const [targetEmail, setTargetEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [users, setUsers] = useState([]);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const response = await getAllUsers();
    if (response.success) {
      // Filter out admin users
      const nonAdminUsers = response.data.filter(user => user.role !== 'admin');
      setUsers(nonAdminUsers);
      setFilteredUsers(nonAdminUsers);
    }
  };

  const filterUsers = useCallback((text) => {
    setSearchQuery(text);
    if (text === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.email.toLowerCase().includes(text.toLowerCase()) ||
          user.name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [users]);

  const handleSendNotification = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a notification title");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Error", "Please enter a notification description");
      return;
    }
    if (targetType === "specific" && !targetEmail.trim()) {
      Alert.alert("Error", "Please select or enter a user email");
      return;
    }

    setLoading(true);

    const notificationData = {
      title: title.trim(),
      description: description.trim(),
      icon: selectedIcon,
      target_type: targetType,
      target_email: targetType === "specific" ? targetEmail.trim() : null,
    };

    const response = await sendNotification(notificationData);

    setLoading(false);

    if (response.success) {
      Alert.alert(
        "Success",
        response.message || "Notification sent successfully",
        [
          {
            text: "OK",
            onPress: () => {
              setTitle("");
              setDescription("");
              setTargetEmail("");
              setSelectedIcon("notifications");
              setTargetType("all");
            },
          },
        ]
      );
    } else {
      Alert.alert("Error", response.message || "Failed to send notification");
    }
  };

  const IconPicker = () => (
    <Modal
      visible={showIconPicker}
      transparent
      animationType="fade"
      onRequestClose={() => setShowIconPicker(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowIconPicker(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Icon</Text>
          <View style={styles.iconGrid}>
            {ICON_OPTIONS.map((icon) => (
              <TouchableOpacity
                key={icon.name}
                style={[
                  styles.iconOption,
                  selectedIcon === icon.name && styles.iconOptionSelected,
                ]}
                onPress={() => {
                  setSelectedIcon(icon.name);
                  setShowIconPicker(false);
                }}
              >
                <Ionicons
                  name={icon.name}
                  size={28}
                  color={selectedIcon === icon.name ? "#6C5CE7" : "#636E72"}
                />
                <Text style={styles.iconLabel}>{icon.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const UserPickerModal = useMemo(() => (
    <Modal
      visible={showUserPicker}
      transparent
      animationType="none"
      onRequestClose={() => {
        setShowUserPicker(false);
        setSearchQuery("");
        setFilteredUsers(users);
      }}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => {
            setShowUserPicker(false);
            setSearchQuery("");
            setFilteredUsers(users);
          }}
        >
          <View 
            style={styles.userPickerContent}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <View style={styles.userPickerHeader}>
              <Text style={styles.modalTitle}>Select User</Text>
              <TouchableOpacity onPress={() => {
                setShowUserPicker(false);
                setSearchQuery("");
                setFilteredUsers(users);
              }}>
                <Ionicons name="close" size={24} color="#2D3436" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or email"
              value={searchQuery}
              onChangeText={filterUsers}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <FlatList
              data={filteredUsers}
              keyExtractor={(item) => item.user_id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.userItem}
                  onPress={() => {
                    setTargetEmail(item.email);
                    setShowUserPicker(false);
                    setSearchQuery("");
                    setFilteredUsers(users);
                  }}
                >
                  <View style={styles.userAvatar}>
                    <Ionicons name="person" size={20} color="#6C5CE7" />
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                    <Text style={styles.userRole}>{item.role}</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No users found</Text>
              }
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  ), [showUserPicker, searchQuery, filteredUsers, filterUsers, users]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack || (() => navigation.goBack())}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#2D3436" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Notification</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Icon Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>Notification Icon</Text>
          <TouchableOpacity
            style={styles.iconSelector}
            onPress={() => setShowIconPicker(true)}
          >
            <View style={styles.selectedIconContainer}>
              <Ionicons name={selectedIcon} size={24} color="#6C5CE7" />
              <Text style={styles.selectedIconText}>
                {ICON_OPTIONS.find((i) => i.name === selectedIcon)?.label}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#636E72" />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter notification title"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <Text style={styles.charCount}>{title.length}/100</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter notification description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={5}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{description.length}/500</Text>
        </View>

        {/* Target Audience */}
        <View style={styles.section}>
          <Text style={styles.label}>Target Audience</Text>
          <View style={styles.targetGrid}>
            {TARGET_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.targetOption,
                  targetType === option.value && styles.targetOptionSelected,
                ]}
                onPress={() => setTargetType(option.value)}
              >
                <Ionicons
                  name={option.icon}
                  size={24}
                  color={targetType === option.value ? "#6C5CE7" : "#636E72"}
                />
                <Text
                  style={[
                    styles.targetLabel,
                    targetType === option.value && styles.targetLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Specific User Email (shown when specific is selected) */}
        {targetType === "specific" && (
          <View style={styles.section}>
            <Text style={styles.label}>User Email</Text>
            <TouchableOpacity
              style={styles.emailSelector}
              onPress={() => setShowUserPicker(true)}
              activeOpacity={0.7}
            >
              <TextInput
                style={styles.emailInput}
                placeholder="Select or enter user email"
                value={targetEmail}
                editable={false}
                pointerEvents="none"
              />
              <Ionicons name="search" size={20} color="#636E72" />
            </TouchableOpacity>
          </View>
        )}

        {/* Preview */}
        <View style={styles.section}>
          <Text style={styles.label}>Preview</Text>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <View style={styles.previewIconContainer}>
                <Ionicons name={selectedIcon} size={20} color="#6C5CE7" />
              </View>
              <View style={styles.previewContent}>
                <Text style={styles.previewTitle}>
                  {title || "Notification Title"}
                </Text>
                <Text style={styles.previewDescription}>
                  {description || "Notification description will appear here"}
                </Text>
                <Text style={styles.previewTime}>Just now</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Send Button */}
        <TouchableOpacity
          style={[styles.sendButton, loading && styles.sendButtonDisabled]}
          onPress={handleSendNotification}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="#FFF" />
              <Text style={styles.sendButtonText}>Send Notification</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>

      <IconPicker />
      {UserPickerModal}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#FFF",
    paddingTop: 30,
    paddingBottom: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
     width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D3436",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 80,
  },
  section: {
    marginTop: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    color: "#2D3436",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  textArea: {
    height: 120,
    paddingTop: 15,
  },
  charCount: {
    fontSize: 12,
    color: "#636E72",
    textAlign: "right",
    marginTop: 5,
  },
  iconSelector: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  selectedIconContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedIconText: {
    fontSize: 15,
    color: "#2D3436",
    marginLeft: 10,
  },
  targetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  targetOption: {
    width: "48%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#E9ECEF",
  },
  targetOptionSelected: {
    borderColor: "#6C5CE7",
    backgroundColor: "#F5F3FF",
  },
  targetLabel: {
    fontSize: 13,
    color: "#636E72",
    marginTop: 8,
    textAlign: "center",
  },
  targetLabelSelected: {
    color: "#6C5CE7",
    fontWeight: "600",
  },
  emailSelector: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  emailInput: {
    flex: 1,
    fontSize: 15,
    color: "#2D3436",
  },
  previewCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "#E9ECEF",
  },
  previewHeader: {
    flexDirection: "row",
  },
  previewIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F3FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  previewContent: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 4,
  },
  previewDescription: {
    fontSize: 14,
    color: "#636E72",
    marginBottom: 8,
  },
  previewTime: {
    fontSize: 12,
    color: "#B2BEC3",
  },
  sendButton: {
    backgroundColor: "#6C5CE7",
    borderRadius: 12,
    padding: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    shadowColor: "#6C5CE7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    width: "85%",
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 20,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  iconOption: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#F8F9FA",
  },
  iconOptionSelected: {
    borderColor: "#6C5CE7",
    backgroundColor: "#F5F3FF",
  },
  iconLabel: {
    fontSize: 11,
    color: "#636E72",
    marginTop: 6,
  },
  userPickerContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    width: "100%",
    height: "80%",
    position: "absolute",
    bottom: 0,
  },
  userPickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    padding: 15,
    fontSize: 15,
    marginBottom: 15,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5F3FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: "#636E72",
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: "#B2BEC3",
    textTransform: "capitalize",
  },
  emptyText: {
    textAlign: "center",
    color: "#636E72",
    marginTop: 20,
  },
});

export default SendNotification;
