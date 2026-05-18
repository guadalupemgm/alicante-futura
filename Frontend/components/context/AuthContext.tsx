"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  email: string;
  role: "admin" | "business" | "particular"; // Agregado el rol de particular para los clientes
  businessId?: number;
  name?: string;  
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>; // Nueva función para registrar clientes
  logout: () => void;
  changePassword: (newPassword: string) => Promise<void>;
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

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");
    if (stored && storedUser) {
      setToken(stored);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
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
    router.push("/dashboard");
  };

  // Petición POST al backend para registrar un nuevo cliente particular
  const register = async (userData: any) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    // Si el backend da error (ej. email duplicado), lanzamos el error para capturarlo en el formulario
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Error al crear la cuenta");
    }

    const data = await res.json();
    
    // Si el backend ya nos devuelve el token al registrarse, lo logueamos directamente
    if (data.access_token && data.user) {
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem("auth_token", data.access_token);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
      router.push("/dashboard");
    } else {
      // Si no devuelve token, forzamos el login con las credenciales que acaba de crear
      await login(userData.email, userData.password);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    router.push("/login");
  };

  const changePassword = async (newPassword: string) => {
    const res = await fetch(`${API_URL}/users/change-password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newPassword }),
    });
    if (!res.ok) throw new Error("Error al cambiar la contraseña");
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