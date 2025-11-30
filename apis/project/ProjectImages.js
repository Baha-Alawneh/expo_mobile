import { BASE_URL } from "../../constants/config";
import { getAuthToken } from "../../utils/auth";

/**
 * Upload project images
 * @param {string} userId - The user ID
 * @param {Array} images - Array of image objects from ImagePicker
 * @returns {Promise<Object>} - Response with uploaded image URLs
 */
export const uploadProjectImages = async (userId, images) => {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("No authentication token found. Please login again.");
    }

    const formData = new FormData();

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

    const uploadUrl = `${BASE_URL}/projects/myproject/${userId}/upload`;
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
    console.error("Error uploading project images:", error);
    console.error("Error details:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    throw error;
  }
};
