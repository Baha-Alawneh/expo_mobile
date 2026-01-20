import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../../constants/config';

const API_URL = `${BASE_URL}/jobs`;

// Get auth token
const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

// Company APIs
export const createJobOffer = async (jobData) => {
  const token = await getAuthToken();
  const response = await axios.post(API_URL, jobData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getCompanyJobs = async () => {
  const token = await getAuthToken();
  const url = `${API_URL}/company/my-jobs`;
  console.log('Calling URL:', url);
  console.log('Token:', token ? 'Present' : 'Missing');
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const updateJobOffer = async (jobId, jobData) => {
  const token = await getAuthToken();
  const response = await axios.put(`${API_URL}/${jobId}`, jobData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const deleteJobOffer = async (jobId) => {
  const token = await getAuthToken();
  const response = await axios.delete(`${API_URL}/${jobId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const toggleJobStatus = async (jobId, isActive) => {
  const token = await getAuthToken();
  const response = await axios.patch(
    `${API_URL}/${jobId}/toggle-status`,
    { is_active: !isActive },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const getJobApplications = async (jobId) => {
  const token = await getAuthToken();
  const response = await axios.get(`${API_URL}/${jobId}/applications`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Student APIs
export const getAllJobs = async () => {
  const token = await getAuthToken();
  const response = await axios.get(`${API_URL}/all`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getJobById = async (jobId) => {
  const token = await getAuthToken();
  const response = await axios.get(`${API_URL}/${jobId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const applyToJob = async (jobId, coverLetter) => {
  const token = await getAuthToken();
  
  console.log('applyToJob called with:');
  console.log('- jobId:', jobId);
  console.log('- coverLetter:', coverLetter);
  console.log('- typeof coverLetter:', typeof coverLetter);
  
  const requestBody = { cover_letter: coverLetter };
  console.log('- Request body:', JSON.stringify(requestBody));
  
  const response = await axios.post(
    `${API_URL}/${jobId}/apply`,
    requestBody,
    { 
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      } 
    }
  );
  return response.data;
};

export const getMyApplications = async () => {
  const token = await getAuthToken();
  const response = await axios.get(`${BASE_URL}/api/v1/applications/my-applications`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const checkApplicationStatus = async (jobId) => {
  const token = await getAuthToken();
  const response = await axios.get(`${API_URL}/${jobId}/check-application`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const downloadCV = async (applicationId) => {
  const token = await getAuthToken();
  const response = await axios.get(`${BASE_URL}/applications/${applicationId}/download-cv`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
