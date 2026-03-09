"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getToken, isLoggedIn, login, logout, refreshToken, parseTokenPayload, type SocialProvider } from "@/lib/auth";

interface User {
  email: string;
  name?: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (provider?: SocialProvider) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(() => {
    const t = getToken();
    if (!t) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }
    const payload = parseTokenPayload(t);
    if (!payload) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }
    // Check expiry
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      refreshToken().then((ok) => {
        if (ok) loadUser();
        else setLoading(false);
      });
      return;
    }
    setToken(t);
    setUser({
      email: payload.email || "",
      name: payload.preferred_username || payload.name || payload.email,
      roles: payload.realm_access?.roles || [],
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
