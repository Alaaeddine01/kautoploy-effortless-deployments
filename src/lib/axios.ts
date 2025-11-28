import axios from 'axios';

 //const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const baseURL = "https://api.kautoploy.com"

const axiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
