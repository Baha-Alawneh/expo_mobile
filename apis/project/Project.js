import axios from "axios";
import { BASE_URL } from "../../constants/config";

// GET student's project
export const getProject = async (user_id) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/projects/myproject/${user_id}`
    );
    return {
      success: true,
      data: response.data.data,
      message: "Project fetched successfully",
    };
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

// POST create new project
export const createProject = async (user_id, projectData) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/projects/myproject/${user_id}`,
      projectData,
      { headers: { "Content-Type": "application/json" } }
    );
    console.log("Request sent to server with data:", projectData);
    console.log("Response from server:", response.data);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Project created successfully",
    };
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

// PUT update existing project
export const updateProject = async (user_id, projectData) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/projects/myproject/${user_id}`,
      projectData,
      { headers: { "Content-Type": "application/json" } }
    );
    console.log("Request sent to server with data:", projectData);
    console.log("Response from server:", response.data);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Project updated successfully",
    };
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
