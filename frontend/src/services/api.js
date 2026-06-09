import axios from "axios";
import toast from "react-hot-toast";

let authToken = localStorage.getItem("token") || null;

export const setAuthToken = (token) => {
  authToken = token;
  if (token) localStorage.setItem("token", token);
};

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem("token");
};

export const getAuthToken = () => authToken;

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://food-express-1kxp.onrender.com/api",
});

const publicAuthPaths = [
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/login",
  "/auth/register",
  "/auth/admin-register",
];

api.interceptors.request.use((config) => {
  const requestUrl = config.url || "";
  const isPublicAuthRequest = publicAuthPaths.some((path) =>
    requestUrl.includes(path)
  );

  if (isPublicAuthRequest) {
    delete config.headers.Authorization;
    return config;
  }

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
        window.location.href = window.location.pathname.startsWith("/admin")
          ? "/admin-login"
          : "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
