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

    const allowedBusinessPaths = ["/admin", "/business-bookings", "/dashboard", "/payments", "/configuracion", "/settings"];
    if (user.role === "business" && !allowedBusinessPaths.some((p) => pathname.startsWith(p))) {
      router.push("/dashboard");
    }

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