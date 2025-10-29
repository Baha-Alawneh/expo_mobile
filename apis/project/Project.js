import axios from "axios";
import { BASE_URL } from "../../constants/config";
import { getAuthHeaders } from "../../utils/auth";

// GET student's project
export const getProject = async (user_id) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(
      `${BASE_URL}/projects/myproject/${user_id}`,
      { headers }
    );

    // Handle new response format
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Project fetched successfully",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to fetch project",
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
      // Handle 404 Not Found (no project)
      if (error.response.status === 404) {
        return {
          success: false,
          message: error.response.data.message || "No project found",
          notFound: true,
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

// POST create new project
export const createProject = async (user_id, projectData) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${BASE_URL}/projects/myproject/${user_id}`,
      projectData,
      { headers }
    );

    console.log("Request sent to server with data:", projectData);
    console.log("Response from server:", response.data);

    // Handle new response format
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Project created successfully",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to create project",
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
      // Handle 400 Bad Request (e.g., duplicate project)
      if (error.response.status === 400) {
        return {
          success: false,
          message: error.response.data.message || "Invalid request",
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

// PUT update existing project
export const updateProject = async (user_id, projectData) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.put(
      `${BASE_URL}/projects/myproject/${user_id}`,
      projectData,
      { headers }
    );

    console.log("Request sent to server with data:", projectData);
    console.log("Response from server:", response.data);

    // Handle new response format
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Project updated successfully",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to update project",
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
