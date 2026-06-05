import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { loginApi, registerApi } from "../api/authApi";
import axiosClient from "../api/axiosClient";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    // Restore persisted user data from localStorage on first load
    try {
      const saved = localStorage.getItem("user_profile");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Fetch full user profile from /api/auth/me
  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await axiosClient.get("/auth/me");
      const userData = res.data?.user ?? res.data;
      const profile = { loggedIn: true, ...userData };
      setUser(profile);
      localStorage.setItem("user_profile", JSON.stringify(profile));
      return profile;
    } catch (err) {
      console.warn("Could not fetch user profile:", err.message);
      return null;
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setUser(null);
      localStorage.removeItem("user_profile");
    }
  }, [token, fetchCurrentUser]);

  const login = useCallback(async (email, password) => {
    const response = await loginApi({ email, password });
    const jwtToken = response.data.token;
    localStorage.setItem("token", jwtToken);
    setToken(jwtToken);
    // Immediately store user data from login response if available
    if (response.data.user) {
      const profile = { loggedIn: true, ...response.data.user };
      setUser(profile);
      localStorage.setItem("user_profile", JSON.stringify(profile));
    }
    return response;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const response = await registerApi({ name, email, password });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      setToken(response.data.token);
    }
    return response;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_profile");
    setToken(null);
    setUser(null);
  }, []);

  // Update local user state + localStorage (used by Profile page)
  const updateUser = useCallback((updatedFields) => {
    setUser((prev) => {
      const next = { ...prev, ...updatedFields };
      localStorage.setItem("user_profile", JSON.stringify(next));
      return next;
    });
  }, []);

  useEffect(() => {
    const handleLogout = () => logout();
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateUser, fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
