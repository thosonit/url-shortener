"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { type AdminUser, clearToken } from "./api";

interface AuthState {
  user: AdminUser | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  setUser: (user: AdminUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem("admin_user");
    if (stored) {
      try {
        setState({ user: JSON.parse(stored), isLoading: false });
      } catch {
        setState({ user: null, isLoading: false });
      }
    } else {
      setState({ user: null, isLoading: false });
    }
  }, []);

  const setUser = useCallback((user: AdminUser) => {
    localStorage.setItem("admin_user", JSON.stringify(user));
    setState({ user, isLoading: false });
  }, []);

  const logout = useCallback(() => {
    clearToken();
    localStorage.removeItem("admin_user");
    setState({ user: null, isLoading: false });
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext value={{ ...state, setUser, logout }}>
      {children}
    </AuthContext>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
