import axios from "axios";
import { getStoredToken } from "../utils/storage";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://backend-em64.onrender.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;
