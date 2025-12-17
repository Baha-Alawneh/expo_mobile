import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

/**
 * StarRating Component
 *
 * @param {number} rating - Current rating value (0-5)
 * @param {number} maxRating - Maximum rating value (default: 5)
 * @param {boolean} editable - Whether the rating can be changed by tapping
 * @param {function} onRatingChange - Callback function when rating changes
 * @param {number} size - Size of the stars (default: 24)
 * @param {string} color - Color of filled stars (default: '#FFD700' - gold)
 * @param {string} emptyColor - Color of empty stars (default: '#D3D3D3' - light gray)
 * @param {boolean} showRatingText - Show rating text next to stars
 */
const StarRating = ({
  rating = 0,
  maxRating = 5,
  editable = false,
  onRatingChange = () => {},
  size = 24,
  color = "#FFD700",
  emptyColor = "#D3D3D3",
  showRatingText = false,
}) => {
  const handleStarPress = (selectedRating) => {
    if (editable) {
      onRatingChange(selectedRating);
    }
  };

  const renderStar = (position) => {
    const filled = position <= rating;
    const starName = filled ? "star" : "star-outline";

    return (
      <TouchableOpacity
        key={position}
        onPress={() => handleStarPress(position)}
        disabled={!editable}
        activeOpacity={editable ? 0.7 : 1}
        style={styles.starButton}
      >
        <Ionicons
          name={starName}
          size={size}
          color={filled ? color : emptyColor}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {[...Array(maxRating)].map((_, index) => renderStar(index + 1))}
      </View>
      {showRatingText && (
        <Text style={styles.ratingText}>
          {rating.toFixed(1)} / {maxRating}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  starButton: {
    marginHorizontal: 2,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
  },
});

export default StarRating;
