"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage, TranslationKey } from "@/components/context/LanguageContext";

const menuItems: { key: TranslationKey; href: string; icon: string }[] = [
  { key: "dashboard", href: "/dashboard", icon: "bi-speedometer2" },
  { key: "bookings",  href: "/bookings",  icon: "bi-calendar-check" },
  { key: "customers", href: "/customers", icon: "bi-people" },
  { key: "payments",  href: "/payments",  icon: "bi-credit-card" },
  { key: "business",  href: "/business",  icon: "bi-shop" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <h2 className="admin-sidebar__title">BookFlow</h2>
        <p className="admin-sidebar__subtitle">{t("adminWorkspace")}</p>
      </div>

      <nav className="admin-sidebar__nav">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-sidebar__link ${isActive ? "admin-sidebar__link--active" : ""}`}
            >
              <i className={`bi ${item.icon}`} style={{ fontSize: "1.1rem" }}></i>
              <span>{t(item.key)}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}