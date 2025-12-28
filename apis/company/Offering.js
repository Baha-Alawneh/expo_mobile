import axios from "axios";
import { BASE_URL } from "../../constants/config";
import { getAuthHeaders } from "../../utils/auth";

// Get all offerings with optional sorting
// Note: Backend automatically excludes the authenticated company's own offerings
export const getAllOfferings = async (sortBy = null, sortOrder = "DESC") => {
  try {
    const headers = await getAuthHeaders();
    let url = `${BASE_URL}/companies/offerings/all`;

    // Add query parameters if sorting is specified
    if (sortBy) {
      url += `?sortBy=${sortBy}&sortOrder=${sortOrder}`;
    }

    const response = await axios.get(url, { headers });

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        count: response.data.count,
        message: response.data.message || "Offerings fetched successfully",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to fetch offerings",
        notFound: response.data.notFound || false,
      };
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        return {
          success: false,
          message: "No offerings found",
          notFound: true,
          data: [],
        };
      }
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

export const getOffering = async (userId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(
      `${BASE_URL}/companies/offering/${userId}`,
      {
        headers,
      }
    );

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Offering fetched successfully",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to fetch offering",
        notFound: response.data.notFound || false,
      };
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        return {
          success: false,
          message: "No offering found",
          notFound: true,
        };
      }
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

export const getOfferingByCompanyId = async (companyId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(
      `${BASE_URL}/companies/offering/company/${companyId}`,
      {
        headers,
      }
    );

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Offering fetched successfully",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to fetch offering",
        notFound: response.data.notFound || false,
      };
    }
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        return {
          success: false,
          message: "No offering found",
          notFound: true,
        };
      }
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

export const createOffering = async (userId, offeringData) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(
      `${BASE_URL}/companies/offering/${userId}`,
      offeringData,
      { headers }
    );

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Offering created successfully",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to create offering",
      };
    }
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

export const updateOffering = async (userId, offeringData) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.put(
      `${BASE_URL}/companies/offering/${userId}`,
      offeringData,
      { headers }
    );

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Offering updated successfully",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to update offering",
      };
    }
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

export const uploadOfferingImages = async (userId, images) => {
  try {
    const headers = await getAuthHeaders();
    const formData = new FormData();

    // Add offering images
    images.forEach((image, index) => {
      formData.append("offering_images", {
        uri: image.uri,
        type: image.mimeType || "image/jpeg",
        name: image.fileName || `offering_${Date.now()}_${index}.jpg`,
      });
    });

    const response = await axios.post(
      `${BASE_URL}/companies/offering/${userId}/upload-images`,
      formData,
      {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000,
      }
    );

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || "Images uploaded successfully",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Upload failed",
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
