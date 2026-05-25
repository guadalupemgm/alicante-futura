"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";

const clienteMenu = [
  { label: "Empresas",     href: "/empresas", icon: "bi-shop-window" },
  { label: "Mis Reservas", href: "/reservas", icon: "bi-calendar2-check" },
];

export default function SidebarCliente() {
  const pathname = usePathname();
  const { user } = useAuth();

  const initial     = (user?.email?.[0] ?? "U").toUpperCase();
  const displayName = user?.email?.split("@")[0] ?? "Usuario";

  return (
    <aside className="bf-sidebar">
      <div className="bf-sidebar-brand">
        <div className="bf-sidebar-logo">
          <div className="bf-sidebar-mark">B</div>
          <div>
            <div className="bf-sidebar-name">BookFlow</div>
            <div className="bf-sidebar-role">Portal de reservas</div>
          </div>
        </div>
      </div>

      <nav className="bf-sidebar-nav">
        <div className="bf-nav-label">Mi espacio</div>
        {clienteMenu.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`bf-nav-item${active ? " active" : ""}`}
            >
              <i className={`bi ${item.icon}`} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="bf-sidebar-bottom">
        <div className="bf-user-pill">
          <div className="bf-user-avatar">{initial}</div>
          <div>
            <div className="bf-user-name">{displayName}</div>
            <div className="bf-user-role">Cliente</div>
          </div>
        </div>
      </div>
    </aside>
  );
}