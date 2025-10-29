import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BASE_URL } from "../constants/config";
import Toast from "react-native-toast-message";
import { Colors } from "../constants/constants";
import { registerUser } from "../apis/user/SignUp";

const Verify = ({ route, navigation }) => {
  const params = route?.params || {};
  const { name = "", email = "", password = "", role = "" } = params;
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [validationStatus, setValidationStatus] = useState(null); // null, 'success', 'error'
  const inputRefs = useRef([]);

  useEffect(() => {
    fetch(`${BASE_URL}/users/send-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          Toast.show({
            type: "info",
            text1: "Verification Code Sent",
            text2: data.message || "Check your email for the code.",
            position: "top",
          });
        } else {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: data.message || "Failed to send verification code",
            position: "top",
          });
        }
      })
      .catch((error) => {
        Toast.show({
          type: "error",
          text1: "Network Error",
          text2: error.message,
          position: "top",
        });
      });
  }, []);

  const handleCodeChange = (value, index) => {
    if (validationStatus) {
      setValidationStatus(null);
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join("");

    if (fullCode.length !== 6) {
      Toast.show({
        type: "error",
        text1: "Incomplete Code",
        text2: "Please enter all 6 digits.",
        position: "top",
      });
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/users/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: fullCode }),
      });

      const verifyResult = await response.json();

      if (!verifyResult.success) {
        setValidationStatus("error");
        Toast.show({
          type: "error",
          text1: "Invalid Code",
          text2: "The verification code is incorrect or expired.",
          position: "top",
        });
        return;
      }

      setValidationStatus("success");

      const regResult = await registerUser({
        name,
        email,
        password,
        role,
      });

      Toast.show({
        type: regResult.success ? "success" : "error",
        text1: regResult.success ? "Success" : "Error",
        text2: regResult.message,
        visibilityTime: 3000,
        position: "top",
      });

      if (regResult.success) {
        setTimeout(() => {
          navigation.navigate("Login");
        }, 1500);
      }
    } catch (error) {
      setValidationStatus("error");
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
        position: "top",
      });
    }
  };

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
            <Text style={styles.welcomeText}>Verify Your Email</Text>
            <Text style={styles.subtitleText}>Enter the 6-digit code</Text>
          </View>

          {/* Verification Content */}
          <View style={styles.verifyContainer}>
            <View style={styles.instructionContainer}>
              <Text style={styles.instructionText}>
                We've sent a verification code to
              </Text>
              <Text style={styles.emailText}>{email}</Text>
              <Text style={styles.instructionSubText}>
                Check your spam folder if you don't see it
              </Text>
            </View>

            {/* Code Input Boxes */}
            <View style={styles.codeContainer}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[
                    styles.codeInput,
                    validationStatus === "success" && styles.codeInputSuccess,
                    validationStatus === "error" && styles.codeInputError,
                  ]}
                  value={digit}
                  onChangeText={(value) => handleCodeChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={handleVerify}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#ffffff", "#f0f0f0"]}
                style={styles.verifyButtonGradient}
              >
                <Text style={styles.verifyButtonText}>VERIFY</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Resend Code */}
            <TouchableOpacity
              style={styles.resendContainer}
              onPress={() => {
                fetch(`${BASE_URL}/users/send-code`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email }),
                })
                  .then((res) => res.json())
                  .then((data) => {
                    if (data.success) {
                      Toast.show({
                        type: "success",
                        text1: "Code Resent",
                        text2:
                          data.message ||
                          "A new verification code has been sent.",
                        position: "top",
                      });
                    } else {
                      Toast.show({
                        type: "error",
                        text1: "Error",
                        text2: data.message || "Failed to resend code",
                        position: "top",
                      });
                    }
                  })
                  .catch((error) => {
                    Toast.show({
                      type: "error",
                      text1: "Error",
                      text2: error.message,
                      position: "top",
                    });
                  });
              }}
            >
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              <Text style={styles.resendLink}>Resend</Text>
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
    justifyContent: "center",
  },

  // Logo Section
  logoContainer: {
    alignItems: "center",
    marginBottom: 50,
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
    fontSize: 28,
    fontWeight: "700",
    color: Colors.WHITE,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitleText: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "400",
  },

  // Verification Content
  verifyContainer: {
    width: "100%",
    alignItems: "center",
  },
  instructionContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  instructionText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 8,
  },
  emailText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  instructionSubText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 13,
    textAlign: "center",
  },

  // Code Input
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 40,
    gap: 8,
  },
  codeInput: {
    flex: 1,
    height: 60,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.15)",
    color: Colors.WHITE,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  codeInputSuccess: {
    borderColor: "#4caf50",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    shadowColor: "#4caf50",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  codeInputError: {
    borderColor: "#ff6b6b",
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    shadowColor: "#ff6b6b",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  // Verify Button
  verifyButton: {
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
  verifyButtonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  verifyButtonText: {
    color: Colors.mainColor,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1.2,
  },

  // Resend Code
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  resendText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  resendLink: {
    color: Colors.WHITE,
    fontSize: 14,
    fontWeight: "700",
  },
});

export default Verify;
