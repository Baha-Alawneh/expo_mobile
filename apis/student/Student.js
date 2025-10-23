import axios from "axios";
import { BASE_URL } from "../../constants/config";

export const getStudentData = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/students/profile/${id}`);

    const student = response.data;

    return {
      success: true,
      data: student,
      message: `${student.name} data fetched successfully`,
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
export const postStudentData = async (id, studentData) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/students/profile/${id}`, // Server endpoint for updating student
      studentData, // Data to send
      { headers: { "Content-Type": "application/json" } }
    );
    console.log("Request sent to server with data:", studentData);
    console.log("Response from server:", response.data);
    return {
      success: true,
      data: response.data,
      message: `${response.data.name} data updated successfully`,
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
