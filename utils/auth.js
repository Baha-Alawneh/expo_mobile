import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Get authentication token from storage
 * @returns {Promise<string|null>} The auth token or null
 */
export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem("token");
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

/**
 * Get user ID from storage
 * @returns {Promise<string|null>} The user ID or null
 */
export const getUserId = async () => {
  try {
    return await AsyncStorage.getItem("userId");
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
};

/**
 * Get user role from storage
 * @returns {Promise<string|null>} The user role or null
 */
export const getUserRole = async () => {
  try {
    return await AsyncStorage.getItem("role");
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
};

/**
 * Store authentication data
 * @param {string} token - JWT token
 * @param {string} userId - User ID
 * @param {string} role - User role
 */
export const storeAuthData = async (token, userId, role) => {
  try {
    await AsyncStorage.multiSet([
      ["token", token],
      ["userId", userId],
      ["role", role],
      ["loginTime", Date.now().toString()],
    ]);
  } catch (error) {
    console.error("Error storing auth data:", error);
    throw error;
  }
};

/**
 * Clear all authentication data
 */
export const clearAuthData = async () => {
  try {
    await AsyncStorage.multiRemove(["token", "userId", "role", "loginTime"]);
  } catch (error) {
    console.error("Error clearing auth data:", error);
    throw error;
  }
};

/**
 * Check if token is still valid (within 7 days)
 * @returns {Promise<boolean>} True if valid, false otherwise
 */
export const isTokenValid = async () => {
  try {
    const loginTime = await AsyncStorage.getItem("loginTime");
    if (!loginTime) return false;

    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return Date.now() - parseInt(loginTime) < sevenDays;
  } catch (error) {
    console.error("Error checking token validity:", error);
    return false;
  }
};

/**
 * Get authorization headers for API requests
 * @returns {Promise<Object>} Headers object with Authorization
 */
export const getAuthHeaders = async () => {
  const token = await getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};
