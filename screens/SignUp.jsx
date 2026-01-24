import React, { useState } from "react";
import Toast from "react-native-toast-message";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "../constants/constants";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { validateSignUp } from "../validation/validationSignUp";

const SignUp = () => {
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedUserType, setSelectedUserType] = useState("");
  const [errors, setErrors] = useState({});

  const userTypes = [
    { value: "student", label: "Student", icon: "school" },
    { value: "company", label: "Company", icon: "briefcase" },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={[
          Colors.mainColor,
          "#2d4d85",
          "#26447a",
          "#1f3b6f",
          "#193364",
          "#152b59",
          "#11234e",
          "#0d1a3d",
        ]}
        locations={[0, 0.12, 0.25, 0.38, 0.52, 0.66, 0.82, 1]}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <Image
                source={require("../assets/icons/expo-logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.welcomeText}>Create Account</Text>
            <Text style={styles.subtitleText}>Sign up to get started</Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* Username Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, username && styles.labelFocused]}>
                Username
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.username && styles.inputWrapperError,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={22}
                  color={Colors.GRAY}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Enter your username"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={username}
                  onChangeText={setUsername}
                  // Removed focus handlers
                  style={styles.textInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.username && (
                <Text style={styles.errorText}>{errors.username}</Text>
              )}
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, email && styles.labelFocused]}>
                Email
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.email && styles.inputWrapperError,
                ]}
              >
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
                  // Removed focus handlers
                  style={styles.textInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                />
              </View>
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, password && styles.labelFocused]}>
                Password
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.password && styles.inputWrapperError,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color={Colors.GRAY}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Enter your password"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  // Removed focus handlers
                  style={styles.textInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text
                style={[styles.label, confirmPassword && styles.labelFocused]}
              >
                Confirm Password
              </Text>
              <View
                style={[
                  styles.inputWrapper,
                  errors.confirmPassword && styles.inputWrapperError,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color={Colors.GRAY}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Confirm your password"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  // Removed focus handlers
                  style={styles.textInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* User Type Selection */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Select User Type</Text>
              <View style={styles.userTypeContainer}>
                {userTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.userTypeButton,
                      selectedUserType === type.value &&
                        styles.userTypeButtonSelected,
                      errors.userType && styles.userTypeButtonError,
                    ]}
                    onPress={() => setSelectedUserType(type.value)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={type.icon}
                      size={28}
                      color={
                        selectedUserType === type.value
                          ? Colors.WHITE
                          : Colors.GRAY
                      }
                    />
                    <Text
                      style={[
                        styles.userTypeText,
                        selectedUserType === type.value &&
                          styles.userTypeTextSelected,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.userType && (
                <Text style={styles.errorText}>{errors.userType}</Text>
              )}
            </View>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={styles.signUpButton}
              onPress={() => {
                const validationErrors = validateSignUp({
                  email,
                  password,
                  username,
                  confirmPassword,
                  userType: selectedUserType,
                });
                setErrors(validationErrors);

                if (
                  validationErrors.email ||
                  validationErrors.password ||
                  validationErrors.username ||
                  validationErrors.confirmPassword ||
                  validationErrors.userType
                ) {
                  return;
                }
                navigation.navigate("Verify", {
                  name: username,
                  email,
                  password,
                  role: selectedUserType,
                });
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#ffffff", "#f0f0f0"]}
                style={styles.signUpButtonGradient}
              >
                <Text style={styles.signUpButtonText}>SIGN UP</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginPrompt}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Login</Text>
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
    paddingTop: 50,
    paddingBottom: 40,
  },

  // Logo Section
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoWrapper: {
    width: 90,
    height: 90,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  logo: {
    width: 60,
    height: 60,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.WHITE,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  subtitleText: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "400",
  },

  // Form Section
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 8,
    marginLeft: 4,
    fontWeight: "500",
  },
  labelFocused: {
    color: Colors.WHITE,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  inputWrapperFocused: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  inputWrapperError: {
    borderColor: "#ff6b6b",
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    color: Colors.WHITE,
    fontSize: 15,
    fontWeight: "400",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },

  // User Type Selection
  userTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  userTypeButton: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    marginRight: 10,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  userTypeButtonSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderColor: "rgba(255, 255, 255, 0.4)",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  userTypeButtonError: {
    borderColor: "#ff6b6b",
  },
  userTypeText: {
    color: Colors.GRAY,
    fontSize: 13,
    fontWeight: "500",
    marginTop: 8,
  },
  userTypeTextSelected: {
    color: Colors.WHITE,
    fontWeight: "600",
  },

  // Sign Up Button
  signUpButton: {
    width: "100%",
    height: 54,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    marginTop: 8,
    marginBottom: 20,
  },
  signUpButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  signUpButtonText: {
    color: Colors.mainColor,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1.2,
  },

  // Login Link
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
  },
  loginPrompt: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  loginLink: {
    color: Colors.WHITE,
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 6,
  },

  // Divider
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  dividerText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 13,
    marginHorizontal: 16,
    fontWeight: "400",
  },

  // Social Login
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  socialButton: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
});

export default SignUp;
