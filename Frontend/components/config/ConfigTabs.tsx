import React, { useState, useEffect } from "react";
import { useLanguage, TranslationKey } from "@/components/context/LanguageContext";
import { useAuth } from "@/components/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function SaveButton() {
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
  };

  return (
    <button className="primary-btn" style={{ marginTop: "1rem" }} onClick={handleSave} disabled={saving}>
      {saving ? (t("settingsSaving") as string) : saved ? (t("configSavedText" as TranslationKey) as string) : (t("saveChanges" as TranslationKey) as string)}
    </button>
  );
}

function AdminConfig() {
  const { t } = useLanguage();
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
    fetch(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Error fetching users");
        return res.json();
      })
      .then(data => {
        // filter out current user
        if (Array.isArray(data)) {
          setUsers(data.filter((u: any) => u.id !== user?.id));
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading users:", err);
        setLoading(false);
      });
  }, [token, user]);

  const handleDelete = async (id: number) => {
    if (window.confirm(t("adminConfirmDelete" as TranslationKey) as string)) {
      await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(users.filter(u => u.id !== id));
    }
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
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const updated = await res.json();
    setUsers(users.map(u => u.id === id ? updated : u));
    setEditingId(null);
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.role?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    String(u.id).includes(searchQuery)
  );

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (loading) return <div style={{ padding: "1rem" }}>{t("adminLoadingUsers" as TranslationKey)}</div>;

  return (
    <div className="config-section" style={{ padding: "1rem", animation: "fadeIn 0.4s ease" }}>
      <h3 style={{ marginBottom: "1rem", color: "var(--ink)" }}>{t("adminManageUsers" as TranslationKey)}</h3>
      
      {/* Barra de búsqueda */}
      <div style={{ marginBottom: "1.2rem" }}>
        <input 
          type="text" 
          className="input" 
          placeholder="🔍 Buscar por email, rol o ID..." 
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          style={{ width: "100%", maxWidth: "320px" }}
        />
      </div>

      {filteredUsers.length === 0 ? (
        <p style={{ color: "var(--ink-3)" }}>
          {searchQuery ? "No se encontraron usuarios que coincidan con la búsqueda." : (t("adminNoUsers" as TranslationKey) as string)}
        </p>
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
              {paginatedUsers.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  {editingId === u.id ? (
                    <>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem", flexDirection: "column" }}>
                          <input 
                            className="input" 
                            value={editForm.email} 
                            onChange={e => setEditForm({...editForm, email: e.target.value})} 
                            placeholder={t("adminEmail" as TranslationKey) as string} 
                          />
                          <input 
                            className="input" 
                            type="password"
                            value={editForm.password} 
                            onChange={e => setEditForm({...editForm, password: e.target.value})} 
                            placeholder={t("adminNewPassword" as TranslationKey) as string} 
                          />
                        </div>
                      </td>
                      <td>
                        <select 
                          className="input" 
                          value={editForm.role} 
                          onChange={e => setEditForm({...editForm, role: e.target.value})}
                          style={{ padding: "0.4rem 0.5rem", minWidth: "120px" }}
                        >
                          <option value="admin">admin</option>
                          <option value="business">business</option>
                          <option value="customer">customer</option>
                        </select>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{u.email}</td>
                      <td><span className="badge badge--confirmed" style={{ background: "var(--paper-3)", color: "var(--ink-2)" }}>{u.role}</span></td>
                    </>
                  )}
                  <td style={{ textAlign: "right", verticalAlign: "top", width: "200px" }}>
                    {editingId === u.id ? (
                      <div style={{ display: "flex", gap: "0.5rem", justifySelf: "flex-end" }}>
                        <button className="secondary-btn" onClick={() => setEditingId(null)}>{t("adminCancel" as TranslationKey)}</button>
                        <button className="primary-btn" onClick={() => handleSave(u.id)}>{t("adminSaveUser" as TranslationKey)}</button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: "0.5rem", justifySelf: "flex-end" }}>
                        <button className="secondary-btn" onClick={() => handleEdit(u)}>{t("adminEditUser" as TranslationKey)}</button>
                        <button className="danger-btn" onClick={() => handleDelete(u.id)}>{t("adminDeleteUser" as TranslationKey)}</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Paginación */}
          {totalPages > 1 && (
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.2rem", alignItems: "center", justifyContent: "flex-end" }}>
              <button 
                className="secondary-btn" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1}
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.9rem" }}
              >
                Anterior
              </button>
              <span style={{ color: "var(--ink-2)", fontSize: "0.9rem" }}>
                Página {currentPage} de {totalPages}
              </span>
              <button 
                className="secondary-btn" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                disabled={currentPage === totalPages}
                style={{ padding: "0.4rem 0.8rem", fontSize: "0.9rem" }}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function BusinessConfig() {
  const { t } = useLanguage();
  return (
    <div className="config-section" style={{ padding: "1rem", animation: "fadeIn 0.4s ease" }}>
      <h3 style={{ marginBottom: "1rem", color: "var(--ink)" }}>{t("configBusinessSettingsTitle" as TranslationKey)}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        <div>
          <h4 style={{ color: "var(--ink-2)", marginBottom: "1rem" }}>{t("configHoursAndBookings" as TranslationKey)}</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.9rem", color: "var(--ink-2)", display: "block", marginBottom: "0.5rem" }}>{t("configDefaultDuration" as TranslationKey)}</label>
              <input type="number" className="input" defaultValue={30} min={5} step={5} />
            </div>
            <div>
              <label style={{ fontSize: "0.9rem", color: "var(--ink-2)", display: "block", marginBottom: "0.5rem" }}>{t("configMarginBetween" as TranslationKey)}</label>
              <input type="number" className="input" defaultValue={10} min={0} step={5} />
            </div>
          </div>
        </div>

        <div>
          <h4 style={{ color: "var(--ink-2)", marginBottom: "1rem" }}>{t("configBookingPolicies" as TranslationKey)}</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.9rem", color: "var(--ink-2)", display: "block", marginBottom: "0.5rem" }}>{t("configMinAdvance" as TranslationKey)}</label>
              <input type="number" className="input" defaultValue={24} min={1} />
            </div>
            <div>
              <label style={{ fontSize: "0.9rem", color: "var(--ink-2)", display: "block", marginBottom: "0.5rem" }}>{t("configMaxBookings" as TranslationKey)}</label>
              <input type="number" className="input" defaultValue={2} min={1} />
            </div>
          </div>
        </div>

      </div>
      <SaveButton />
    </div>
  );
}

function CustomerConfig() {
  const { t } = useLanguage();
  return (
    <div className="config-section" style={{ padding: "1rem", animation: "fadeIn 0.4s ease" }}>
      <h3 style={{ marginBottom: "1rem", color: "var(--ink)" }}>{t("configCustomerPrefs" as TranslationKey)}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        <div>
          <h4 style={{ color: "var(--ink-2)", marginBottom: "1rem" }}>{t("configNotificationsTitle" as TranslationKey)}</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--ink)" }}>
              <input type="checkbox" defaultChecked /> {t("configEmailReminders" as TranslationKey)}
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--ink)" }}>
              <input type="checkbox" /> {t("configSMSReminders" as TranslationKey)}
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--ink)" }}>
              <input type="checkbox" defaultChecked /> {t("configPromotions" as TranslationKey)}
            </label>
          </div>
        </div>

        <div>
          <h4 style={{ color: "var(--ink-2)", marginBottom: "1rem" }}>{t("configPrivacyTitle" as TranslationKey)}</h4>
          <button className="danger-btn" style={{ background: "transparent", color: "var(--danger-text)", border: "1px solid var(--danger-text)" }}>
            {t("configRequestDeletion" as TranslationKey)}
          </button>
        </div>

      </div>
      <SaveButton />
    </div>
  );
}

interface ConfigTabsProps {
  role: "admin" | "business" | "customer";
}

export default function ConfigTabs({ role }: ConfigTabsProps) {
  const { t } = useLanguage();
  
  const tabs = [
    { key: "admin", label: t("configTabAdmin" as TranslationKey), component: <AdminConfig /> },
    { key: "business", label: t("configTabBusiness" as TranslationKey), component: <BusinessConfig /> },
    { key: "customer", label: t("configTabCustomer" as TranslationKey), component: <CustomerConfig /> },
  ];

  const visibleTabs = tabs.filter((tab) => tab.key === role);
  const [active, setActive] = React.useState(visibleTabs[0]?.key ?? "admin");
  const activeComponent = visibleTabs.find((tab) => tab.key === active)?.component;

  return (
    <div className="config-tabs">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <nav className="tab-nav" style={{ display: "flex", gap: "1.5rem", marginBottom: "2rem", borderBottom: "1px solid var(--line)" }}>
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "1.1rem",
              fontWeight: 600,
              padding: "0.5rem 1rem",
              cursor: "pointer",
              color: tab.key === active ? "var(--primary)" : "var(--ink-3)",
              borderBottom: tab.key === active ? "3px solid var(--primary)" : "3px solid transparent",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <section style={{ minHeight: "300px" }}>{activeComponent}</section>
    </div>
  );
}


