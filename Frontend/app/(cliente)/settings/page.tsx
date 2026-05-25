"use client";

import { useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { useTheme } from "@/components/context/ThemeContext";
import { useLanguage, LANGUAGES } from "@/components/context/LanguageContext";

export default function SettingsPage() {
  const { user, logout, changePassword } = useAuth();
  const { theme, toggleTheme }           = useTheme();
  const { lang, setLang }                = useLanguage();

  // Cambiar contraseña
  const [pwForm, setPwForm]   = useState({ current: "", nueva: "", confirmar: "" });
  const [pwMsg, setPwMsg]     = useState<{ text: string; ok: boolean } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  // 2FA (simulado — visual only)
  const [twoFA, setTwoFA]     = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.nueva !== pwForm.confirmar) {
      setPwMsg({ text: "Las contraseñas no coinciden.", ok: false });
      return;
    }
    if (pwForm.nueva.length < 6) {
      setPwMsg({ text: "Mínimo 6 caracteres.", ok: false });
      return;
    }
    setPwLoading(true);
    try {
      await changePassword(pwForm.nueva);
      setPwMsg({ text: "Contraseña actualizada correctamente.", ok: true });
      setPwForm({ current: "", nueva: "", confirmar: "" });
    } catch {
      setPwMsg({ text: "Error al cambiar la contraseña.", ok: false });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="page-stack" style={{ maxWidth: 600, margin: "0 auto" }}>
      <section className="page-hero">
        <div>
          <h2>Ajustes</h2>
          <p>Gestiona tu cuenta y preferencias.</p>
        </div>
      </section>

      {/* Idioma */}
      <div className="section-card">
        <h3 className="panel-title" style={{ marginBottom: "1rem" }}>
          <i className="bi bi-translate" style={{ marginRight: 8 }} />
          Idioma
        </h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l)}
              className={lang.code === l.code ? "primary-btn" : "secondary-btn"}
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
              {lang.code === l.code && <i className="bi bi-check-lg" />}
            </button>
          ))}
        </div>
      </div>

      {/* Tema */}
      <div className="section-card">
        <h3 className="panel-title" style={{ marginBottom: "1rem" }}>
          <i className="bi bi-moon-stars-fill" style={{ marginRight: 8 }} />
          Apariencia
        </h3>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>Modo oscuro</span>
          <button
            className={`toggle-switch ${theme === "dark" ? "toggle-switch--on" : ""}`}
            onClick={toggleTheme}
          >
            <span className="toggle-switch__knob" />
          </button>
        </div>
      </div>

      {/* Cambiar contraseña */}
      <div className="section-card">
        <h3 className="panel-title" style={{ marginBottom: "1rem" }}>
          <i className="bi bi-lock-fill" style={{ marginRight: 8 }} />
          Cambiar contraseña
        </h3>
        <form onSubmit={handleChangePassword}>
          <div className="page-stack">
            <div>
              <label className="kpi-card__label" style={{ fontSize: 11 }}>Contraseña actual</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={pwForm.current}
                onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="kpi-card__label" style={{ fontSize: 11 }}>Nueva contraseña</label>
              <input
                className="input"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={pwForm.nueva}
                onChange={(e) => setPwForm({ ...pwForm, nueva: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="kpi-card__label" style={{ fontSize: 11 }}>Confirmar nueva contraseña</label>
              <input
                className="input"
                type="password"
                placeholder="Repite la contraseña"
                value={pwForm.confirmar}
                onChange={(e) => setPwForm({ ...pwForm, confirmar: e.target.value })}
                required
              />
            </div>
            {pwMsg && (
              <p style={{ fontSize: 13, margin: 0, color: pwMsg.ok ? "#15803d" : "#b91c1c" }}>
                {pwMsg.text}
              </p>
            )}
            <div>
              <button type="submit" className="primary-btn" disabled={pwLoading}>
                {pwLoading ? "Guardando..." : "Actualizar contraseña"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Autenticación de dos pasos */}
      <div className="section-card">
        <h3 className="panel-title" style={{ marginBottom: "0.5rem" }}>
          <i className="bi bi-shield-lock-fill" style={{ marginRight: 8 }} />
          Autenticación en dos pasos
        </h3>
        <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: "1rem" }}>
          Añade una capa extra de seguridad a tu cuenta. Recibirás un código cada vez que inicies sesión.
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14 }}>
            Estado: <strong style={{ color: twoFA ? "#15803d" : "var(--muted)" }}>{twoFA ? "Activada" : "Desactivada"}</strong>
          </span>
          <button
            className={twoFA ? "secondary-btn" : "primary-btn"}
            onClick={() => setShow2FAModal(true)}
          >
            {twoFA ? "Desactivar" : "Activar 2FA"}
          </button>
        </div>
      </div>

      {/* Cerrar sesión */}
      <div className="section-card">
        <h3 className="panel-title" style={{ marginBottom: "0.5rem" }}>
          <i className="bi bi-box-arrow-right" style={{ marginRight: 8 }} />
          Sesión
        </h3>
        <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: "1rem" }}>
          Cierra tu sesión en este dispositivo.
        </p>
        <button className="danger-btn" onClick={logout}>
          Cerrar sesión
        </button>
      </div>

      {/* Modal 2FA */}
      {show2FAModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3 className="modal-title">
              {twoFA ? "Desactivar" : "Activar"} autenticación en dos pasos
            </h3>
            <p className="modal-text">
              {twoFA
                ? "¿Seguro que quieres desactivar la autenticación en dos pasos? Tu cuenta será menos segura."
                : "Al activar 2FA, recibirás un código por email cada vez que inicies sesión. ¿Continuar?"}
            </p>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setShow2FAModal(false)}>
                Cancelar
              </button>
              <button
                className={twoFA ? "danger-btn" : "primary-btn"}
                onClick={() => { setTwoFA(!twoFA); setShow2FAModal(false); }}
              >
                {twoFA ? "Sí, desactivar" : "Sí, activar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}