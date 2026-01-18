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
 * Fetch all buildings from database
 */
export const getAllBuildings = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${BASE_URL}/buildings`, { headers });
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data || response.data.buildings || [],
      };
    }
    
    return { success: false, data: [] };
  } catch (error) {
    console.error("Error fetching buildings:", error);
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
 * Create a new building (Admin only)
 */
export const createBuilding = async (buildingData) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${BASE_URL}/buildings`, buildingData, {
      headers,
    });

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
      };
    }

    return { success: false, message: "Failed to create building" };
  } catch (error) {
    console.error("Error creating building:", error);
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
