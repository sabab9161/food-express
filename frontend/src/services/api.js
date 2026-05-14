import axios from "axios";
import toast from "react-hot-toast";

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const clearAuthToken = () => {
  authToken = null;
};

export const getAuthToken = () => authToken;

const api = axios.create({
  baseURL: "http://localhost:5000/api"
});

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || "";

    if (error.response?.status === 401 && authToken && !requestUrl.includes("/auth/")) {
      clearAuthToken();
      toast.error("Session expired. Please log in again.");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = window.location.pathname.startsWith("/admin") ? "/admin-login" : "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
