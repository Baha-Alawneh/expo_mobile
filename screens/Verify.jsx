import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { BASE_URL } from "../constants/config";
import Toast from "react-native-toast-message";
import MainButton from "../components/button";
import { Colors } from "../constants/constants";
import { registerUser } from "../apis/user/SignUp";

const Verify = ({ route, navigation }) => {
  const { name, email, password, role } = route.params;
  const [code, setCode] = useState("");
  useEffect(() => {
    fetch(`${BASE_URL}/users/send-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
      .then(() => {
        Toast.show({
          type: "info",
          text1: "Verification Code Sent",
          text2: "Check your email for the code.",
          position: "top",
        });
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

  const handleVerify = async () => {
    try {
      const response = await fetch(`${BASE_URL}/users/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const verifyResult = await response.json();

      if (!verifyResult.success) {
        Toast.show({
          type: "error",
          text1: "Invalid Code",
          text2: "The verification code is incorrect or expired.",
          position: "top",
        });
        return;
      }

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
        navigation.navigate("Login");
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
        position: "top",
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/icons/expo-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={[styles.form]}>
        <View>
          <Text
            style={[
              styles.whiteText,
              { fontSize: 24, marginBottom: 30, fontWeight: "bold" },
            ]}
          >
            Enter the verification code sent to email.
          </Text>
          <Text style={styles.whiteText}>
            Please enter the 6-digit code sent to
            <Text style={{ fontWeight: "bold" }}> {email} </Text>
            Check your spam folder if you don't see the email.
          </Text>
        </View>

        <View style={[styles.inputRow, { marginTop: 15, marginBottom: 20 }]}>
          <TextInput
            placeholder="Enter code"
            placeholderTextColor={Colors.GRAY}
            value={code}
            onChangeText={setCode}
            style={styles.textInput}
            editable={true}
            keyboardType="numeric"
          />
        </View>

        <MainButton
          backgroundColor={Colors.WHITE}
          color={Colors.mainColor}
          width={"90%"}
          text={"Verify"}
          onPress={handleVerify}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.mainColor,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: Colors.mainColor,
  },
  backPlaceholder: {
    position: "absolute",
    top: 36,
    left: 12,
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  backText: {
    color: Colors.WHITE,
    fontSize: 18,
  },
  form: {
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.WHITE,
    borderRadius: 15,
    paddingVertical: 30,
    paddingLeft: 20,
    paddingRight: 15,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 20,
    padding: 15,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.WHITE,
    borderRadius: 25,
    paddingHorizontal: 12,
    height: 50,
    marginVertical: 8,
    backgroundColor: "transparent",
  },
  iconPlaceholder: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    height: "100%",
    color: Colors.WHITE,
    paddingLeft: 10,
  },
  forgot: {
    color: Colors.WHITE,
    marginTop: 12,
  },
  signUpRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  whiteText: {
    color: Colors.WHITE,
  },
  signUpText: {
    fontWeight: "bold",
    marginLeft: 6,
  },
  orRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    marginVertical: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.WHITE,
    opacity: 0.5,
  },
  orText: {
    color: Colors.WHITE,
    marginHorizontal: 8,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "60%",
    marginTop: 6,
  },
  socialPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  /* legacy input style (unused by new layout but kept in case) */
});

export default Verify;
