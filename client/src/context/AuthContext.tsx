import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "../lib/api";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  skills: string[];
  availability: number;
  timezone: string;
  portfolio_github: string;
  portfolio_figma: string;
  portfolio_website: string;
  work_preference: string;
  profile_complete: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const u = await api.me();
      setUser(u);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const u = await api.login({ email, password });
    setUser(u);
  };

  const register = async (email: string, password: string, name: string) => {
    const u = await api.register({ email, password, name });
    setUser(u);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
