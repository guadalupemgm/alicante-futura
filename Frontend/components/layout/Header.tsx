"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/components/context/ThemeContext";
import { useLanguage, LANGUAGES } from "@/components/context/LanguageContext";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t }   = useLanguage();
  const [open, setOpen]        = useState(false);
  const [langOpen, setLangOpen] = useState(false);
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
        <h1 className="admin-header__title">BookFlow</h1>
        <p className="admin-header__subtitle">Plataforma de gestión de reservas y cobros</p>
      </div>

      <div className="admin-header__actions">
        <div className="avatar-menu" ref={menuRef}>

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
            <i className={`bi ${open ? "bi-chevron-up" : "bi-chevron-down"} user-pill__chevron`}></i>
          </button>

          {open && (
            <div className="avatar-menu__dropdown">

              <div className="avatar-menu__header">
                <div className="avatar-menu__header-avatar">V</div>
                <div>
                  <p className="avatar-menu__header-name">Vardab</p>
                  <p className="avatar-menu__header-email">admin@bookflow.com</p>
                </div>
              </div>

              <div className="avatar-menu__divider" />

              <div className="avatar-menu__item avatar-menu__item--toggle">
                <i className="bi bi-moon-stars-fill avatar-menu__item-icon"></i>
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
                  style={{ marginLeft: "auto", fontSize: 10, color: "var(--muted)" }}
                ></i>
              </div>

              {langOpen && (
                <div className="avatar-menu__submenu">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      className={`avatar-menu__item ${lang.code === l.code ? "avatar-menu__item--active" : ""}`}
                      onClick={() => {
                        setLang(l);
                        setLangOpen(false);
                        setOpen(false);
                      }}
                    >
                      <span className="avatar-menu__item-icon">{l.flag}</span>
                      <span>{l.label}</span>
                      {lang.code === l.code && <i className="bi bi-check-lg avatar-menu__check"></i>}
                    </button>
                  ))}
                </div>
              )}

              <div className="avatar-menu__divider" />

              <button className="avatar-menu__item avatar-menu__item--danger">
                <i className="bi bi-box-arrow-right avatar-menu__item-icon"></i>
                <span>{t("logout")}</span>
              </button>

            </div>
          )}
        </div>
      </div>
    </header>
  );
}