import { createContext, useContext, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api, { clearAuthToken, setAuthToken as setApiAuthToken } from "../services/api";

const AuthContext = createContext(null);
const getErrorMessage = (error) => error.response?.data?.message || "Something went wrong";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const setSession = ({ token: nextToken, user: nextUser }) => {
    setToken(nextToken);
    setApiAuthToken(nextToken);
    setUser(nextUser);
  };

  const login = async (credentials) => {
    try {
      const { data } = await api.post("/auth/login", credentials);
      setSession(data);
      toast.success(`Welcome back, ${data.user.name}`);
      return data.user;
    } catch (error) {
      error.message = getErrorMessage(error);
      throw error;
    }
  };

  const register = async (payload) => {
    try {
      const { data } = await api.post("/auth/register", payload);
      setSession(data);
      toast.success(`Welcome, ${data.user.name}`);
      return data.user;
    } catch (error) {
      error.message = getErrorMessage(error);
      throw error;
    }
  };

  const registerAdmin = async (payload) => {
    try {
      const { data } = await api.post("/auth/admin-register", payload);
      setSession(data);
      toast.success(`Welcome, ${data.user.name}`);
      return data.user;
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
      setSession,
      logout,
      updateUser
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
