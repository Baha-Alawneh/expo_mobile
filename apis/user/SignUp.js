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
      const { token, userId, role, name, email } = response.data.data;

      // Store authentication data including name and email
      await storeAuthData(token, userId, role, name, email);

      // Navigate based on role
      if (role === "visitor") {
        navigation.navigate("Visitor");
      } else if (role === "student") {
        navigation.navigate("Student");
      } else if (role === "company") {
        navigation.navigate("Company");
      } else if (role === "admin") {
        navigation.navigate("Admin");
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

// Send password reset code
export const sendPasswordResetCode = async (email) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/users/forgot-password`,
      { email },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message || "Reset code sent to your email",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to send reset code",
      };
    }
  } catch (error) {
    if (error.response) {
      return {
        success: false,
        message: error.response.data.message || error.response.data,
      };
    } else if (error.request) {
      return { success: false, message: "No response from server" };
    } else {
      return { success: false, message: error.message };
    }
  }
};

// Verify password reset code
export const verifyPasswordResetCode = async (email, code) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/users/verify-reset-code`,
      { email, code },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message || "Code verified successfully",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Invalid verification code",
      };
    }
  } catch (error) {
    if (error.response) {
      return {
        success: false,
        message: error.response.data.message || error.response.data,
      };
    } else if (error.request) {
      return { success: false, message: "No response from server" };
    } else {
      return { success: false, message: error.message };
    }
  }
};

// Reset password
export const resetPassword = async (email, newPassword) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/users/reset-password`,
      { email, newPassword },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message || "Password reset successfully",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to reset password",
      };
    }
  } catch (error) {
    if (error.response) {
      return {
        success: false,
        message: error.response.data.message || error.response.data,
      };
    } else if (error.request) {
      return { success: false, message: "No response from server" };
    } else {
      return { success: false, message: error.message };
    }
  }
};
