"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import { useLanguage, TranslationKey } from "@/components/context/LanguageContext";

// Mantenemos tu menú de admin intacto tal cual lo tenías
const adminMenu: { key: TranslationKey; href: string; icon: string }[] = [
  { key: "dashboard",  href: "/dashboard",  icon: "bi-speedometer2" },
  { key: "bookings",   href: "/bookings",   icon: "bi-calendar2-check" },
  { key: "customers",  href: "/customers",  icon: "bi-people-fill" },
  { key: "payments",   href: "/payments",   icon: "bi-credit-card-2-front-fill" },
  { key: "business",   href: "/business",   icon: "bi-shop-window" },
];

// Menú de negocio actualizado con tus nuevas rutas
const businessMenu: { key: TranslationKey; href: string; icon: string }[] = [
  { key: "dashboard" as TranslationKey, href: "/dashboard",                icon: "bi-bar-chart-line-fill" }, // 📊 Panel General
  { key: "bookings" as TranslationKey,  href: "/dashboard/agenda",         icon: "bi-calendar2-check" },     // 📅 Agenda de Citas
  { key: "services" as TranslationKey,  href: "/dashboard/servicios",      icon: "bi-tools" },               // 🛠️ Mis Servicios
  { key: "business" as TranslationKey,  href: "/dashboard/config-empresa", icon: "bi-briefcase-fill" },      // 💼 Datos de Empresa
];

// Menú nuevo para el Cliente Particular
const particularMenu: { key: TranslationKey; href: string; icon: string }[] = [
  { key: "dashboard" as TranslationKey, href: "/dashboard",        icon: "bi-search" },             // 🔍 Buscar Servicio
  { key: "bookings" as TranslationKey,  href: "/dashboard/citas",  icon: "bi-calendar-event" },     // 📅 Mis Citas
  { key: "customers" as TranslationKey, href: "/dashboard/perfil", icon: "bi-person-circle" },      // 👤 Mi Perfil
];

export default function Sidebar() {
  const pathname       = usePathname();
  const { user }        = useAuth();
  const { t }           = useLanguage();
  
  const isBusinessUser  = user?.role === "business";
  const isParticularUser = user?.role === "particular";

  // Selección de ítems base para renderizar
  const menuItems = isParticularUser 
    ? particularMenu 
    : isBusinessUser 
      ? businessMenu 
      : adminMenu;

  const initial         = (user?.email?.[0] ?? "U").toUpperCase();
  const displayName     = user?.email?.split("@")[0] ?? "Usuario";

  return (
    <aside className="bf-sidebar">
      {/* Brand */}
      <div className="bf-sidebar-brand">
        <div className="bf-sidebar-logo">
          <div className="bf-sidebar-mark">B</div>
          <div>
            <div className="bf-sidebar-name">BookFlow</div>
            <div className="bf-sidebar-role">
              {isParticularUser ? "Zona Cliente" : isBusinessUser ? t("business") : t("adminWorkspace")}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="bf-sidebar-nav">
        {isParticularUser ? (
          /* ==========================================
             VISTA CLIENTE PARTICULAR
             ========================================== */
          <>
            <div className="bf-nav-label">Panel de Usuario</div>
            {particularMenu.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`bf-nav-item${active ? " active" : ""}`}
                >
                  <i className={`bi ${item.icon}`} aria-hidden="true" />
                  <span>
                    {item.href === "/dashboard" && "Buscar Servicio"}
                    {item.href === "/dashboard/citas" && "Mis Citas"}
                    {item.href === "/dashboard/perfil" && "Mi Perfil"}
                  </span>
                </Link>
              );
            })}
            <div className="bf-nav-label" style={{ marginTop: 8 }}>Sistema</div>
            <Link
              href="/configuracion"
              className={`bf-nav-item${pathname === "/configuracion" ? " active" : ""}`}
            >
              <i className="bi bi-gear-fill" aria-hidden="true" />
              <span>Configuración</span>
            </Link>
          </>
        ) : isBusinessUser ? (
          /* ==========================================
             VISTA NEGOCIO (BUSINESS)
             ========================================== */
          <>
            <div className="bf-nav-label">Mi negocio</div>
            {businessMenu.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`bf-nav-item${active ? " active" : ""}`}
                >
                  <i className={`bi ${item.icon}`} aria-hidden="true" />
                  <span>
                    {item.href === "/dashboard" && "Panel General"}
                    {item.href === "/dashboard/agenda" && "Agenda de Citas"}
                    {item.href === "/dashboard/servicios" && "Mis Servicios"}
                    {item.href === "/dashboard/config-empresa" && "Datos de Empresa"}
                  </span>
                </Link>
              );
            })}
            <div className="bf-nav-label" style={{ marginTop: 8 }}>Sistema</div>
            <Link
              href="/configuracion"
              className={`bf-nav-item${pathname === "/configuracion" ? " active" : ""}`}
            >
              <i className="bi bi-gear-fill" aria-hidden="true" />
              <span>Configuración</span>
            </Link>
          </>
        ) : (
          /* ==========================================
             VISTA ADMINISTRADOR ORIGINAL (CON TUS SLICES)
             ========================================== */
          <>
            <div className="bf-nav-label">Gestión</div>
            {adminMenu.slice(0, 4).map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`bf-nav-item${active ? " active" : ""}`}
                >
                  <i className={`bi ${item.icon}`} aria-hidden="true" />
                  <span>{t(item.key)}</span>
                </Link>
              );
            })}
            <div className="bf-nav-label" style={{ marginTop: 8 }}>Sistema</div>
            {adminMenu.slice(4).map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`bf-nav-item${active ? " active" : ""}`}
                >
                  <i className={`bi ${item.icon}`} aria-hidden="true" />
                  <span>{t(item.key)}</span>
                </Link>
              );
            })}
            <Link
              href="/configuracion"
              className={`bf-nav-item${pathname === "/configuracion" ? " active" : ""}`}
            >
              <i className="bi bi-gear-fill" aria-hidden="true" />
              <span>Configuración</span>
            </Link>
          </>
        )}
      </nav>

      {/* User pill at bottom */}
      <div className="bf-sidebar-bottom">
        <div className="bf-user-pill">
          <div className={`bf-user-avatar${isBusinessUser ? " bf-user-avatar--biz" : isParticularUser ? " bf-user-avatar--particular" : ""}`}>
            {initial}
          </div>
          <div>
            <div className="bf-user-name">{displayName}</div>
            <div className="bf-user-role">
              {isParticularUser ? "Particular" : isBusinessUser ? "Negocio verificado" : "Administrador"}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}