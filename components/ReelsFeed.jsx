import React, { useState, useRef, useCallback, useEffect, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Image,
} from "react-native";
import { Video } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/constants";
import Slider from "@react-native-community/slider";

const { height, width } = Dimensions.get("window");
const REEL_HEIGHT = height - 100;

const ReelsFeed = ({ reels, refreshing, onRefresh, navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState({});
  const [playbackStatus, setPlaybackStatus] = useState({});
  const videoRefs = useRef({});
  const flatListRef = useRef(null);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const visibleIndex = viewableItems[0].index;
      
      // Always pause all videos first
      Object.keys(videoRefs.current).forEach((key) => {
        const index = parseInt(key);
        if (index !== visibleIndex && videoRefs.current[key]) {
          videoRefs.current[key].pauseAsync().catch(() => {});
        }
      });
      
      // Always update current index and unpause the visible video
      setCurrentIndex(visibleIndex);
      setIsPaused(prev => ({ ...prev, [visibleIndex]: false }));
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  const handleVideoRef = useCallback((ref, index) => {
    if (ref) {
      videoRefs.current[index] = ref;
    }
  }, []);

  const handlePlaybackStatusUpdate = useCallback((index, status) => {
    if (status.isLoaded) {
      setPlaybackStatus(prev => ({
        ...prev,
        [index]: {
          positionMillis: status.positionMillis || 0,
          durationMillis: status.durationMillis || 1,
        }
      }));
    }
  }, []);

  const togglePlayPause = useCallback((index) => {
    if (index === currentIndex) {
      setIsPaused(prev => ({ ...prev, [index]: !prev[index] }));
    }
  }, [currentIndex]);

  const handleSeek = useCallback((index, value) => {
    const video = videoRefs.current[index];
    if (video) {
      video.setPositionAsync(value);
    }
  }, []);

  const formatTime = (millis) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const renderReelItem = useCallback(({ item, index }) => {
    const isCurrentVideo = index === currentIndex;
    const isPausedByUser = isPaused[index] || false;
    const status = playbackStatus[index] || {};
    const position = status.positionMillis || 0;
    const duration = status.durationMillis || 1;
    
    // Debug logging for profile photos
    if (index === 0) {
      console.log('First reel photo data:', {
        user_photo: item.user_photo ? item.user_photo.substring(0, 100) + '...' : null,
        student_photo: item.student_photo ? item.student_photo.substring(0, 100) + '...' : null,
        company_photo: item.company_photo ? item.company_photo.substring(0, 100) + '...' : null,
        user_role: item.user_role
      });
    }

    return (
      <View style={styles.reelContainer}>
        <TouchableWithoutFeedback onPress={() => togglePlayPause(index)}>
          <View style={styles.videoWrapper}>
            <Video
              ref={(ref) => handleVideoRef(ref, index)}
              source={{ uri: item.video_url }}
              style={styles.video}
              resizeMode="contain"
              shouldPlay={isCurrentVideo && !isPausedByUser}
              isLooping={true}
              isMuted={false}
              useNativeControls={false}
              onPlaybackStatusUpdate={(status) => handlePlaybackStatusUpdate(index, status)}
              progressUpdateIntervalMillis={1000}
            />

            {isCurrentVideo && isPausedByUser && (
              <View style={styles.pauseIndicator}>
                <Ionicons name="play" size={80} color="rgba(255,255,255,0.8)" />
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>

        {isCurrentVideo && duration > 1 && (
          <View style={styles.progressContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration}
              value={position}
              onSlidingComplete={(value) => handleSeek(index, value)}
              minimumTrackTintColor={Colors.mainColor}
              maximumTrackTintColor="rgba(255,255,255,0.3)"
              thumbTintColor={Colors.mainColor}
            />
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </View>
        )}

        <View style={styles.overlay}>
          <View style={styles.bottomInfo}>
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                {(item.user_photo || item.student_photo || item.company_photo) ? (
                  <Image
                    source={{ uri: item.user_photo || item.student_photo || item.company_photo }}
                    style={styles.avatarImage}
                    onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                  />
                ) : (
                  <Ionicons
                    name={
                      item.user_role === "student"
                        ? "person"
                        : item.user_role === "company"
                        ? "business"
                        : "person-outline"
                    }
                    size={24}
                    color="#fff"
                  />
                )}
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>{item.user_name}</Text>
                <Text style={styles.userRole}>
                  {item.user_role === "student"
                    ? "Student"
                    : item.user_role === "company"
                    ? "Company"
                    : "User"}
                </Text>
              </View>
            </View>

            {item.description ? (
              <View style={styles.descriptionContainer}>
                <Text style={styles.description} numberOfLines={3}>
                  {item.description}
                </Text>
              </View>
            ) : null}

            <Text style={styles.timestamp}>{formatDate(item.created_at)}</Text>
          </View>
        </View>
      </View>
    );
  }, [currentIndex, isPaused, playbackStatus, togglePlayPause, handleSeek, handlePlaybackStatusUpdate, handleVideoRef]);

  const keyExtractor = useCallback((item) => item.reel_id, []);

  if (reels.length === 0 && !refreshing) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="play-circle-outline" size={80} color="#ccc" />
        <Text style={styles.emptyText}>No reels available yet</Text>
        <Text style={styles.emptySubText}>
          Be the first to share a reel!
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      ref={flatListRef}
      data={reels}
      renderItem={renderReelItem}
      keyExtractor={keyExtractor}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      snapToInterval={REEL_HEIGHT}
      snapToAlignment="start"
      decelerationRate="fast"
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      refreshing={refreshing}
      onRefresh={onRefresh}
      getItemLayout={(data, index) => ({
        length: REEL_HEIGHT,
        offset: REEL_HEIGHT * index,
        index,
      })}
      windowSize={5}
      maxToRenderPerBatch={2}
      initialNumToRender={1}
      removeClippedSubviews={false}
    />
  );
};

const styles = StyleSheet.create({
  reelContainer: {
    height: REEL_HEIGHT,
    width: width,
    backgroundColor: "#000",
  },
  videoWrapper: {
    width: "100%",
    height: "100%",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  pauseIndicator: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  progressContainer: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginTop: -10,
  },
  timeText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    pointerEvents: "box-none",
  },
  bottomInfo: {
    padding: 20,
    paddingBottom: 40,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.mainColor,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
    overflow: "hidden",
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  userRole: {
    fontSize: 13,
    color: "#fff",
    opacity: 0.9,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  descriptionContainer: {
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#fff",
    lineHeight: 20,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  timestamp: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.8,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
  },
});

export default ReelsFeed;
