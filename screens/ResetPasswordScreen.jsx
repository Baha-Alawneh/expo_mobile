import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../constants/constants";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { resetPassword } from "../apis/user/SignUp";

const ResetPasswordScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params || {};

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return false;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return false;
    }

    return true;
  };

  const handleResetPassword = async () => {
    if (!validatePassword()) {
      return;
    }

    if (!email) {
      Alert.alert("Error", "Email not found. Please try again.");
      return;
    }

    setLoading(true);
    const result = await resetPassword(email, newPassword);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        "Success",
        "Your password has been reset successfully",
        [
          {
            text: "OK",
            onPress: () => {
              navigation.navigate("Login");
            },
          },
        ]
      );
    } else {
      Alert.alert("Error", result.message || "Failed to reset password");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={[Colors.mainColor, "#1e3a5f", "#0f1c2e"]}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed-outline" size={60} color="#fff" />
            </View>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your new password below
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* New Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color={Colors.GRAY}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Enter new password"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  style={styles.textInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showNewPassword ? "eye-outline" : "eye-off-outline"}
                    size={22}
                    color={Colors.GRAY}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color={Colors.GRAY}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Confirm new password"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={styles.textInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                    size={22}
                    color={Colors.GRAY}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Requirements */}
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>Password requirements:</Text>
              <Text style={styles.requirementText}>• At least 6 characters</Text>
              <Text style={styles.requirementText}>• Passwords must match</Text>
            </View>

            {/* Reset Button */}
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleResetPassword}
              activeOpacity={0.8}
              disabled={loading}
            >
              <LinearGradient
                colors={["#ffffff", "#f0f0f0"]}
                style={styles.resetButtonGradient}
              >
                <Text style={styles.resetButtonText}>
                  {loading ? "RESETTING..." : "RESET PASSWORD"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  requirementsContainer: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  requirementsTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  requirementText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginBottom: 4,
  },
  resetButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  resetButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  resetButtonText: {
    color: Colors.mainColor,
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});

export default ResetPasswordScreen;
