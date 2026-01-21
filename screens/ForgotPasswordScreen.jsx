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
import { useNavigation } from "@react-navigation/native";
import { sendPasswordResetCode } from "../apis/user/SignUp";

const ForgotPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    const result = await sendPasswordResetCode(email);
    setLoading(false);

    if (result.success) {
      Alert.alert(
        "Code Sent",
        "A verification code has been sent to your email",
        [
          {
            text: "OK",
            onPress: () => {
              navigation.navigate("Verify", {
                email: email,
                isPasswordReset: true,
              });
            },
          },
        ]
      );
    } else {
      Alert.alert("Error", result.message || "Failed to send verification code");
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
            {/* <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity> */}
            <View style={styles.iconContainer}>
              <Ionicons name="key-outline" size={60} color="#fff" />
            </View>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a verification code to reset your password
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={22}
                  color={Colors.GRAY}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.textInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Send Code Button */}
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendCode}
              activeOpacity={0.8}
              disabled={loading}
            >
              <LinearGradient
                colors={["#ffffff", "#f0f0f0"]}
                style={styles.sendButtonGradient}
              >
                <Text style={styles.sendButtonText}>
                  {loading ? "SENDING..." : "SEND CODE"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Back to Login */}
            <View style={styles.backToLoginContainer}>
              <Text style={styles.backToLoginPrompt}>Remember your password?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.backToLoginLink}>Back to Login</Text>
              </TouchableOpacity>
            </View>
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
  backButton: {
    position: "absolute",
    left: 0,
    top: 0,
    padding: 8,
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
    lineHeight: 22,
    paddingHorizontal: 20,
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
  sendButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 12,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  sendButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonText: {
    color: Colors.mainColor,
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  backToLoginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  backToLoginPrompt: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
  },
  backToLoginLink: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 6,
  },
});

export default ForgotPasswordScreen;
