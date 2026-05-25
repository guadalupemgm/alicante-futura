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

const INITIAL_NOTIFICATIONS: Notification[] = [];

export default function Header() {
  const { theme, toggleTheme }        = useTheme();
  const { lang, setLang, t }          = useLanguage();
  const { logout, user }              = useAuth();
  const [open, setOpen]               = useState(false);
  const [langOpen, setLangOpen]       = useState(false);
  const [notifOpen, setNotifOpen]     = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const menuRef                       = useRef<HTMLDivElement>(null);
  const notifRef                      = useRef<HTMLDivElement>(null);

  const unread = notifications.filter(n => !n.read).length;

  const displayName = user?.email?.split("@")[0] ?? "Usuario";
  const initial     = displayName[0]?.toUpperCase() ?? "U";
  const roleLabel   = user?.role === "business" ? "Negocio" : user?.role === "customer" ? "Cliente" : "Admin";

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

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const markOneRead = (id: number) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const deleteOne = (id: number) =>
    setNotifications(prev => prev.filter(n => n.id !== id));

  return (
    <header className="admin-header">
      <div>
        <h1 className="admin-header__title">BookFlow</h1>
        <p className="admin-header__subtitle">{t("headerSubtitle")}</p>
      </div>

      <div className="admin-header__actions">
        {/* Search */}
        <div className="bf-topbar-search">
          <i className="bi bi-search" style={{ fontSize: 13 }} />
          <span>Buscar...</span>
        </div>

        {/* Notifications */}
        <div style={{ position: "relative" }} ref={notifRef}>
          <button
            className="bf-badge-btn"
            aria-label="Notificaciones"
            onClick={() => { setNotifOpen(v => !v); setOpen(false); }}
          >
            <i className="bi bi-bell-fill" style={{ fontSize: 16 }} />
            {unread > 0 && <div className="bf-notif-dot" />}
          </button>

          {notifOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 10px)", right: 0,
              width: 300, background: "var(--paper)", border: "1px solid var(--line)",
              borderRadius: "var(--r-lg)", boxShadow: "0 8px 30px rgba(14,14,16,.12)",
              padding: 8, zIndex: 500,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px 10px" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
                  Notificaciones {unread > 0 && (
                    <span style={{ marginLeft: 6, background: "var(--accent)", color: "#fff", borderRadius: 20, fontSize: 10, fontWeight: 700, padding: "1px 7px" }}>
                      {unread}
                    </span>
                  )}
                </span>
                {unread > 0 && (
                  <button onClick={markAllRead} style={{ fontSize: 11, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                    Marcar todas leídas
                  </button>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 340, overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 0", color: "var(--ink-3)", fontSize: 13 }}>
                    <i className="bi bi-bell-slash" style={{ fontSize: 24, display: "block", marginBottom: 8 }} />
                    Sin notificaciones
                  </div>
                ) : notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => markOneRead(n.id)}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                      padding: "8px 10px", borderRadius: "var(--r)", cursor: "pointer",
                      background: n.read ? "transparent" : "var(--paper-2)",
                      transition: "background .12s",
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                      background: "var(--paper-3)", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <i className={`bi ${n.icon}`} style={{ fontSize: 14, color: "var(--accent)" }} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: n.read ? 400 : 600, color: "var(--ink)", display: "flex", alignItems: "center", gap: 5 }}>
                        {n.title}
                        {!n.read && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", flexShrink: 0, display: "inline-block" }} />}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {n.desc}
                      </div>
                      <div style={{ fontSize: 10.5, color: "var(--ink-3)", marginTop: 3 }}>{n.time}</div>
                    </div>

                    <button
                      onClick={e => { e.stopPropagation(); deleteOne(n.id); }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-3)", padding: "2px 4px", flexShrink: 0, fontSize: 12 }}
                      aria-label="Eliminar notificación"
                    >
                      <i className="bi bi-x-lg" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar menu */}
        <div className="avatar-menu" ref={menuRef}>
          <button
            className="user-pill"
            onClick={() => { setOpen(!open); setLangOpen(false); setNotifOpen(false); }}
            aria-label="Menú de usuario"
          >
            <div className="user-pill__avatar">{initial}</div>
            <div className="user-pill__info">
              <span className="user-pill__name">{displayName}</span>
              <span className="user-pill__role">{roleLabel}</span>
            </div>
            <i className={`bi ${open ? "bi-chevron-up" : "bi-chevron-down"} user-pill__chevron`} />
          </button>

          {open && (
            <div className="avatar-menu__dropdown">
              <div className="avatar-menu__header">
                <div className="avatar-menu__header-avatar">{initial}</div>
                <div>
                  <p className="avatar-menu__header-name">{displayName}</p>
                  <p className="avatar-menu__header-email">{user?.email ?? ""}</p>
                </div>
              </div>

              <div className="avatar-menu__divider" />

              <div className="avatar-menu__item avatar-menu__item--toggle">
                <i className="bi bi-moon-stars-fill avatar-menu__item-icon" />
                <span>{t("darkMode")}</span>
                <button
                  className={`toggle-switch ${theme === "dark" ? "toggle-switch--on" : ""}`}
                  onClick={toggleTheme}
                  aria-label="Cambiar tema"
                >
                  <span className="toggle-switch__knob" />
                </button>
              </div>

              <div
                className="avatar-menu__item avatar-menu__item--toggle"
                onClick={() => setLangOpen(!langOpen)}
                style={{ cursor: "pointer" }}
              >
                <span className="avatar-menu__item-icon">{lang.flag}</span>
                <span>{t("changeLanguage")}</span>
                <i
                  className={`bi ${langOpen ? "bi-chevron-up" : "bi-chevron-down"}`}
                  style={{ marginLeft: "auto", fontSize: 10, color: "var(--ink-3)" }}
                />
              </div>

              {langOpen && (
                <div className="avatar-menu__submenu">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      className={`avatar-menu__item ${lang.code === l.code ? "avatar-menu__item--active" : ""}`}
                      onClick={() => { setLang(l); setLangOpen(false); setOpen(false); }}
                    >
                      <span className="avatar-menu__item-icon">{l.flag}</span>
                      <span>{l.label}</span>
                      {lang.code === l.code && <i className="bi bi-check-lg avatar-menu__check" />}
                    </button>
                  ))}
                </div>
              )}

              <div className="avatar-menu__divider" />

              <button className="avatar-menu__item avatar-menu__item--danger" onClick={logout}>
                <i className="bi bi-box-arrow-right avatar-menu__item-icon" />
                <span>{t("logout")}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}