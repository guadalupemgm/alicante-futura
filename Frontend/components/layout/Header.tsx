"use client";

import { useTheme } from "@/components/context/ThemeContext";

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="admin-header">
      <div>
        <h1 className="admin-header__title">Bookings Admin</h1>
        <p className="admin-header__subtitle">
          Plataforma de gestión de reservas y cobros
        </p>
      </div>

      <div className="admin-header__actions">
        <button
          onClick={toggleTheme}
          className="theme-toggle"
          aria-label="Cambiar tema"
          title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
        <div className="admin-avatar">V</div>
      </div>
    </header>
  );
}