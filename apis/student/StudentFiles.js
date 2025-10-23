import { BASE_URL } from "../../constants/config";

/**
 * Upload student profile photo and/or CV
 * @param {string} userId - The user ID
 * @param {Object} files - Object containing photo and/or cv files
 * @param {Object} files.photo - Photo file object from ImagePicker
 * @param {Object} files.cv - CV file object from DocumentPicker
 * @returns {Promise<Object>} - Response with uploaded file data and URLs
 */
export const uploadStudentFiles = async (userId, files) => {
  try {
    const formData = new FormData();

    if (files.photo) {
      const photoUri = files.photo.uri;
      // Extract filename from URI or generate a new one
      const uriParts = photoUri.split("/");
      const fileName = uriParts[uriParts.length - 1];
      const photoName =
        files.photo.fileName || fileName || `photo_${Date.now()}.jpg`;

      // Determine the correct file type
      let photoType = files.photo.type || files.photo.mimeType || "image/jpeg";
      if (!photoType.startsWith("image/")) {
        // Infer type from filename
        if (photoName.toLowerCase().endsWith(".png")) {
          photoType = "image/png";
        } else if (
          photoName.toLowerCase().endsWith(".jpg") ||
          photoName.toLowerCase().endsWith(".jpeg")
        ) {
          photoType = "image/jpeg";
        } else {
          photoType = "image/jpeg"; // default
        }
      }

      console.log("Preparing photo for upload:");
      console.log("  URI:", photoUri);
      console.log("  Name:", photoName);
      console.log("  Type:", photoType);

      formData.append("photo", {
        uri: photoUri,
        name: photoName,
        type: photoType,
      });
    }

    if (files.cv) {
      const cvUri = files.cv.uri;
      const cvName = files.cv.name || `cv_${Date.now()}.pdf`;
      const cvType = files.cv.mimeType || "application/pdf";

      console.log("Preparing CV for upload:");
      console.log("  URI:", cvUri);
      console.log("  Name:", cvName);
      console.log("  Type:", cvType);

      formData.append("cv", {
        uri: cvUri,
        name: cvName,
        type: cvType,
      });
    }

    const uploadUrl = `${BASE_URL}/students/profile/${userId}/upload`;
    console.log("Uploading to:", uploadUrl);
    console.log("BASE_URL:", BASE_URL);

    // Test server connectivity first
    try {
      const testResponse = await fetch(BASE_URL, {
        method: "GET",
        timeout: 5000,
      });
      console.log("Server is reachable:", testResponse.ok);
    } catch (testError) {
      console.error("Server connectivity test failed:", testError);
      throw new Error(
        "Cannot connect to server. Please make sure the backend is running and reachable at " +
          BASE_URL
      );
    }

    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
      // Do NOT set Content-Type header - let fetch set it automatically with boundary
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers);

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

    if (!response.ok) {
      throw new Error(result.message || "Upload failed");
    }

    return result;
  } catch (error) {
    console.error("Error uploading files:", error);
    console.error("Error details:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    throw error;
  }
};

/**
 * Get student profile with file URLs
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} - Student profile data with signed URLs
 */
export const getStudentProfile = async (userId) => {
  try {
    const response = await fetch(`${BASE_URL}/students/profile/${userId}`);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to fetch profile");
    }

    return result;
  } catch (error) {
    console.error("Error fetching student profile:", error);
    throw error;
  }
};

/**
 * Delete student photo or CV
 * @param {string} userId - The user ID
 * @param {string} fileType - 'photo' or 'cv'
 * @returns {Promise<Object>} - Response confirming deletion
 */
export const deleteStudentFile = async (userId, fileType) => {
  try {
    const response = await fetch(
      `${BASE_URL}/students/profile/${userId}/file`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileType }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Delete failed");
    }

    return result;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};
