"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/context/LanguageContext";

export default function ParticularSidebar() {
  const pathname = usePathname();
  
  // GM: Bypass para saltarnos el diccionario estricto de TypeScript en las traducciones
  const { t: translate } = useLanguage();
  const t = translate as (key: string) => string;

  return (
    <aside className="bf-sidebar">
      {/* GM: Marca corporativa idéntica al diseño base de BookFlow */}
      <div className="bf-sidebar-brand">
        <div className="bf-sidebar-logo">
          <div className="bf-sidebar-mark">
            <Image src="/favicon.ico" width={28} height={28} alt="logo" />
          </div>
          <div>
            <div className="bf-sidebar-name">BookFlow</div>
            <div className="bf-sidebar-role" style={{ color: "var(--accent)" }}>
              Espacio Cliente
            </div>
          </div>
        </div>
      </div>

      {/* GM: Navegación del cliente usando las clases globales mapeadas en el CSS general */}
      <nav className="bf-sidebar-nav">
        <div className="bf-nav-label">Mis Servicios</div>

        {/* Opción 1: Buscar */}
        <Link
          href="/buscar"
          className={`bf-nav-item${pathname === "/buscar" ? " active" : ""}`}
        >
          <i className="bi bi-search" aria-hidden="true" />
          <span>{t("search") || "Buscar locales"}</span>
        </Link>

        {/* Opción 2: Mis Reservas */}
        <Link
          href="/mis-reservas"
          className={`bf-nav-item${pathname === "/mis-reservas" ? " active" : ""}`}
        >
          <i className="bi bi-calendar2-check" aria-hidden="true" />
          <span>{t("myBookings") || "Mis Reservas"}</span>
        </Link>

        {/* Opción 3: Perfil */}
        <div className="bf-nav-label" style={{ marginTop: 8 }}>Mi perfil</div>
        <Link
          href="/perfil"
          className={`bf-nav-item${pathname === "/perfil" ? " active" : ""}`}
        >
          <i className="bi bi-person-fill" aria-hidden="true" />
          <span>{t("profile") || "Mi Perfil"}</span>
        </Link>
      </nav>

    </aside>
  );
}