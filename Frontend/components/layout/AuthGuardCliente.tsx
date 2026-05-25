"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";

const ALLOWED_PATHS = ["/empresas", "/reservas"];

export default function AuthGuardCliente({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    // Solo clientes pueden acceder a esta sección
    if (user.role !== "customer") {
      if (user.role === "admin") router.push("/dashboard");
      else if (user.role === "business") router.push("/business-bookings");
      return;
    }

    // Particular solo puede ver sus rutas permitidas
    const isAllowed = ALLOWED_PATHS.some((p) => pathname.startsWith(p));
    if (!isAllowed) {
      router.push("/empresas");
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