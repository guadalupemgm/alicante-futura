"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/components/context/ThemeContext";

const LANGUAGES = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState(LANGUAGES[0]);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="admin-header">
      <div>
        <h1 className="admin-header__title">Bookings Admin</h1>
        <p className="admin-header__subtitle">
          Plataforma de gestión de reservas y cobros
        </p>
      </div>

      <div className="admin-header__actions">
        <div className="avatar-menu" ref={menuRef}>

          {/* Trigger — pill con iniciales + nombre */}
          <button
            className="user-pill"
            onClick={() => { setOpen(!open); setLangOpen(false); }}
            aria-label="Menú de usuario"
          >
            <div className="user-pill__avatar">V</div>
            <div className="user-pill__info">
              <span className="user-pill__name">Vardab</span>
              <span className="user-pill__role">Admin</span>
            </div>
            <span className="user-pill__chevron">{open ? "▲" : "▼"}</span>
          </button>

          {open && (
            <div className="avatar-menu__dropdown">

              {/* Header del menú */}
              <div className="avatar-menu__header">
                <div className="avatar-menu__header-avatar">V</div>
                <div>
                  <p className="avatar-menu__header-name">Vardab</p>
                  <p className="avatar-menu__header-email">admin@bookflow.com</p>
                </div>
              </div>

              <div className="avatar-menu__divider" />

              {/* Dark mode */}
              <div className="avatar-menu__item avatar-menu__item--toggle">
                <span className="avatar-menu__item-icon">🌙</span>
                <span>Modo oscuro</span>
                <button
                  className={`toggle-switch ${theme === "dark" ? "toggle-switch--on" : ""}`}
                  onClick={toggleTheme}
                  aria-label="Cambiar tema"
                >
                  <span className="toggle-switch__knob" />
                </button>
              </div>

              {/* Language */}
              <div
                className="avatar-menu__item avatar-menu__item--toggle"
                onClick={() => setLangOpen(!langOpen)}
                style={{ cursor: "pointer" }}
              >
                <span className="avatar-menu__item-icon">{lang.flag}</span>
                <span>Cambiar idioma</span>
                <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--muted)" }}>
                  {langOpen ? "▲" : "▼"}
                </span>
              </div>

              {langOpen && (
                <div className="avatar-menu__submenu">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      className={`avatar-menu__item ${lang.code === l.code ? "avatar-menu__item--active" : ""}`}
                      onClick={() => { setLang(l); setLangOpen(false); }}
                    >
                      <span className="avatar-menu__item-icon">{l.flag}</span>
                      <span>{l.label}</span>
                      {lang.code === l.code && <span className="avatar-menu__check">✓</span>}
                    </button>
                  ))}
                </div>
              )}

              <div className="avatar-menu__divider" />

              {/* Logout */}
              <button className="avatar-menu__item avatar-menu__item--danger">
                <span className="avatar-menu__item-icon">🚪</span>
                <span>Cerrar sesión</span>
              </button>

            </div>
          )}
        </div>
      </div>
    </header>
  );
}