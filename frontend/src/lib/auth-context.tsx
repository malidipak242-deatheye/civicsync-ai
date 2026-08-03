"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ role: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("civicsync_token");
      const storedUser = localStorage.getItem("civicsync_user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // localStorage may not be available (SSR/private mode)
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ role: string }> => {
    const res = await api.post("/auth/login", { email, password });
    const { token: t, user: u } = res.data;
    localStorage.setItem("civicsync_token", t);
    localStorage.setItem("civicsync_user", JSON.stringify(u));
    setToken(t);
    setUser(u);
    return { role: u.role };
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const res = await api.post("/auth/register", { name, email, password, phone });
    const { token: t, user: u } = res.data;
    localStorage.setItem("civicsync_token", t);
    localStorage.setItem("civicsync_user", JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem("civicsync_token");
    localStorage.removeItem("civicsync_user");
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem("civicsync_user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
