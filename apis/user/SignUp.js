import axios from "axios";
import { BASE_URL } from "../../constants/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

export const registerUser = async (body) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/users/register`,
      {
        name: body.name,
        email: body.email,
        password: body.password,
        role: body.role,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return { success: true, message: `${body.name} registered successfully` };
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return {
        success: false,
        message: error.response.data.message || error.response.data,
      };
    } else if (error.request) {
      // The request was made but no response was received
      return { success: false, message: "No response from server" };
    } else {
      // Something happened in setting up the request that triggered an Error
      return { success: false, message: error.message };
    }
  }
};
export const loginUser = async (body, navigation) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/users/login`,
      {
        email: body.email,
        password: body.password,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const token = response.data.token;
    const decoded = jwtDecode(token);
    const role = decoded.role;
    const userId = decoded.userId;

    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("role", role);
    await AsyncStorage.setItem("userId", userId);

    if (role === "visitor") {
      navigation.navigate("VisitorScreen");
    } else if (role === "student") {
      navigation.navigate("Student");
    } else if (role === "company") {
      navigation.navigate("CompanyScreen");
    }

    return { success: true, message: "Login successful", token };
  } catch (error) {
    if (error.response) {
      return {
        success: false,
        message: error.response.data.message || error.response.data,
        status: error.response.status,
        data: error.response.data,
      };
    } else if (error.request) {
      return {
        success: false,
        message: "No response from server",
        error: error.request,
      };
    } else {
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }
};
