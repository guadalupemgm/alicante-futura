"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import { useLanguage, TranslationKey } from "@/components/context/LanguageContext";

const adminMenu: { key: TranslationKey; href: string; icon: string }[] = [
  { key: "dashboard", href: "/dashboard", icon: "bi-speedometer2" },
  { key: "bookings",  href: "/bookings",  icon: "bi-calendar2-check" },
  { key: "customers", href: "/customers", icon: "bi-people-fill" },
  { key: "payments",  href: "/payments",  icon: "bi-credit-card-2-front-fill" },
  { key: "business",  href: "/business",  icon: "bi-shop-window" },
];

const businessMenu: { key: TranslationKey; href: string; icon: string }[] = [
  { key: "bookings", href: "/business-bookings", icon: "bi-calendar2-check" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useLanguage();

  const isBusinessUser = user?.role === "business";
  const menuItems = isBusinessUser ? businessMenu : adminMenu;

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <h2 className="admin-sidebar__title">BookFlow</h2>
        <p className="admin-sidebar__subtitle">
          {isBusinessUser ? t("business") : t("adminWorkspace")}
        </p>
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
              <i
                className={`bi ${item.icon} admin-sidebar__icon`}
                aria-hidden="true"
              />
              <span>{t(item.key)}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}