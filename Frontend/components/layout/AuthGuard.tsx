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

    // Sin sesión → login
    if (!user) {
      router.push("/login");
      return;
    }

    // Business solo puede ver /business-bookings
    if (user.role === "business" && pathname !== "/business-bookings") {
      router.push("/business-bookings");
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