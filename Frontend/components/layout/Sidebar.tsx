"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: "bi-speedometer2" },
  { label: "Bookings", href: "/bookings", icon: "bi-calendar2-check" },
  { label: "Customers", href: "/customers", icon: "bi-people-fill" },
  { label: "Payments", href: "/payments", icon: "bi-credit-card-2-front-fill" },
  { label: "Business", href: "/business", icon: "bi-shop-window" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <h2 className="admin-sidebar__title">BookFlow</h2>
        <p className="admin-sidebar__subtitle">Admin workspace</p>
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
              <i className={`bi ${item.icon} admin-sidebar__icon`} aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}