"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User } from "@/lib/types";
import { loginUser, registerUser, fetchMe } from "@/lib/flask-client";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, check for existing token
  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored) {
      setToken(stored);
      fetchMe()
        .then((u) => setUser(u))
        .catch(() => {
          localStorage.removeItem("token");
          document.cookie = "token=; path=/; max-age=0";
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const saveAuth = useCallback((t: string, u: User) => {
    localStorage.setItem("token", t);
    document.cookie = `token=${t}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
    setToken(t);
    setUser(u);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await loginUser(email, password);
    saveAuth(data.token, data.user);
  }, [saveAuth]);

  const register = useCallback(async (email: string, name: string, password: string) => {
    const data = await registerUser(email, name, password);
    saveAuth(data.token, data.user);
  }, [saveAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; max-age=0";
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
