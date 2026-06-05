"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import { useLanguage, TranslationKey } from "@/components/context/LanguageContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useLanguage();

  const role = user?.role ?? "particular"; // admin | business | particular

  // Definición de menús centralizada
  const getMenuItems = (): { key: TranslationKey; href: string; icon: string }[] => {
    if (role === "admin") return [
      { key: "dashboard", href: "/admin/dashboard", icon: "bi-speedometer2" },
      { key: "bookings", href: "/bookings", icon: "bi-calendar2-check" },
      { key: "customers", href: "/customers", icon: "bi-people-fill" },
      { key: "payments", href: "/payments", icon: "bi-credit-card-2-front-fill" },
      { key: "business", href: "/business", icon: "bi-shop-window" },
      { key: "sidebarConfig", href: "/configuracion", icon: "bi-gear-fill" },
    ];
   // En tu archivo Sidebar.tsx
    if (role === "business") return [
      { key: "dashboard",          href: "/admin/dashboard", icon: "bi-speedometer2" }, // <--- AÑADE ESTO
      { key: "myBusinessBookings", href: "/business-bookings", icon: "bi-calendar2-check" },
      { key: "sidebarServices",    href: "/servicios",         icon: "bi-grid-1x2-fill" },
      { key: "sidebarConfig",      href: "/configuracion",     icon: "bi-gear-fill" },
    ];
  };

  return (
    <aside className="bf-sidebar">
      {/* Brand */}
      <div className="bf-sidebar-brand">
        <div className="bf-sidebar-logo">
          <div className="bf-sidebar-mark">
            <Image src="/favicon.ico" width={28} height={28} alt="logo" />
          </div>
          <div>
            <div className="bf-sidebar-name">BookFlow</div>
            <div className="bf-sidebar-role" style={{ color: "var(--accent)" }}>
              {role === "admin" ? "Admin Workspace" : role === "business" ? "Negocio" : "Espacio Cliente"}
            </div>
          </div>
        </div>
      </div>

      {/* Navegación dinámica */}
      <nav className="bf-sidebar-nav">
        <div className="bf-nav-label">Menú principal</div>
        {getMenuItems().map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`bf-nav-item${pathname === item.href ? " active" : ""}`}
          >
            <i className={`bi ${item.icon}`} aria-hidden="true" />
            <span>{t(item.key)}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}