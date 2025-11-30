import axios from "axios";
import { BASE_URL } from "../../constants/config";
import { storeAuthData } from "../../utils/auth";

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

    // Handle new response format
    if (response.data.success) {
      return {
        success: true,
        message:
          response.data.message || `${body.name} registered successfully`,
        data: response.data.data,
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Registration failed",
      };
    }
  } catch (error) {
    if (error.response) {
      // Server responded with error
      return {
        success: false,
        message: error.response.data.message || error.response.data,
      };
    } else if (error.request) {
      // No response from server
      return { success: false, message: "No response from server" };
    } else {
      // Request setup error
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

    // Handle new response format
    if (response.data.success) {
      const { token, userId, role } = response.data.data;

      // Store authentication data
      await storeAuthData(token, userId, role);

      // Navigate based on role
      if (role === "visitor") {
        navigation.navigate("VisitorScreen");
      } else if (role === "student") {
        navigation.navigate("Student");
      } else if (role === "company") {
        navigation.navigate("CompanyScreen");
      }

      return {
        success: true,
        message: response.data.message || "Login successful",
        token,
        userId,
        role,
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Login failed",
      };
    }
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
