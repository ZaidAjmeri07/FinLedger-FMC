import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("finledger_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("finledger_token") || null);
  const [loading, setLoading] = useState(true);

  // Validate or fetch fresh profile on boot
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const savedToken = localStorage.getItem("finledger_token");
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        setUser(data);
        localStorage.setItem("finledger_user", JSON.stringify(data));
      } catch (err) {
        console.error("Auth validation failed:", err);
        localStorage.removeItem("finledger_token");
        localStorage.removeItem("finledger_user");
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("finledger_token", data.token);
    localStorage.setItem("finledger_user", JSON.stringify(data.user));
    return data.user;
  };

  const register = async ({ name, email, password, businessName }) => {
    const { data } = await api.post("/auth/register", {
      name,
      email,
      password,
      businessName,
    });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("finledger_token", data.token);
    localStorage.setItem("finledger_user", JSON.stringify(data.user));
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("finledger_token");
    localStorage.removeItem("finledger_user");
    setUser(null);
    setToken(null);
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAdmin,
      }}
    >
      {children}
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
