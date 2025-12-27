import axios from "axios";
import { SERVER_IP_HOME_AYMAN, SERVER_PORT } from "../constants/config";

// Chatbot API URL - adjust this based on your chatbot API server
const CHATBOT_API_URL = `http://${SERVER_IP_HOME_AYMAN}:3001/api/chatbot`;

/**
 * Send a message to the chatbot and get a response
 * @param {string} question - User's question/message
 * @returns {Promise<Object>} Response from chatbot API
 */
export const sendMessageToChatbot = async (question) => {
  try {
    const response = await axios.post(
      `${CHATBOT_API_URL}/chat`,
      {
        question: question,
        useOpenAI: true,
      },
      {
        timeout: 30000, // 30 second timeout
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data && response.data.success) {
      return {
        success: true,
        answer: response.data.answer,
        analysis: response.data.analysis,
        metadata: response.data.metadata,
      };
    } else {
      return {
        success: false,
        error: response.data?.message || "Unknown error occurred",
      };
    }
  } catch (error) {
    console.error("Error communicating with chatbot:", error);
    return {
      success: false,
      error: error.message || "Failed to connect to chatbot service",
    };
  }
};

/**
 * Analyze a query without generating a full response (for testing)
 * @param {string} query - Query to analyze
 * @returns {Promise<Object>} Analysis result
 */
export const analyzeQuery = async (query) => {
  try {
    const response = await axios.post(
      `${CHATBOT_API_URL}/analyze`,
      {
        question: query,
      },
      {
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data && response.data.success) {
      return {
        success: true,
        analysis: response.data.analysis,
      };
    } else {
      return {
        success: false,
        error: response.data?.message || "Unknown error occurred",
      };
    }
  } catch (error) {
    console.error("Error analyzing query:", error);
    return {
      success: false,
      error: error.message || "Failed to analyze query",
    };
  }
};
