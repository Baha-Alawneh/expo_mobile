import axios from "axios";
import { BASE_URL } from "../../constants/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuthHeaders } from "../../utils/auth";

// Get all reels (for feed)
export const getAllReels = async () => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await axios.get(`${BASE_URL}/reels`, {
      headers,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching all reels:", error);
    throw error;
  }
};

// Get reels by user ID
export const getUserReels = async (userId) => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await axios.get(`${BASE_URL}/reels/user/${userId}`, {
      headers,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching user reels:", error);
    throw error;
  }
};

// Get a specific reel by ID
export const getReelById = async (reelId) => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await axios.get(`${BASE_URL}/reels/${reelId}`, {
      headers,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching reel:", error);
    throw error;
  }
};

// Upload a new reel
export const uploadReel = async (userId, videoUri, description) => {
  try {
    const token = await AsyncStorage.getItem("token");
    
    // Create form data
    const formData = new FormData();
    
    // Add video file
    const uriParts = videoUri.split(".");
    const fileType = uriParts[uriParts.length - 1].toLowerCase();
    
    // Map common file extensions to proper MIME types
    const mimeTypes = {
      'mp4': 'video/mp4',
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
      'm4v': 'video/x-m4v',
      '3gp': 'video/3gpp',
    };
    
    const mimeType = mimeTypes[fileType] || `video/${fileType}`;
    
    formData.append("video", {
      uri: videoUri,
      name: `reel_${Date.now()}.${fileType}`,
      type: mimeType,
    });
    
    // Add description if provided
    if (description) {
      formData.append("description", description);
    }

    console.log("Uploading reel for user:", userId);
    console.log("Video URI:", videoUri);
    console.log("Video type:", mimeType);

    const response = await axios({
      method: 'POST',
      url: `${BASE_URL}/reels/${userId}/upload`,
      data: formData,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
      },
      timeout: 120000, // 2 minutes timeout for video upload
    });

    return response.data;
  } catch (error) {
    console.error("Error uploading reel:", error);
    if (error.response) {
      console.error("Response error:", error.response.data);
      console.error("Response status:", error.response.status);
    } else if (error.request) {
      console.error("Request error:", error.request);
    }
    throw error;
  }
};

// Update reel description
export const updateReelDescription = async (reelId, description) => {
  try {
    const token = await AsyncStorage.getItem("token");
    
    const response = await axios.put(
      `${BASE_URL}/reels/${reelId}/description`,
      { description },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error updating reel description:", error);
    throw error;
  }
};

// Delete a reel
export const deleteReel = async (reelId) => {
  try {
    const token = await AsyncStorage.getItem("token");
    
    const response = await axios.delete(
      `${BASE_URL}/reels/${reelId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error deleting reel:", error);
    throw error;
  }
};
