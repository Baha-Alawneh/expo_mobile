import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MainButton from "../components/button";
import { Colors } from "../constants/constants";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { validateLogin } from "../validation/validationLogin";
import { loginUser } from "../apis/user/SignUp";

const Login = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const handleLogin = async () => {
    const result = await loginUser({ email, password }, navigation);

    if (!result.success) {
      const errorReason =
        result.data?.message ||
        result.message ||
        `Error code: ${result.status}`;
      Alert.alert("Login Failed", errorReason);
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
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <Image
                source={require("../assets/icons/expo-logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subtitleText}>Sign in to continue</Text>
          </View>
          {/* Form Section */}
          <View style={styles.formContainer}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, email && styles.labelFocused]}>
                Email or Username
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
            {/* Forgot Password */}
            <TouchableOpacity
              onPress={() => Alert.alert("Forgot password")}
              style={styles.forgotContainer}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => {
                const validationErrors = validateLogin({ email, password });
                setErrors(validationErrors);

                if (validationErrors.email || validationErrors.password) {
                  return;
                }
                handleLogin();
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#ffffff", "#f0f0f0"]}
                style={styles.loginButtonGradient}
              >
                <Text style={styles.loginButtonText}>LOGIN</Text>
              </LinearGradient>
            </TouchableOpacity>
            {/* Sign Up Section */}
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpPrompt}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>
            {/* Social Login */}
            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                <Ionicons name="logo-google" size={24} color={Colors.WHITE} />
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

  // Logo Section
  logoContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  logo: {
    width: 70,
    height: 70,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.WHITE,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitleText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "400",
  },

  // Form Section
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
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
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  inputWrapperFocused: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    fontSize: 16,
    fontWeight: "400",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },

  // Forgot Password
  forgotContainer: {
    alignSelf: "flex-end",
    marginBottom: 32,
    marginTop: -8,
  },
  forgotText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontWeight: "500",
  },

  // Login Button
  loginButton: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 24,
  },
  loginButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loginButtonText: {
    color: Colors.mainColor,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1.2,
  },

  // Sign Up Section
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  signUpPrompt: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  signUpLink: {
    color: Colors.WHITE,
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 6,
  },

  // Divider
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
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
    width: "70%",
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
});

export default Login;
