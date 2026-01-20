import axios from "axios";
import { BASE_URL } from "../../constants/config";
import { getAuthHeaders, getAuthToken } from "../../utils/auth";

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

export const updateOffering = async (userId, offeringId, offeringData) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.put(
      `${BASE_URL}/companies/offering/${userId}/${offeringId}`,
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

export const deleteOffering = async (userId, offeringId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.delete(
      `${BASE_URL}/companies/offering/${userId}/${offeringId}`,
      { headers }
    );

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message || "Offering deleted successfully",
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to delete offering",
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

export const uploadOfferingImages = async (userId, offeringId, images, keepImageKeys = []) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("No authentication token found. Please login again.");
    }

    if (!offeringId) {
      throw new Error("Offering ID is required for image upload");
    }

    const formData = new FormData();

    // Add list of old image keys to keep
    if (keepImageKeys.length > 0) {
      formData.append("keepImages", JSON.stringify(keepImageKeys));
      console.log("Old images to keep:", keepImageKeys);
    }

    // Append multiple images to formData
    images.forEach((image, index) => {
      const imageUri = image.uri;
      const uriParts = imageUri.split("/");
      const fileName = uriParts[uriParts.length - 1];
      const imageName =
        image.fileName || fileName || `image_${Date.now()}_${index}.jpg`;

      // Determine the correct file type
      let imageType = image.type || image.mimeType || "image/jpeg";
      if (!imageType.startsWith("image/")) {
        if (imageName.toLowerCase().endsWith(".png")) {
          imageType = "image/png";
        } else if (
          imageName.toLowerCase().endsWith(".jpg") ||
          imageName.toLowerCase().endsWith(".jpeg")
        ) {
          imageType = "image/jpeg";
        } else {
          imageType = "image/jpeg"; // default
        }
      }

      console.log(`Preparing image ${index} for upload:`);
      console.log("  URI:", imageUri);
      console.log("  Name:", imageName);
      console.log("  Type:", imageType);

      formData.append("images", {
        uri: imageUri,
        name: imageName,
        type: imageType,
      });
    });

    const uploadUrl = `${BASE_URL}/companies/offering/${userId}/${offeringId}/upload`;
    console.log("Uploading to:", uploadUrl);

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    console.log("Response status:", response.status);

    const responseText = await response.text();
    console.log("Response text:", responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse response:", responseText);
      throw new Error(
        "Invalid server response: " + responseText.substring(0, 100)
      );
    }

    console.log("Response data:", result);

    // Handle 401 Unauthorized
    if (response.status === 401) {
      throw new Error("Session expired. Please login again.");
    }

    // Handle 429 Rate Limit
    if (response.status === 429) {
      throw new Error("Too many upload requests. Please try again later.");
    }

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Upload failed");
    }

    return result;
  } catch (error) {
    console.error("Error uploading offering images:", error);
    console.error("Error details:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    throw error;
  }
};

// Get All Offerings by Company ID
export const getOfferingsByCompanyId = async (companyId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(
      `${BASE_URL}/companies/${companyId}/offerings`,
      { headers }
    );

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
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
    if (error.response?.status === 404) {
      return {
        success: false,
        message: "No offerings found",
        notFound: true,
        data: [],
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch offerings",
    };
  }
};

// Get Company Status
export const getCompanyStatus = async (userId) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(
      `${BASE_URL}/companies/status/${userId}`,
      { headers }
    );

    if (response.data.success) {
      return {
        success: true,
        status: response.data.status,
        rejection_reason: response.data.rejection_reason,
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Failed to fetch company status",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch company status",
    };
  }
};
