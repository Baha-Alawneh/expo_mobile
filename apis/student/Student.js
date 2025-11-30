import axios from "axios";
import { BASE_URL } from "../../constants/config";
import { getAuthHeaders } from "../../utils/auth";

export const getStudentData = async (id) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${BASE_URL}/students/profile/${id}`, {
      headers,
    });

    // Handle new response format
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Data fetched successfully",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to fetch data",
      };
    }
  } catch (error) {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        return {
          success: false,
          message: "Session expired. Please login again.",
          unauthorized: true,
        };
      }
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

export const getStudentDataByEmail = async (email) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${BASE_URL}/students/email/${email}`, {
      headers,
    });

    // Handle new response format
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Data fetched successfully",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to fetch data",
      };
    }
  } catch (error) {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        return {
          success: false,
          message: "Session expired. Please login again.",
          unauthorized: true,
        };
      }
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

export const postStudentData = async (id, studentData) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.put(
      `${BASE_URL}/students/profile/${id}`,
      studentData,
      { headers }
    );

    console.log("Request sent to server with data:", studentData);
    console.log("Response from server:", response.data);

    // Handle new response format
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Data updated successfully",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Update failed",
      };
    }
  } catch (error) {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        return {
          success: false,
          message: "Session expired. Please login again.",
          unauthorized: true,
        };
      }
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
