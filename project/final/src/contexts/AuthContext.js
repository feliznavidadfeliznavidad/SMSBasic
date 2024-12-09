import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  axios.defaults.baseURL = "http://localhost:8888";

  axios.interceptors.request.use(
    (config) => {
      // Ưu tiên lấy token từ sessionStorage trước
      const token =
        sessionStorage.getItem("token") || localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  useEffect(() => {
    const initializeAuth = async () => {
      // Kiểm tra token trong cả sessionStorage và localStorage
      const sessionToken = sessionStorage.getItem("token");
      const localToken = localStorage.getItem("token");
      const token = sessionToken || localToken;

      if (token) {
        try {
          const response = await axios.get("/api/auth/profile");
          setUser(response.data.user);
        } catch (error) {
          // Xóa token khỏi cả hai storage khi hết hạn
          sessionStorage.removeItem("token");
          localStorage.removeItem("token");
          setError("Session expired. Please login again.");
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post("/api/auth/login", { email, password });
      const { token, user } = response.data;
      // Lưu token vào cả hai storage
      localStorage.setItem("token", token);
      sessionStorage.setItem("token", token);
      setUser(user);
      setError(null);
      return user.role;
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post("/api/auth/register", userData);
      const { token, user } = response.data;
      // Lưu token vào cả hai storage
      localStorage.setItem("token", token);
      sessionStorage.setItem("token", token);
      setUser(user);
      setError(null);
      return true;
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
      throw error;
    }
  };

  const googleLogin = async (idToken) => {
    try {
      const response = await axios.post("/api/auth/google-login", { idToken });
      const { token, user } = response.data;
      // Lưu token vào cả hai storage
      localStorage.setItem("token", token);
      sessionStorage.setItem("token", token);
      setUser(user);
      setError(null);
      return user.role;
    } catch (error) {
      setError(error.response?.data?.message || "Google login failed");
      throw error;
    }
  };

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Xóa token khỏi cả hai storage
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      setUser(null);
      setError(null);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const response = await axios.put(`/api/users/${user.uid}`, updates);
      setUser({ ...user, ...updates });
      return response.data;
    } catch (error) {
      setError(error.response?.data?.message || "Profile update failed");
      throw error;
    }
  };

  const resetPassword = async (email) => {
    try {
      await axios.post("/api/auth/reset-password", { email });
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || "Password reset failed");
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    googleLogin,
    logout,
    updateProfile,
    resetPassword,
    setError,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
