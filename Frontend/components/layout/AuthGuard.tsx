"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    // ✅ admin y business tienen acceso libre a todas las rutas /admin/*
    if (user.role === "admin" || user.role === "business") return;

    // Los clientes solo pueden estar en sus rutas
    if (
      user.role === "customer" &&
      !pathname.startsWith("/empresas") &&
      !pathname.startsWith("/reservas") &&
      !pathname.startsWith("/settings")
    ) {
      router.push("/reservas");
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="auth-loading__spinner" />
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}