'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  roleName: string;
  designation?: string;
  avatar?: string;
  permissions: string[];
}

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  hasPermission: (perm: string) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
  hasPermission: () => false,
});

export const useAuth = () => useContext(AuthContext);

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const savedToken =
      typeof window !== 'undefined' ? localStorage.getItem('vts_admin_token') : null;
    if (!savedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }
    try {
      setToken(savedToken);
      const data = await apiFetch<{ user: AdminUser }>('/auth/me');
      setUser(data.user);
    } catch {
      localStorage.removeItem('vts_admin_token');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = (newToken: string, newUser: AdminUser) => {
    localStorage.setItem('vts_admin_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('vts_admin_token');
    apiFetch('/auth/logout', { method: 'POST' }).catch(() => {});
    setToken(null);
    setUser(null);
  };

  const hasPermission = (perm: string) => {
    if (!user) return false;
    if (user.roleName === 'Super Administrator' || user.roleName === 'Administrator') {
      return true;
    }
    return user.permissions?.includes(perm) || false;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{ user, token, loading, login, logout, refreshUser, hasPermission }}
      >
        {children}
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}
