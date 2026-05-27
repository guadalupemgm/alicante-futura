"use client";

import { useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { useTheme } from "@/components/context/ThemeContext";
import { useLanguage, LANGUAGES } from "@/components/context/LanguageContext";

export default function SettingsPage() {
  const { user, logout, changePassword } = useAuth();
  const { theme, toggleTheme }           = useTheme();
  const { lang, setLang, t }             = useLanguage();

  const [pwForm, setPwForm]       = useState({ current: "", nueva: "", confirmar: "" });
  const [pwMsg, setPwMsg]         = useState<{ text: string; ok: boolean } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);
  const [twoFA, setTwoFA]         = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.nueva !== pwForm.confirmar) {
      setPwMsg({ text: t("settingsPwMismatch"), ok: false });
      return;
    }
    if (pwForm.nueva.length < 6) {
      setPwMsg({ text: t("settingsPwMinLen"), ok: false });
      return;
    }
    setPwLoading(true);
    try {
      await changePassword(pwForm.nueva);
      setPwMsg({ text: t("settingsPwUpdated"), ok: true });
      setPwForm({ current: "", nueva: "", confirmar: "" });
    } catch {
      setPwMsg({ text: t("settingsPwError"), ok: false });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="page-stack" style={{ maxWidth: 600, margin: "0 auto" }}>
      <section className="page-hero">
        <div>
          <h2>{t("settingsTitle")}</h2>
          <p>{t("settingsSubtitle")}</p>
        </div>
      </section>

      {/* Idioma */}
      <div className="section-card">
        <h3 className="panel-title" style={{ marginBottom: "1rem" }}>
          <i className="bi bi-translate" style={{ marginRight: 8 }} />
          {t("settingsLanguage")}
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
          {t("settingsAppearance")}
        </h3>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>{t("settingsDarkMode")}</span>
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
          {t("settingsPassword")}
        </h3>
        <form onSubmit={handleChangePassword}>
          <div className="page-stack">
            <div>
              <label className="kpi-card__label" style={{ fontSize: 11 }}>{t("settingsCurrentPw")}</label>
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
              <label className="kpi-card__label" style={{ fontSize: 11 }}>{t("settingsNewPw")}</label>
              <input
                className="input"
                type="password"
                placeholder={t("settingsNewPwMin")}
                value={pwForm.nueva}
                onChange={(e) => setPwForm({ ...pwForm, nueva: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="kpi-card__label" style={{ fontSize: 11 }}>{t("settingsConfirmPw")}</label>
              <input
                className="input"
                type="password"
                placeholder={t("settingsRepeatPw")}
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
                {pwLoading ? t("settingsSaving") : t("settingsUpdatePw")}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 2FA */}
      <div className="section-card">
        <h3 className="panel-title" style={{ marginBottom: "0.5rem" }}>
          <i className="bi bi-shield-lock-fill" style={{ marginRight: 8 }} />
          {t("settings2FA")}
        </h3>
        <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: "1rem" }}>
          {t("settings2FADesc")}
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14 }}>
            {t("settings2FAStatus")} <strong style={{ color: twoFA ? "#15803d" : "var(--muted)" }}>
              {twoFA ? t("settings2FAActive") : t("settings2FAInactive")}
            </strong>
          </span>
          <button
            className={twoFA ? "secondary-btn" : "primary-btn"}
            onClick={() => setShow2FAModal(true)}
          >
            {twoFA ? t("settings2FADisable") : t("settings2FAEnable")}
          </button>
        </div>
      </div>

      {/* Cerrar sesión */}
      <div className="section-card">
        <h3 className="panel-title" style={{ marginBottom: "0.5rem" }}>
          <i className="bi bi-box-arrow-right" style={{ marginRight: 8 }} />
          {t("settingsSession")}
        </h3>
        <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: "1rem" }}>
          {t("settingsSessionDesc")}
        </p>
        <button className="danger-btn" onClick={logout}>
          {t("settingsLogout")}
        </button>
      </div>

      {/* Modal 2FA */}
      {show2FAModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3 className="modal-title">
              {twoFA ? t("modal2FADisableTitle") : t("modal2FAEnableTitle")} {t("modal2FATitle")}
            </h3>
            <p className="modal-text">
              {twoFA ? t("modal2FADisableMsg") : t("modal2FAEnableMsg")}
            </p>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setShow2FAModal(false)}>
                {t("cancel")}
              </button>
              <button
                className={twoFA ? "danger-btn" : "primary-btn"}
                onClick={() => { setTwoFA(!twoFA); setShow2FAModal(false); }}
              >
                {twoFA ? t("modal2FAConfirmDisable") : t("modal2FAConfirmEnable")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
