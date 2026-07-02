import axios from "axios";

export const SERVER_URL = "http://localhost:4000";

const api = axios.create({
  baseURL: `${SERVER_URL}/api`,
});

// prije svakog zahtjeva: ako imamo token, zakači ga u header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;