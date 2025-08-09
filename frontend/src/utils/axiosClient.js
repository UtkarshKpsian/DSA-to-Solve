import axios from "axios"

// Determine the correct base URL
let baseURL;
if (import.meta.env.MODE === 'development') {
  baseURL = 'http://localhost:3000';
} else {
  // Production - use deployed backend
  baseURL = import.meta.env.VITE_API_URL || 'https://backend-project-7vsd.onrender.com';
}

console.log('API Base URL:', baseURL);
console.log('Environment:', import.meta.env.MODE);
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);

const axiosClient = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for debugging
axiosClient.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    console.log('Full URL:', config.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
axiosClient.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.status);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    return Promise.reject(error);
  }
);

export default axiosClient;

