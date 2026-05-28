"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";

export default function DashboardRouterPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Si no ha iniciado sesión, al login
    if (!user) {
      router.push("/login");
      return;
    }

    // 💡 TRUCO: Forzamos a TypeScript a tratar el rol como un 'unknown' y luego como un 'string'
    // De esta forma, nos deja compararlo con "customer" o "particular" sin protestar por los tipos originales
    const userRole = (user.role as unknown) as string;

    // 🔀 Distribuidor de rutas por rol mitigando el estricto de TypeScript
    if (userRole === "customer" || userRole === "particular") {
      // Si es cliente, lo mandamos directo a la interfaz de búsqueda
      router.push("/buscar");
    } else if (userRole === "business" || userRole === "admin") {
      // Si es empresa, lo mandamos a su panel analítico dentro de (admin)
      router.push("/admin/dashboard");
    }
  }, [user, isLoading, router]);

  return (
    <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted)" }}>
      Redirigiéndote a tu espacio...
    </div>
  );
}