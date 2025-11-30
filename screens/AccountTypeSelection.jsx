import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/constants";
import { completeGoogleSignUp } from "../utils/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AccountTypeSelection = ({ route, navigation }) => {
  const { user } = route.params;
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(false);

  const accountTypes = [
    {
      type: "student",
      title: "Student",
      icon: "school-outline",
      description: "Showcase your projects and connect with companies",
      gradient: ["#667eea", "#764ba2"],
    },
    {
      type: "company",
      title: "Company",
      icon: "business-outline",
      description: "Discover talented students and innovative projects",
      gradient: ["#f093fb", "#f5576c"],
    },
    {
      type: "visitor",
      title: "Visitor",
      icon: "eye-outline",
      description: "Explore the expo and browse projects",
      gradient: ["#4facfe", "#00f2fe"],
    },
  ];

  const handleContinue = async () => {
    if (!selectedType) {
      Alert.alert("Selection Required", "Please select an account type");
      return;
    }

    setLoading(true);

    try {
      const result = await completeGoogleSignUp(
        user.uid,
        selectedType,
        user.displayName,
        user.photoURL,
        user.email
      );

      if (result.success) {
        // Store user info in AsyncStorage
        await AsyncStorage.setItem("userId", user.uid);
        await AsyncStorage.setItem("userType", selectedType);

        // Navigate to appropriate screen
        navigation.reset({
          index: 0,
          routes: [
            {
              name:
                selectedType === "student"
                  ? "Student"
                  : selectedType === "company"
                  ? "Company"
                  : "Visitor",
            },
          ],
        });
      } else {
        Alert.alert("Error", result.error || "Failed to complete sign-up");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.mainColor} />
      <LinearGradient
        colors={[Colors.mainColor, "#1e3a5f", "#0f1c2e"]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="people-circle" size={80} color="#fff" />
            </View>
            <Text style={styles.title}>Select Account Type</Text>
            <Text style={styles.subtitle}>
              Choose how you want to use the platform
            </Text>
          </View>

          {/* Account Type Cards */}
          <View style={styles.cardsContainer}>
            {accountTypes.map((item) => (
              <TouchableOpacity
                key={item.type}
                style={[
                  styles.card,
                  selectedType === item.type && styles.cardSelected,
                ]}
                onPress={() => setSelectedType(item.type)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={
                    selectedType === item.type
                      ? item.gradient
                      : ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]
                  }
                  style={styles.cardGradient}
                >
                  <View style={styles.cardContent}>
                    <View
                      style={[
                        styles.cardIconContainer,
                        selectedType === item.type &&
                          styles.cardIconContainerSelected,
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={40}
                        color={
                          selectedType === item.type ? "#fff" : Colors.mainColor
                        }
                      />
                    </View>
                    <View style={styles.cardTextContainer}>
                      <Text
                        style={[
                          styles.cardTitle,
                          selectedType === item.type &&
                            styles.cardTitleSelected,
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={[
                          styles.cardDescription,
                          selectedType === item.type &&
                            styles.cardDescriptionSelected,
                        ]}
                      >
                        {item.description}
                      </Text>
                    </View>
                    {selectedType === item.type && (
                      <Ionicons
                        name="checkmark-circle"
                        size={28}
                        color="#fff"
                        style={styles.checkIcon}
                      />
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedType && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!selectedType || loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                selectedType
                  ? ["#ffffff", "#f0f0f0"]
                  : ["rgba(255,255,255,0.3)", "rgba(255,255,255,0.2)"]
              }
              style={styles.continueButtonGradient}
            >
              <Text
                style={[
                  styles.continueButtonText,
                  !selectedType && styles.continueButtonTextDisabled,
                ]}
              >
                {loading ? "Please wait..." : "Continue"}
              </Text>
              {!loading && (
                <Ionicons
                  name="arrow-forward"
                  size={24}
                  color={selectedType ? Colors.mainColor : "rgba(27,46,79,0.3)"}
                />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: "center",
  },
  card: {
    borderRadius: 20,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  cardSelected: {
    elevation: 8,
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  cardGradient: {
    padding: 20,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardIconContainerSelected: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "rgba(255,255,255,0.9)",
    marginBottom: 6,
  },
  cardTitleSelected: {
    color: "#fff",
  },
  cardDescription: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    lineHeight: 20,
  },
  cardDescriptionSelected: {
    color: "rgba(255,255,255,0.9)",
  },
  checkIcon: {
    marginLeft: 12,
  },
  continueButton: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginTop: 20,
  },
  continueButtonDisabled: {
    elevation: 2,
    shadowOpacity: 0.1,
  },
  continueButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.mainColor,
    letterSpacing: 0.5,
  },
  continueButtonTextDisabled: {
    color: "rgba(27,46,79,0.3)",
  },
});

export default AccountTypeSelection;
