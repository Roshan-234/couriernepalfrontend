"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import api from "@/lib/api";
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  roles: string[];
  is_admin: boolean;
  role: "customer" | "admin" | "agent";
}
function normalize(user: User): User {
  const is_admin = user.roles.some((role) =>
    ["admin", "super_admin"].includes(role),
  );
  return {
    ...user,
    is_admin,
    role: is_admin
      ? "admin"
      : user.roles.includes("agent")
        ? "agent"
        : "customer",
  };
}
const AuthContext = createContext<
  | {
      user: User | null;
      loading: boolean;
      isAuthenticated: boolean;
      login: (email: string, password: string) => Promise<User>;
      logout: () => Promise<void>;
    }
  | undefined
>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    ["token", "access_token", "refresh_token", "user"].forEach((key) =>
      localStorage.removeItem(key),
    );
    api
      .get("/auth/profile")
      .then(({ data }) => setUser(normalize(data)))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);
  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    const current = normalize(data.user);
    setUser(current);
    return current;
  };
  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    window.location.assign("/auth/login");
  };
  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within an AuthProvider");
  return value;
}
