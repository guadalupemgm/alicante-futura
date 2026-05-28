"use client";

import React, { useState, useEffect } from "react";
import { useLanguage, TranslationKey, LANGUAGES } from "@/components/context/LanguageContext";
import { useAuth } from "@/components/context/AuthContext";
import { useTheme } from "@/components/context/ThemeContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

/* ============================================================
   SECCIÓN: CUENTA (idioma + dark mode + contraseña + sesión)
   — igual que el cliente, disponible para admin y business
   ============================================================ */
function AccountSettings() {
  const { t, lang, setLang }           = useLanguage();
  const { theme, toggleTheme }         = useTheme();
  const { changePassword, logout }     = useAuth();

  const [pwForm, setPwForm]   = useState({ current: "", nueva: "", confirmar: "" });
  const [pwMsg, setPwMsg]     = useState<{ text: string; ok: boolean } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);
  const [twoFA, setTwoFA]     = useState(false);
  const [show2FA, setShow2FA] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.nueva !== pwForm.confirmar) {
      setPwMsg({ text: t("settingsPwMismatch" as TranslationKey), ok: false });
      return;
    }
    if (pwForm.nueva.length < 6) {
      setPwMsg({ text: t("settingsPwMinLen" as TranslationKey), ok: false });
      return;
    }
    setPwLoading(true);
    try {
      await changePassword(pwForm.current, pwForm.nueva);
      setPwMsg({ text: t("settingsPwUpdated" as TranslationKey), ok: true });
      setPwForm({ current: "", nueva: "", confirmar: "" });
    } catch {
      setPwMsg({ text: t("settingsPwError" as TranslationKey), ok: false });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Idioma */}
      <div className="section-card">
        <h3 className="panel-title" style={{ marginBottom: "1rem" }}>
          <i className="bi bi-translate" style={{ marginRight: 8 }} />
          {t("settingsLanguage" as TranslationKey)}
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

      {/* Apariencia */}
      <div className="section-card">
        <h3 className="panel-title" style={{ marginBottom: "1rem" }}>
          <i className="bi bi-moon-stars-fill" style={{ marginRight: 8 }} />
          {t("settingsAppearance" as TranslationKey)}
        </h3>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>{t("settingsDarkMode" as TranslationKey)}</span>
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
          {t("settingsPassword" as TranslationKey)}
        </h3>
        <form onSubmit={handleChangePassword}>
          <div className="page-stack">
            <div>
              <label className="kpi-card__label" style={{ fontSize: 11 }}>
                {t("settingsCurrentPw" as TranslationKey)}
              </label>
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
              <label className="kpi-card__label" style={{ fontSize: 11 }}>
                {t("settingsNewPw" as TranslationKey)}
              </label>
              <input
                className="input"
                type="password"
                placeholder={t("settingsNewPwMin" as TranslationKey)}
                value={pwForm.nueva}
                onChange={(e) => setPwForm({ ...pwForm, nueva: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="kpi-card__label" style={{ fontSize: 11 }}>
                {t("settingsConfirmPw" as TranslationKey)}
              </label>
              <input
                className="input"
                type="password"
                placeholder={t("settingsRepeatPw" as TranslationKey)}
                value={pwForm.confirmar}
                onChange={(e) => setPwForm({ ...pwForm, confirmar: e.target.value })}
                required
              />
            </div>
            {pwMsg && (
              <p style={{ fontSize: 13, margin: 0, color: pwMsg.ok ? "var(--success-text)" : "var(--danger-text)" }}>
                {pwMsg.text}
              </p>
            )}
            <div>
              <button type="submit" className="primary-btn" disabled={pwLoading}>
                {pwLoading
                  ? t("settingsSaving" as TranslationKey)
                  : t("settingsUpdatePw" as TranslationKey)}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 2FA */}
      <div className="section-card">
        <h3 className="panel-title" style={{ marginBottom: "0.5rem" }}>
          <i className="bi bi-shield-lock-fill" style={{ marginRight: 8 }} />
          {t("settings2FA" as TranslationKey)}
        </h3>
        <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: "1rem" }}>
          {t("settings2FADesc" as TranslationKey)}
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14 }}>
            {t("settings2FAStatus" as TranslationKey)}{" "}
            <strong style={{ color: twoFA ? "var(--success-text)" : "var(--muted)" }}>
              {twoFA ? t("settings2FAActive" as TranslationKey) : t("settings2FAInactive" as TranslationKey)}
            </strong>
          </span>
          <button
            className={twoFA ? "secondary-btn" : "primary-btn"}
            onClick={() => setShow2FA(true)}
          >
            {twoFA ? t("settings2FADisable" as TranslationKey) : t("settings2FAEnable" as TranslationKey)}
          </button>
        </div>
      </div>

      {/* Cerrar sesión */}
      <div className="section-card">
        <h3 className="panel-title" style={{ marginBottom: "0.5rem" }}>
          <i className="bi bi-box-arrow-right" style={{ marginRight: 8 }} />
          {t("settingsSession" as TranslationKey)}
        </h3>
        <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: "1rem" }}>
          {t("settingsSessionDesc" as TranslationKey)}
        </p>
        <button className="danger-btn" onClick={logout}>
          {t("settingsLogout" as TranslationKey)}
        </button>
      </div>

      {/* Modal 2FA */}
      {show2FA && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3 className="modal-title">
              {twoFA ? t("modal2FADisableTitle" as TranslationKey) : t("modal2FAEnableTitle" as TranslationKey)}{" "}
              {t("modal2FATitle" as TranslationKey)}
            </h3>
            <p className="modal-text">
              {twoFA ? t("modal2FADisableMsg" as TranslationKey) : t("modal2FAEnableMsg" as TranslationKey)}
            </p>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setShow2FA(false)}>
                {t("cancel")}
              </button>
              <button
                className={twoFA ? "danger-btn" : "primary-btn"}
                onClick={() => { setTwoFA(!twoFA); setShow2FA(false); }}
              >
                {twoFA ? t("modal2FAConfirmDisable" as TranslationKey) : t("modal2FAConfirmEnable" as TranslationKey)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   SECCIÓN: GESTIÓN DE USUARIOS (solo admin)
   ============================================================ */
function AdminConfig() {
  const { t, lang } = useLanguage();
  const { token, user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ email: "", password: "", role: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/users`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) setUsers(data.filter((u: any) => u.id !== user?.id));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token, user]);

  const handleDelete = async (id: number) => {
    if (!window.confirm(t("adminConfirmDelete" as TranslationKey))) return;
    await fetch(`${API_URL}/users/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    setUsers(users.filter(u => u.id !== id));
  };

  const handleEdit = (u: any) => {
    setEditingId(u.id);
    setEditForm({ email: u.email, password: "", role: u.role });
  };

  const handleSave = async (id: number) => {
    const payload: any = { email: editForm.email, role: editForm.role };
    if (editForm.password) payload.password = editForm.password;
    const res = await fetch(`${API_URL}/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    const updated = await res.json();
    setUsers(users.map(u => u.id === id ? updated : u));
    setEditingId(null);
  };

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(u.id).includes(searchQuery)
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (loading) return <div style={{ padding: "1rem", color: "var(--muted)" }}>Cargando usuarios...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <input
        type="text"
        className="input"
        placeholder="🔍 Buscar por email, rol o ID..."
        value={searchQuery}
        onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
        style={{ maxWidth: 320 }}
      />

      {filtered.length === 0 ? (
        <p style={{ color: "var(--muted)", padding: "1rem 0" }}>No se encontraron usuarios</p>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>{t("adminEmail" as TranslationKey)}</th>
                <th>Rol</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  {editingId === u.id ? (
                    <>
                      <td>
                        <div style={{ display: "flex", gap: 6, flexDirection: "column" }}>
                          <input className="input" value={editForm.email}
                            onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                          <input className="input" type="password" placeholder="Nueva contraseña"
                            value={editForm.password}
                            onChange={e => setEditForm({ ...editForm, password: e.target.value })} />
                        </div>
                      </td>
                      <td>
                        <select className="input" value={editForm.role}
                          onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                          style={{ padding: "0.4rem 0.5rem" }}>
                          <option value="admin">admin</option>
                          <option value="business">business</option>
                          <option value="customer">customer</option>
                        </select>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{u.email}</td>
                      <td><span className="badge badge--confirmed">{u.role}</span></td>
                    </>
                  )}
                  <td style={{ textAlign: "right" }}>
                    {editingId === u.id ? (
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button className="secondary-btn" onClick={() => setEditingId(null)}>Cancelar</button>
                        <button className="primary-btn" onClick={() => handleSave(u.id)}>Guardar</button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <button className="secondary-btn" onClick={() => handleEdit(u)}>Editar</button>
                        <button className="danger-btn" onClick={() => handleDelete(u.id)}>Eliminar</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center" }}>
              <button className="secondary-btn" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1} style={{ padding: "6px 14px" }}>Anterior</button>
              <span style={{ color: "var(--muted)", fontSize: 13 }}>Página {currentPage} de {totalPages}</span>
              <button className="secondary-btn" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages} style={{ padding: "6px 14px" }}>Siguiente</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ============================================================
   SECCIÓN: CONFIGURACIÓN DE NEGOCIO
   ============================================================ */
function BusinessConfig() {
  const { t } = useLanguage();
  const { user } = useAuth();

  interface Svc { name: string; price: number; }
  const [services, setServices] = useState<Svc[]>([]);
  const [newName, setNewName]   = useState("");
  const [newPrice, setNewPrice] = useState("");
  const storageKey = user?.businessId ? `bf_services_by_business_${user.businessId}` : null;

  useEffect(() => {
    if (!storageKey) return;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try { setServices(JSON.parse(saved)); } catch { setServices([]); }
    }
  }, [storageKey]);

  const addService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !storageKey) return;
    const price = parseFloat(newPrice);
    if (isNaN(price) || price <= 0) return;
    const updated = [...services, { name: newName.trim(), price }];
    setServices(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setNewName(""); setNewPrice("");
  };

  const removeService = (name: string) => {
    if (!storageKey) return;
    const updated = services.filter(s => s.name !== name);
    setServices(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Políticas */}
      <div className="section-card">
        <h4 style={{ marginBottom: 16, color: "var(--text)" }}>{t("configHoursAndBookings" as TranslationKey)}</h4>
        <div className="form-grid">
          <div>
            <label className="kpi-card__label" style={{ fontSize: 11 }}>{t("configDefaultDuration" as TranslationKey)}</label>
            <input type="number" className="input" defaultValue={30} min={5} step={5} />
          </div>
          <div>
            <label className="kpi-card__label" style={{ fontSize: 11 }}>{t("configMarginBetween" as TranslationKey)}</label>
            <input type="number" className="input" defaultValue={10} min={0} step={5} />
          </div>
          <div>
            <label className="kpi-card__label" style={{ fontSize: 11 }}>{t("configMinAdvance" as TranslationKey)}</label>
            <input type="number" className="input" defaultValue={24} min={1} />
          </div>
          <div>
            <label className="kpi-card__label" style={{ fontSize: 11 }}>{t("configMaxBookings" as TranslationKey)}</label>
            <input type="number" className="input" defaultValue={2} min={1} />
          </div>
        </div>
        <button className="primary-btn" style={{ marginTop: 16 }}>Guardar cambios</button>
      </div>

      {/* Servicios */}
      <div className="section-card">
        <h4 style={{ marginBottom: 12, color: "var(--text)" }}>Gestión de Servicios</h4>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16 }}>
          Define los servicios y precios que ofreces a tus clientes.
        </p>
        <form onSubmit={addService} style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          <input type="text" className="input" placeholder="Nombre del servicio"
            value={newName} onChange={e => setNewName(e.target.value)}
            style={{ flex: 2, minWidth: 140 }} required />
          <input type="number" className="input" placeholder="Precio €"
            value={newPrice} onChange={e => setNewPrice(e.target.value)}
            min="0.01" step="0.01" style={{ flex: 1, minWidth: 90 }} required />
          <button type="submit" className="primary-btn">Añadir</button>
        </form>
        {services.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--muted)", textAlign: "center", padding: "1.5rem",
            border: "1px dashed var(--border)", borderRadius: "var(--radius-md)" }}>
            No tienes servicios creados todavía.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {services.map(s => (
              <div key={s.name} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 14px", background: "var(--surface-2)",
                borderRadius: "var(--radius-md)", border: "1px solid var(--border)"
              }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{s.name}</span>
                  <span style={{ marginLeft: 12, fontSize: 13, color: "var(--accent)", fontWeight: 700 }}>
                    {s.price.toFixed(2)} €
                  </span>
                </div>
                <button onClick={() => removeService(s.name)}
                  style={{ background: "none", border: "none", color: "var(--danger-text)",
                    cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   COMPONENTE PRINCIPAL
   ============================================================ */
interface ConfigTabsProps {
  role: "admin" | "business" | "customer";
}

export default function ConfigTabs({ role }: ConfigTabsProps) {
  const { t } = useLanguage();

  const allTabs = [
    {
      key: "account",
      label: "Cuenta",
      icon: "bi-person-circle",
      roles: ["admin", "business", "customer"] as const,
      component: <AccountSettings />,
    },
    {
      key: "users",
      label: t("adminManageUsers" as TranslationKey),
      icon: "bi-people-fill",
      roles: ["admin"] as const,
      component: <AdminConfig />,
    },
    {
      key: "business",
      label: "Mi negocio",
      icon: "bi-shop-window",
      roles: ["business"] as const,
      component: <BusinessConfig />,
    },
  ];

  const tabs = allTabs.filter((tab) => (tab.roles as string[]).includes(role))
  const [active, setActive] = useState(tabs[0]?.key ?? "account");
  const activeComponent = tabs.find(t => t.key === active)?.component;

  return (
    <div>
      {/* Tab nav */}
      <nav style={{
        display: "flex", gap: 4, marginBottom: 24,
        borderBottom: "1px solid var(--border)", paddingBottom: 0,
      }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              background: "transparent", border: "none",
              padding: "10px 16px", cursor: "pointer",
              fontSize: 14, fontWeight: active === tab.key ? 600 : 400,
              color: active === tab.key ? "var(--text)" : "var(--muted)",
              borderBottom: active === tab.key ? "2px solid var(--accent)" : "2px solid transparent",
              transition: "all 0.15s",
            }}
          >
            <i className={`bi ${tab.icon}`} />
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div style={{ animation: "fadeIn 0.25s ease" }}>
        {activeComponent}
      </div>

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
