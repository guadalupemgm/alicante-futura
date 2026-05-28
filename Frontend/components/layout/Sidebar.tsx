"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import { useLanguage, TranslationKey } from "@/components/context/LanguageContext";

// Menú de administrador
const adminMenu: { key: TranslationKey; href: string; icon: string }[] = [
  { key: "dashboard",  href: "/dashboard",  icon: "bi-speedometer2" },
  { key: "bookings",   href: "/bookings",   icon: "bi-calendar2-check" },
  { key: "customers",  href: "/customers",  icon: "bi-people-fill" },
  { key: "payments",   href: "/payments",   icon: "bi-credit-card-2-front-fill" },
  { key: "business",   href: "/business",   icon: "bi-shop-window" },
];

// Menú de negocio (Business)
const businessMenu: { key: TranslationKey; href: string; icon: string }[] = [
  { key: "dashboard",          href: "/dashboard",          icon: "bi-speedometer2" },
  { key: "myBusinessBookings", href: "/business-bookings",  icon: "bi-calendar2-check" },
  { key: "payments",           href: "/payments",           icon: "bi-credit-card-2-front-fill" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useLanguage();

  const role = user?.role ?? "particular"; // admin | business | particular
  const initial = (user?.email?.[0] ?? "U").toUpperCase();
  const displayName = user?.email?.split("@")[0] ?? "Usuario";
  const isBusinessUser = role === "business";

  // Definición de menús centralizada
  const getMenuItems = () => {
    if (role === "admin") return [
      { key: "dashboard", href: "/dashboard", icon: "bi-speedometer2" },
      { key: "bookings", href: "/bookings", icon: "bi-calendar2-check" },
      { key: "customers", href: "/customers", icon: "bi-people-fill" },
      { key: "payments", href: "/payments", icon: "bi-credit-card-2-front-fill" },
      { key: "business", href: "/business", icon: "bi-shop-window" },
    ];
    if (role === "business") return [
      { key: "bookings", href: "/business-bookings", icon: "bi-calendar2-check" },
      { key: "configuracion", href: "/configuracion", icon: "bi-gear-fill" },
    ];
    return [ // particular
      { key: "search", href: "/buscar", icon: "bi-search" },
      { key: "myBookings", href: "/mis-reservas", icon: "bi-calendar2-check" },
      { key: "myProfile", href: "/perfil", icon: "bi-person-fill" },
    ];
  };

  return (
    <aside className="bf-sidebar">
      {/* Brand */}
      <div className="bf-sidebar-brand">
        <div className="bf-sidebar-logo">
          <div className="bf-sidebar-mark">
            <img src="/favicon.ico" style={{ width: "28px", height: "28px" }} alt="logo" />
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
            <span>{t(item.key as any)}</span>
          </Link>
        ))}
      </nav>

      {/* User pill at bottom */}
      <div className="bf-sidebar-bottom">
        <div className="bf-user-pill">
          <div className={`bf-user-avatar${role === "business" ? " bf-user-avatar--biz" : ""}`}>
            {initial}
          </div>
          <div>
            <div className="bf-user-name">{displayName}</div>
            <div className="bf-user-role">
              {role === "admin" ? "Administrador" : role === "business" ? "Negocio verificado" : "Cliente particular"}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}