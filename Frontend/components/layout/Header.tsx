"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/components/context/ThemeContext";
import { useAuth } from "@/components/context/AuthContext";

const LANGUAGES = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, changePassword } = useAuth();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [lang, setLang] = useState(LANGUAGES[0]);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [newPwd, setNewPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
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

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "??";

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await changePassword(newPwd);
      setPwdMsg("Contraseña cambiada correctamente");
      setNewPwd("");
      setTimeout(() => { setPwdMsg(""); setShowPwdModal(false); }, 2000);
    } catch {
      setPwdMsg("Error al cambiar la contraseña");
    }
  };

  return (
    <>
      <header className="admin-header">
        <div>
          <h1 className="admin-header__title">Bookings Admin</h1>
          <p className="admin-header__subtitle">
            Plataforma de gestión de reservas y cobros
          </p>
        </div>

        <div className="admin-header__actions">
          <div className="avatar-menu" ref={menuRef}>
            <button
              className="user-pill"
              onClick={() => { setOpen(!open); setLangOpen(false); }}
              aria-label="Menú de usuario"
            >
              <div className="user-pill__avatar">{initials}</div>
              <div className="user-pill__info">
                <span className="user-pill__name">{user?.email?.split("@")[0] ?? "Usuario"}</span>
                <span className="user-pill__role">{user?.role === "admin" ? "Administrador" : "Negocio"}</span>
              </div>
              <span className="user-pill__chevron">{open ? "▲" : "▼"}</span>
            </button>

            {open && (
              <div className="avatar-menu__dropdown">

                <div className="avatar-menu__header">
                  <div className="avatar-menu__header-avatar">{initials}</div>
                  <div>
                    <p className="avatar-menu__header-name">{user?.email}</p>
                    <p className="avatar-menu__header-email">
                      {user?.role === "admin" ? "Administrador" : "Negocio"}
                    </p>
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

                {/* Change password */}
                <button
                  className="avatar-menu__item"
                  onClick={() => { setShowPwdModal(true); setOpen(false); }}
                >
                  <span className="avatar-menu__item-icon">🔑</span>
                  <span>Cambiar contraseña</span>
                </button>

                <div className="avatar-menu__divider" />

                {/* Logout */}
                <button className="avatar-menu__item avatar-menu__item--danger" onClick={logout}>
                  <span className="avatar-menu__item-icon">🚪</span>
                  <span>Cerrar sesión</span>
                </button>

              </div>
            )}
          </div>
        </div>
      </header>

      {/* Change password modal */}
      {showPwdModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3 className="modal-title">Cambiar contraseña</h3>
            <p className="modal-text">Introduce tu nueva contraseña.</p>
            <form onSubmit={handleChangePassword}>
              <input
                className="input"
                type="password"
                placeholder="Nueva contraseña"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                required
                minLength={6}
                style={{ marginBottom: 16 }}
              />
              {pwdMsg && (
                <p style={{ fontSize: 13, color: pwdMsg.includes("Error") ? "red" : "green", marginBottom: 12 }}>
                  {pwdMsg}
                </p>
              )}
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowPwdModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="primary-btn">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}