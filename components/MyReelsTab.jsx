import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/constants";
import * as ImagePicker from "expo-image-picker";
import { uploadReel, deleteReel } from "../apis/reel/Reel";
import UploadReelForm from "./UploadReelForm";
import { Video } from "expo-av";

const MyReelsTab = ({
  userId,
  userData,
  myReels,
  subTab,
  setSubTab,
  onReelUploaded,
  onReelDeleted,
  refreshing,
  onRefresh,
}) => {
  const [uploading, setUploading] = useState(false);
  const [selectedReel, setSelectedReel] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleDeleteReel = (reelId) => {
    Alert.alert(
      "Delete Reel",
      "Are you sure you want to delete this reel?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteReel(reelId);
              Alert.alert("Success", "Reel deleted successfully");
              onReelDeleted();
            } catch (error) {
              console.error("Error deleting reel:", error);
              Alert.alert("Error", "Failed to delete reel. Please try again.");
            }
          },
        },
      ]
    );
  };

  const handleReelPress = (reel) => {
    setSelectedReel(reel);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedReel(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderSubTabs = () => (
    <View style={styles.subTabContainer}>
      <TouchableOpacity
        style={[
          styles.subTab,
          subTab === "my-reels" && styles.activeSubTab,
        ]}
        onPress={() => setSubTab("my-reels")}
      >
        <Ionicons
          name="folder"
          size={20}
          color={subTab === "my-reels" ? Colors.mainColor : "#666"}
        />
        <Text
          style={[
            styles.subTabText,
            subTab === "my-reels" && styles.activeSubTabText,
          ]}
        >
          My Reels ({myReels.length})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.subTab,
          subTab === "add-new" && styles.activeSubTab,
        ]}
        onPress={() => setSubTab("add-new")}
      >
        <Ionicons
          name="add-circle"
          size={20}
          color={subTab === "add-new" ? Colors.mainColor : "#666"}
        />
        <Text
          style={[
            styles.subTabText,
            subTab === "add-new" && styles.activeSubTabText,
          ]}
        >
          Add New Reel
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderMyReels = () => {
    if (myReels.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="videocam-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>No reels yet</Text>
          <Text style={styles.emptySubText}>
            Upload your first reel to get started!
          </Text>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => setSubTab("add-new")}
          >
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.uploadButtonText}>Upload Reel</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.reelsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.mainColor]}
          />
        }
      >
        <View style={styles.reelsGrid}>
          {myReels.map((reel) => (
            <TouchableOpacity 
              key={reel.reel_id} 
              style={styles.reelCard}
              onPress={() => handleReelPress(reel)}
            >
              <View style={styles.reelThumbnail}>
                <Video
                  source={{ uri: reel.video_url }}
                  style={styles.thumbnailVideo}
                  resizeMode="cover"
                  shouldPlay={false}
                  isMuted={true}
                />
                <View style={styles.playOverlay}>
                  <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.9)" />
                </View>
              </View>

              <View style={styles.reelInfo}>
                <Text style={styles.reelDate}>
                  {formatDate(reel.created_at)}
                </Text>
                {reel.description ? (
                  <Text style={styles.reelDescription} numberOfLines={2}>
                    {reel.description}
                  </Text>
                ) : (
                  <Text style={styles.reelNoDescription}>No description</Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleDeleteReel(reel.reel_id);
                }}
              >
                <Ionicons name="trash" size={20} color="#FF5252" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderAddNewReel = () => {
    return (
      <ScrollView
        style={styles.uploadContainer}
        showsVerticalScrollIndicator={false}
      >
        <UploadReelForm
          userId={userId}
          onUploadSuccess={onReelUploaded}
        />
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileAvatar}>
          {userData?.profileImage ? (
            <Image
              source={{ uri: userData.profileImage }}
              style={styles.profileAvatarImage}
              onError={(e) => {
                console.log('Profile image load error:', e.nativeEvent.error);
                console.log('Attempted to load:', userData.profileImage);
              }}
              onLoad={() => {
                console.log('Profile image loaded successfully');
              }}
            />
          ) : (
            <Ionicons name="person" size={40} color={Colors.mainColor} />
          )}
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{userData?.name || "User"}</Text>
          <Text style={styles.profileEmail}>{userData?.email || ""}</Text>
        </View>
      </View>

      {/* Sub Tabs */}
      {renderSubTabs()}

      {/* Content */}
      <View style={styles.content}>
        {subTab === "my-reels" && renderMyReels()}
        {subTab === "add-new" && renderAddNewReel()}
      </View>

      {/* Video Player Modal */}
      <Modal
        visible={modalVisible}
        transparent={false}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
          
          {selectedReel && (
            <Video
              source={{ uri: selectedReel.video_url }}
              style={styles.fullscreenVideo}
              resizeMode="contain"
              shouldPlay={true}
              isLooping={true}
              useNativeControls={true}
            />
          )}

          {selectedReel?.description && (
            <View style={styles.modalDescription}>
              <Text style={styles.modalDescriptionText}>
                {selectedReel.description}
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  profileAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.mainColor,
    overflow: "hidden",
  },
  profileAvatarImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: "#666",
  },
  subTabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  subTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeSubTab: {
    borderBottomColor: Colors.mainColor,
  },
  subTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginLeft: 6,
  },
  activeSubTabText: {
    color: Colors.mainColor,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.mainColor,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 20,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 8,
  },
  reelsList: {
    flex: 1,
  },
  reelsGrid: {
    padding: 12,
  },
  reelCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reelThumbnail: {
    height: 200,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  thumbnailVideo: {
    width: "100%",
    height: "100%",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  reelInfo: {
    padding: 12,
  },
  reelDate: {
    fontSize: 12,
    color: "#999",
    marginBottom: 6,
  },
  reelDescription: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  reelNoDescription: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  deleteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  uploadContainer: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  fullscreenVideo: {
    width: "100%",
    height: "100%",
  },
  modalDescription: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 16,
    borderRadius: 12,
  },
  modalDescriptionText: {
    fontSize: 14,
    color: "#fff",
    lineHeight: 20,
  },
});

export default MyReelsTab;
