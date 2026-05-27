"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/components/context/ThemeContext";
import { useLanguage, LANGUAGES } from "@/components/context/LanguageContext";
import { useAuth } from "@/components/context/AuthContext";

interface Notification {
  id: number;
  icon: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function Header({ role = "particular" }: { role?: "admin" | "particular" | "business" }) {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const { logout, user, token } = useAuth();
  
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toast, setToast] = useState<{ title: string; desc: string } | null>(null);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unread = notifications.filter(n => !n.read).length;
  const displayName = user?.email?.split("@")[0] ?? "Usuario";
  const initial = displayName[0]?.toUpperCase() ?? "U";

  // Carga inicial y lógica de efectos (Manteniendo toda tu estructura)
  useEffect(() => {
    if (typeof window !== "undefined" && user) {
      const saved = localStorage.getItem(`bf_notifications_${user.id}`);
      if (saved) setNotifications(JSON.parse(saved));
    }
  }, [user]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setLangOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markOneRead = (id: number) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteOne = (id: number) => setNotifications(prev => prev.filter(n => n.id !== id));

  return (
    <header className="admin-header">
      <div>
        <h2 className="admin-header__title">
          {role === "particular" ? "Panel de Usuario" : "BookFlow"}
        </h2>
        <p className="admin-header__subtitle">
          {role === "particular" ? "Gestiona tus citas y reserva en tus locales favoritos" : t("headerSubtitle")}
        </p>
      </div>

      <div className="admin-header__actions">
        {/* Notificaciones */}
        <div style={{ position: "relative" }} ref={notifRef}>
          <button className="bf-badge-btn" aria-label="Notificaciones" onClick={() => { setNotifOpen(!notifOpen); setOpen(false); }}>
            <i className="bi bi-bell-fill" style={{ fontSize: 16 }} />
            {unread > 0 && <div className="bf-notif-dot" />}
          </button>

          {notifOpen && (
            <div className="avatar-menu__dropdown" style={{ width: 300, padding: 8, right: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 8px" }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Notificaciones ({unread})</span>
                {unread > 0 && <button onClick={markAllRead} style={{ fontSize: 11, color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}>Marcar todas leídas</button>}
              </div>
              <div style={{ maxHeight: 340, overflowY: "auto" }}>
                {notifications.map(n => (
                  <div key={n.id} onClick={() => markOneRead(n.id)} className={`avatar-menu__item ${n.read ? "" : "active"}`}>
                    <i className={`bi ${n.icon}`} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{n.title}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-3)" }}>{n.desc}</div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); deleteOne(n.id); }}><i className="bi bi-x-lg" /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar Menu Completo */}
        <div className="avatar-menu" ref={menuRef}>
          <button className="user-pill" onClick={() => { setOpen(!open); setLangOpen(false); setNotifOpen(false); }}>
            <div className="user-pill__avatar">{initial}</div>
            <div className="user-pill__info">
              <span className="user-pill__name">{displayName}</span>
              <span className="user-pill__role">{role === "particular" ? "Particular" : "Admin"}</span>
            </div>
            <i className={`bi ${open ? "bi-chevron-up" : "bi-chevron-down"} user-pill__chevron`} />
          </button>

          {open && (
            <div className="avatar-menu__dropdown">
              <div className="avatar-menu__header">
                <div className="avatar-menu__header-avatar">{initial}</div>
                <div>
                  <p className="avatar-menu__header-name">{displayName}</p>
                  <p className="avatar-menu__header-email">{user?.email}</p>
                </div>
              </div>
              <div className="avatar-menu__divider" />
              
              <div className="avatar-menu__item avatar-menu__item--toggle">
                <i className="bi bi-moon-stars-fill" />
                <span>{t("darkMode")}</span>
                <button className={`toggle-switch ${theme === "dark" ? "toggle-switch--on" : ""}`} onClick={toggleTheme}>
                  <span className="toggle-switch__knob" />
                </button>
              </div>

              <div className="avatar-menu__item" onClick={() => setLangOpen(!langOpen)}>
                <span>{lang.flag} {t("changeLanguage")}</span>
                <i className={`bi ${langOpen ? "bi-chevron-up" : "bi-chevron-down"}`} />
              </div>

              {langOpen && (
                <div className="avatar-menu__submenu">
                  {LANGUAGES.map((l) => (
                    <button key={l.code} className="avatar-menu__item" onClick={() => { setLang(l); setOpen(false); }}>
                      {l.flag} {l.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="avatar-menu__divider" />
              <button className="avatar-menu__item avatar-menu__item--danger" onClick={logout}>
                <i className="bi bi-box-arrow-right" /> {t("logout")}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}