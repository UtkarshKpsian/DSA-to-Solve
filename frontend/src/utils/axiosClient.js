import axios from "axios"

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://backend-project-7vsd.onrender.com',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default axiosClient;

