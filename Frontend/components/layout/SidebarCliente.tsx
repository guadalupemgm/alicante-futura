"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import { useLanguage } from "@/components/context/LanguageContext";

export default function SidebarCliente() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const clienteMenu = [
    { labelKey: "myBusinesses" as const, href: "/empresas",  icon: "bi-shop-window" },
    { labelKey: "myBookings"   as const, href: "/reservas",  icon: "bi-calendar2-check" },
  ];

  const initial     = (user?.email?.[0] ?? "U").toUpperCase();
  const displayName = user?.email?.split("@")[0] ?? "Usuario";

  return (
    <aside className="bf-sidebar">
      <div className="bf-sidebar-brand">
        <div className="bf-sidebar-logo">
          <div className="bf-sidebar-mark">B</div>
          <div>
            <div className="bf-sidebar-name">BookFlow</div>
            <div className="bf-sidebar-role">{t("bookingPortal")}</div>
          </div>
        </div>
      </div>

      <nav className="bf-sidebar-nav">
        <div className="bf-nav-label">{t("mySpace")}</div>
        {clienteMenu.map((item) => {
          // Exact match para /reservas para evitar que active también /reservas/nueva
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`bf-nav-item${active ? " active" : ""}`}
            >
              <i className={`bi ${item.icon}`} aria-hidden="true" />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}

        <div className="bf-nav-label" style={{ marginTop: 8 }}>{t("account")}</div>
        <Link
          href="/settings"
          className={`bf-nav-item${pathname === "/settings" ? " active" : ""}`}
        >
          <i className="bi bi-gear-fill" aria-hidden="true" />
          <span>{t("settings")}</span>
        </Link>
      </nav>

      <div className="bf-sidebar-bottom">
        <div className="bf-user-pill">
          <div className="bf-user-avatar">{initial}</div>
          <div>
            <div className="bf-user-name">{displayName}</div>
            <div className="bf-user-role">{t("clientRole")}</div>
          </div>
        </div>
        <button
          className="bf-nav-item"
          style={{ width: "100%", marginTop: 8, background: "none", border: "none", cursor: "pointer", color: "#ef4444", textAlign: "left" }}
          onClick={logout}
        >
          <i className="bi bi-box-arrow-right" aria-hidden="true" />
          <span>{t("logout")}</span>
        </button>
      </div>
    </aside>
  );
}
