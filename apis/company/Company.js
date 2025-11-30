import axios from "axios";
import { BASE_URL } from "../../constants/config";
import { getAuthHeaders } from "../../utils/auth";

export const getAllCompanies = async () => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${BASE_URL}/companies`, {
      headers,
    });

    // Handle new response format
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        count: response.data.count,
        message: response.data.message || "Companies fetched successfully",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to fetch companies",
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

export const getCompanyData = async (id) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${BASE_URL}/companies/profile/${id}`, {
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

export const postCompanyData = async (id, companyData) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.put(
      `${BASE_URL}/companies/profile/${id}`,
      companyData,
      { headers }
    );

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

export const getCompanyDataByEmail = async (email) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${BASE_URL}/companies/email/${email}`, {
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

export const getCompanyDataById = async (companyId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${BASE_URL}/companies/id/${companyId}`, {
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

export const getCompanyWithOfferings = async (user_id) => {
  try {
    const headers = await getAuthHeaders();

    // Fetch company data
    const companyResponse = await axios.get(
      `${BASE_URL}/companies/profile/${user_id}`,
      { headers }
    );

    if (!companyResponse.data.success) {
      return {
        success: false,
        message: companyResponse.data.message || "Failed to fetch company data",
      };
    }

    const companyData = companyResponse.data.data;

    // Fetch offerings
    let offerings = null;
    try {
      const offeringsResponse = await axios.get(
        `${BASE_URL}/companies/offering/${user_id}`,
        { headers }
      );

      if (offeringsResponse.data.success) {
        offerings = offeringsResponse.data.data;
      }
    } catch (offeringError) {
      // Offerings might not exist, that's okay
      console.log("No offerings found for this company");
    }

    return {
      success: true,
      data: {
        ...companyData,
        offering: offerings,
      },
      message: "Company data fetched successfully",
    };
  } catch (error) {
    if (error.response) {
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
