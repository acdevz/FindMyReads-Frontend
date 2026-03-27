// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { fetchApi } from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const profile = await fetchApi("/api/me");
        setUser(profile);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const handleAuthResponse = async (data) => {
    try {
      const profile = await fetchApi("/api/me");
      setUser(profile);
    } catch (error) {
      setUser({ id: data.userId, onboardingDone: data.onboardingDone });
    }
    return data;
  };

  const login = async (email, password) => {
    const data = await fetchApi("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return handleAuthResponse(data);
  };

  const register = async (email, username, password) => {
    const data = await fetchApi("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, username, password }),
    });
    return handleAuthResponse(data);
  };

  const logout = async () => {
    try {
      await fetchApi("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
