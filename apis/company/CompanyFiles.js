import { BASE_URL } from "../../constants/config";
import { getAuthToken } from "../../utils/auth";

/**
 * Upload company profile image
 * @param {string} userId - The user ID
 * @param {Object} files - Object containing profile_image file
 * @param {Object} files.profile_image - Profile image file object from ImagePicker
 * @returns {Promise<Object>} - Response with uploaded file data and URLs
 */
export const uploadCompanyFile = async (userId, files) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("No authentication token found. Please login again.");
    }

    const formData = new FormData();

    if (files.profile_image) {
      const imageUri = files.profile_image.uri;
      const uriParts = imageUri.split("/");
      const fileName = uriParts[uriParts.length - 1];
      const imageName =
        files.profile_image.fileName || fileName || `profile_${Date.now()}.jpg`;

      let imageType =
        files.profile_image.type ||
        files.profile_image.mimeType ||
        "image/jpeg";
      if (!imageType.startsWith("image/")) {
        if (imageName.toLowerCase().endsWith(".png")) {
          imageType = "image/png";
        } else if (
          imageName.toLowerCase().endsWith(".jpg") ||
          imageName.toLowerCase().endsWith(".jpeg")
        ) {
          imageType = "image/jpeg";
        } else {
          imageType = "image/jpeg";
        }
      }

      formData.append("profile_image", {
        uri: imageUri,
        name: imageName,
        type: imageType,
      });
    }

    const uploadUrl = `${BASE_URL}/companies/profile/${userId}/upload`;

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const responseText = await response.text();

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error(
        "Invalid server response: " + responseText.substring(0, 100)
      );
    }

    // Handle 401 Unauthorized
    if (response.status === 401) {
      throw new Error("Session expired. Please login again.");
    }

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Upload failed");
    }

    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete company profile image
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - Response confirming deletion
 */
export const deleteCompanyFile = async (userId) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("No authentication token found. Please login again.");
    }

    const response = await fetch(
      `${BASE_URL}/companies/profile/${userId}/file`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    // Handle 401 Unauthorized
    if (response.status === 401) {
      throw new Error("Session expired. Please login again.");
    }

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Delete failed");
    }

    return result;
  } catch (error) {
    throw error;
  }
};
