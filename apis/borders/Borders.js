import axios from "axios";
import { BASE_URL } from "../../constants/config";
import { getAuthToken } from "../../utils/auth";

/**
 * Get auth headers with token
 */
const getAuthHeaders = async () => {
  const token = await getAuthToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

/**
 * Fetch all borders from database
 */
export const getAllBorders = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${BASE_URL}/borders`, { headers });
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data || response.data.borders || [],
      };
    }
    
    return { success: false, data: [] };
  } catch (error) {
    console.error("Error fetching borders:", error);
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

/**
 * Create a new border (Admin only)
 */
export const createBorder = async (borderData) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${BASE_URL}/borders`, borderData, {
      headers,
    });

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
      };
    }

    return { success: false, message: "Failed to create border" };
  } catch (error) {
    console.error("Error creating border:", error);
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
