"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/components/context/LanguageContext";

export default function SidebarCliente() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const clienteMenu = [
    { labelKey: "myBookings"   as const, href: "/reservas", icon: "bi-calendar2-check" },
    { labelKey: "myBusinesses" as const, href: "/empresas", icon: "bi-shop-window" },
  ];

  return (
    <aside className="bf-sidebar">
      <div className="bf-sidebar-brand">
        <div className="bf-sidebar-logo">
          <div className="bf-sidebar-mark">
            <Image src="/favicon.ico" width={28} height={28} alt="logo" />
          </div>
          <div>
            <div className="bf-sidebar-name">BookFlow</div>
            <div className="bf-sidebar-role">{t("bookingPortal")}</div>
          </div>
        </div>
      </div>

      <nav className="bf-sidebar-nav">
        <div className="bf-nav-label">{t("mySpace")}</div>
        {clienteMenu.map((item) => {
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
          <span>{t("configTitle")}</span>
        </Link>
      </nav>
    </aside>
  );
}

