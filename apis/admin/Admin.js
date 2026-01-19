import axios from "axios";
import { BASE_URL } from "../../constants/config";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Get Dashboard Statistics
export const getDashboardStats = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await axios.get(`${BASE_URL}/admin/dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch statistics",
    };
  }
};

// Get Pending Projects
export const getPendingProjects = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await axios.get(`${BASE_URL}/admin/projects/pending`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch pending projects",
    };
  }
};

// Get Projects by Status
export const getProjectsByStatus = async (status) => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await axios.get(`${BASE_URL}/admin/projects/status/${status}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || `Failed to fetch ${status} projects`,
    };
  }
};

// Update Project Status (Approve/Reject)
export const updateProjectStatus = async (projectId, status, rejection_reason = null) => {
  try {
    const token = await AsyncStorage.getItem("token");

    const body = { status };
    if (status === "rejected" && rejection_reason) {
      body.rejection_reason = rejection_reason;
    }

    const response = await axios.patch(
      `${BASE_URL}/admin/projects/${projectId}/status`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update project status",
    };
  }
};

// Get Pending Offerings
export const getPendingOfferings = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await axios.get(`${BASE_URL}/admin/offerings/pending`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch pending offerings",
    };
  }
};

// Get Offerings by Status
export const getOfferingsByStatus = async (status) => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await axios.get(`${BASE_URL}/admin/offerings/status/${status}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error(`Error fetching ${status} offerings:`, error);
    return {
      success: false,
      message: error.response?.data?.message || `Failed to fetch ${status} offerings`,
    };
  }
};

// Update Offering Status (Approve/Reject)
export const updateOfferingStatus = async (offeringId, status, rejection_reason = null) => {
  try {
    const token = await AsyncStorage.getItem("token");

    const body = { status };
    if (status === "rejected" && rejection_reason) {
      body.rejection_reason = rejection_reason;
    }

    const response = await axios.patch(
      `${BASE_URL}/admin/offerings/${offeringId}/status`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update offering status",
    };
  }
};

// Send Notification
export const sendNotification = async (notificationData) => {
  try {
    console.log("[API] sendNotification called with:", notificationData);
    const token = await AsyncStorage.getItem("token");

    const response = await axios.post(
      `${BASE_URL}/admin/notifications/send`,
      notificationData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("[API] sendNotification response:", response.data);
    return {
      success: true,
      message: response.data.message,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to send notification",
    };
  }
};

// Get All Users
export const getAllUsers = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await axios.get(`${BASE_URL}/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch users",
    };
  }
};

// Get User Registrations for Analytics
export const getUserRegistrations = async (timeRange = 'week') => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await axios.get(`${BASE_URL}/admin/analytics/user-registrations?timeRange=${timeRange}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch user registrations",
    };
  }
};

// Get Top Rated Projects for Analytics
export const getTopRatedProjects = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await axios.get(`${BASE_URL}/admin/analytics/top-projects`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch top rated projects",
    };
  }
};

// Get Top Rated Offerings for Analytics
export const getTopRatedOfferings = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await axios.get(`${BASE_URL}/admin/analytics/top-offerings`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch top rated offerings",
    };
  }
};

// Get Pending Companies
export const getPendingCompanies = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await axios.get(`${BASE_URL}/admin/companies/pending`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch pending companies",
    };
  }
};

// Get Companies by Status
export const getCompaniesByStatus = async (status) => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await axios.get(`${BASE_URL}/admin/companies/status/${status}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || `Failed to fetch ${status} companies`,
    };
  }
};

// Update Company Status (Approve/Reject)
export const updateCompanyStatus = async (companyId, status, rejection_reason = null) => {
  try {
    const token = await AsyncStorage.getItem("token");

    const body = { status };
    if (status === "rejected" && rejection_reason) {
      body.rejection_reason = rejection_reason;
    }

    const response = await axios.patch(
      `${BASE_URL}/admin/companies/${companyId}/status`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update company status",
    };
  }
};
