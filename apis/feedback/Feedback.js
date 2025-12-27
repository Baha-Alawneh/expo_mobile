import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../constants/config";

// Get all feedback for a project
export const getProjectFeedback = async (projectId) => {
  try {
    if (!projectId) {
      throw new Error("Project ID is required");
    }
    const response = await axios.get(
      `${API_URL}/feedback/project/${projectId}`
    );
    return response.data || { success: false, data: { feedback: [], average_rating: 0, total_ratings: 0 } };
  } catch (error) {
    console.error("Error fetching project feedback:", error);
    throw error;
  }
};

// Get all feedback for an offering
export const getOfferingFeedback = async (offeringId) => {
  try {
    const response = await axios.get(
      `${API_URL}/feedback/offering/${offeringId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching offering feedback:", error);
    throw error;
  }
};

// Get current user's feedback for a project
export const getUserProjectFeedback = async (projectId) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.get(
      `${API_URL}/feedback/user/project/${projectId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user project feedback:", error);
    throw error;
  }
};

// Get current user's feedback for an offering
export const getUserOfferingFeedback = async (offeringId) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.get(
      `${API_URL}/feedback/user/offering/${offeringId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user offering feedback:", error);
    throw error;
  }
};

// Create or update feedback for a project
export const submitProjectFeedback = async (projectId, rating, comment) => {
  try {
    if (!projectId) {
      throw new Error("Project ID is required");
    }
    if (!rating || rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }
    
    const token = await AsyncStorage.getItem("token");
    
    // Ensure comment is always a string (empty string if not provided)
    const safeComment = comment !== undefined && comment !== null ? String(comment) : "";
    
    const response = await axios.post(
      `${API_URL}/feedback/project/${projectId}`,
      { rating, comment: safeComment },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting project feedback:", error);
    throw error;
  }
};

// Create or update feedback for an offering
export const submitOfferingFeedback = async (offeringId, rating, comment) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/feedback/offering/${offeringId}`,
      { rating, comment },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error submitting offering feedback:", error);
    throw error;
  }
};

// Delete feedback
export const deleteFeedback = async (feedbackId) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.delete(`${API_URL}/feedback/${feedbackId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting feedback:", error);
    throw error;
  }
};
