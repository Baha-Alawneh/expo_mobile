import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import MainButton from "../components/button";
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
  const [errors, setErrors] = React.useState({});
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/icons/expo-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.form}>
        <View>
          <View style={styles.inputRow}>
            <Ionicons
              name="person-outline"
              size={28}
              color={Colors.WHITE}
              style={{ marginRight: 8 }}
            />
            <TextInput
              placeholder={"Username"}
              placeholderTextColor={Colors.GRAY}
              value={username}
              onChangeText={setUsername}
              style={styles.textInput}
              editable={true}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="default"
            />
          </View>
          {errors.username && (
            <Text style={{ color: "red", marginLeft: 20 }}>
              {errors.username}
            </Text>
          )}
        </View>
        <View>
          <View style={styles.inputRow}>
            <Ionicons
              name="person-outline"
              size={28}
              color={Colors.WHITE}
              style={{ marginRight: 8 }}
            />
            <TextInput
              placeholder={"Email"}
              placeholderTextColor={Colors.GRAY}
              value={email}
              onChangeText={setEmail}
              style={styles.textInput}
              editable={true}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="default"
            />
          </View>
          {errors.email && (
            <Text style={{ color: "red", marginLeft: 20 }}>{errors.email}</Text>
          )}
        </View>
        <View>
          <View style={styles.inputRow}>
            <Ionicons
              name="lock-closed"
              size={28}
              color={Colors.WHITE}
              style={{ marginRight: 8 }}
            />
            <TextInput
              placeholder={"Password"}
              placeholderTextColor={Colors.GRAY}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.textInput}
              editable={true}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="default"
            />
          </View>
          {errors.password && (
            <Text style={{ color: "red", marginLeft: 20 }}>
              {errors.password}
            </Text>
          )}
        </View>
        <View>
          <View style={styles.inputRow}>
            <Ionicons
              name="lock-closed"
              size={28}
              color={Colors.WHITE}
              style={{ marginRight: 8 }}
            />
            <TextInput
              placeholder={"Confirm Password"}
              placeholderTextColor={Colors.GRAY}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.textInput}
              editable={true}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="default"
            />
          </View>
          {errors.confirmPassword && (
            <Text style={{ color: "red", marginLeft: 20 }}>
              {errors.confirmPassword}
            </Text>
          )}
        </View>

        <MainButton
          backgroundColor={Colors.WHITE}
          color={Colors.mainColor}
          width={"90%"}
          text={"SIGN UP"}
          onPress={() => {
            const validationErrors = validateSignUp({
              email,
              password,
              username,
              confirmPassword,
            });
            setErrors(validationErrors);

            if (validationErrors.email || validationErrors.password) {
              return;
            }
            navigation.navigate("Login");
          }}
        />
        <View style={styles.orRow}>
          <View style={styles.line} />
          <Text style={styles.orText}>OR</Text>
          <View style={styles.line} />
        </View>

        <Text style={styles.whiteText}>Sign up with Social Networks</Text>

        <View style={styles.socialRow}>
          <Ionicons name="logo-facebook" size={32} color={Colors.WHITE} />
          <Ionicons name="logo-google" size={32} color={Colors.WHITE} />
          <Ionicons name="logo-apple" size={32} color={Colors.WHITE} />
        </View>
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
    paddingHorizontal: 16,
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
    width: "90%",
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

export default SignUp;
