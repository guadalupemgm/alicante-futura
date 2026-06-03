"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  email: string;
  role: "admin" | "business" | "customer";
  businessId?: number;
  customerId?: number;
}

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  changePassword: async () => {},
  isLoading: true,
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]   = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser  = localStorage.getItem("auth_user");
    setTimeout(() => {
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    }, 0);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Credenciales incorrectas");

    const data = await res.json();
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem("auth_token", data.access_token);
    localStorage.setItem("auth_user", JSON.stringify(data.user));

    if (data.user.role === "customer") {
      router.push("/reservas");
    } else {
      router.push("/dashboard");
    }
  };

  const register = async (data: RegisterData) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Error al crear la cuenta");
    }

    const result = await res.json();
    setToken(result.access_token);
    setUser(result.user);
    localStorage.setItem("auth_token", result.access_token);
    localStorage.setItem("auth_user", JSON.stringify(result.user));

    router.push("/reservas");
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    router.push("/login");
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const res = await fetch(`${API_URL}/auth/change-password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Error al cambiar la contraseña");
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, changePassword, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}