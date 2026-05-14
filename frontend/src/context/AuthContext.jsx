import { createContext, useContext, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api, { clearAuthToken, setAuthToken as setApiAuthToken } from "../services/api";

const AuthContext = createContext(null);
const getErrorMessage = (error) => error.response?.data?.message || "Something went wrong";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const login = async (credentials) => {
    try {
      const { data } = await api.post("/auth/verify-login-otp", credentials);
      setToken(data.token);
      setApiAuthToken(data.token);
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name}`);
      return data.user;
    } catch (error) {
      error.message = getErrorMessage(error);
      throw error;
    }
  };

  const register = async (payload) => {
    try {
      const { data } = await api.post("/auth/verify-signup-otp", { ...payload, role: "user" });
      return data.user;
    } catch (error) {
      error.message = getErrorMessage(error);
      throw error;
    }
  };

  const registerAdmin = async (payload) => {
    try {
      const { data } = await api.post("/auth/verify-signup-otp", { ...payload, role: "admin" });
      return data.user;
    } catch (error) {
      error.message = getErrorMessage(error);
      throw error;
    }
  };

  const sendSignupOtp = async (payload, role = "user") => {
    try {
      const { data } = await api.post("/auth/send-signup-otp", { ...payload, role });
      toast.success(data.message || "OTP sent to email");
      return data;
    } catch (error) {
      error.message = getErrorMessage(error);
      throw error;
    }
  };

  const sendLoginOtp = async (payload, role = "user") => {
    try {
      const { data } = await api.post("/auth/send-login-otp", { ...payload, role });
      toast.success(data.message || "OTP sent to email");
      return data;
    } catch (error) {
      error.message = getErrorMessage(error);
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    clearAuthToken();
    setUser(null);
    toast.success("Logged out");
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      login,
      register,
      registerAdmin,
      sendSignupOtp,
      sendLoginOtp,
      logout,
      updateUser
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
