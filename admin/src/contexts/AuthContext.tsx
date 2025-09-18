"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, AuthResponse, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'admin_access_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (!t) { setLoading(false); return; }
    (async () => {
      const res = await api.profile(t);
      if (res.success && res.data) {
        setUser(res.data);
        setToken(t);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login({ email, password });
    if (!res.success || !res.data) {
      return { success: false, error: res.error || 'Login failed' };
    }
    const data = res.data as AuthResponse;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, data.accessToken);
    }
    setToken(data.accessToken);
    setUser(data.user);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo<AuthContextType>(() => ({ user, token, loading, login, logout }), [user, token, loading, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};


