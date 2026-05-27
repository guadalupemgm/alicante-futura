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
        <p style={{ color: "var(--ink-3)", padding: "1rem 0" }}>
          {lang.code === "es" ? "No se han encontrado usuarios" : lang.code === "fr" ? "Aucun utilisateur trouvé" : "No users found"}
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

function BusinessServicesConfig() {
  const { lang } = useLanguage();
  const { user } = useAuth();
  
  interface BusinessService {
    name: string;
    price: number;
  }

  const [services, setServices] = useState<BusinessService[]>([]);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServicePrice, setNewServicePrice] = useState("");

  const storageKey = user?.businessId ? `bf_services_by_business_${user.businessId}` : null;

  useEffect(() => {
    if (!storageKey) return;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const validated = parsed.map((item: any) => {
            if (typeof item === "string") {
              return { name: item, price: 35 };
            }
            return {
              name: item.name || "Servicio",
              price: typeof item.price === "number" ? item.price : 35
            };
          });
          setServices(validated);
        } else {
          setServices([]);
        }
      } catch (_) {
        setServices([]);
      }
    } else {
      setServices([]);
      localStorage.setItem(storageKey, JSON.stringify([]));
    }
  }, [storageKey]);

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim() || !storageKey) return;
    const priceNum = parseFloat(newServicePrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert(lang.code === "es" ? "Por favor, introduce un precio válido mayor que 0." : "Please enter a valid price greater than 0.");
      return;
    }
    if (services.some(s => s.name.toLowerCase() === newServiceName.trim().toLowerCase())) {
      alert(lang.code === "es" ? "Este servicio ya existe." : "This service already exists.");
      return;
    }
    
    const newItem = { name: newServiceName.trim(), price: priceNum };
    const updated = [...services, newItem];
    setServices(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setNewServiceName("");
    setNewServicePrice("");
  };

  const handleDeleteService = (name: string) => {
    if (!storageKey) return;
    const updated = services.filter(s => s.name !== name);
    setServices(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  return (
    <div className="config-section" style={{ padding: "1rem", animation: "fadeIn 0.4s ease" }}>
      <h3 style={{ marginBottom: "1rem", color: "var(--ink)" }}>
        {lang.code === "es" ? "Gestión de Servicios" : "Manage Services"}
      </h3>
      <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "1.25rem" }}>
        {lang.code === "es"
          ? "Define los servicios que ofreces y sus precios correspondientes para tus clientes."
          : "Define the services you offer and their corresponding prices for your clients."}
      </p>

      <form onSubmit={handleAddService} style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <input
          type="text"
          className="input"
          placeholder={lang.code === "es" ? "Ej: Corte caballero, Tinte, Masaje..." : "E.g. Haircut, Massage..."}
          value={newServiceName}
          onChange={e => setNewServiceName(e.target.value)}
          style={{ flex: 2, minWidth: "150px" }}
          required
        />
        <div style={{ display: "flex", alignItems: "center", gap: "4px", flex: 1, minWidth: "100px" }}>
          <input
            type="number"
            className="input"
            placeholder={lang.code === "es" ? "Precio" : "Price"}
            value={newServicePrice}
            onChange={e => setNewServicePrice(e.target.value)}
            min="0.01"
            step="0.01"
            style={{ width: "100%" }}
            required
          />
          <span style={{ fontSize: "14px", fontWeight: 600 }}>€</span>
        </div>
        <button type="submit" className="primary-btn" style={{ marginTop: 0, padding: "8px 16px" }}>
          {lang.code === "es" ? "Añadir" : "Add"}
        </button>
      </form>

      {services.length === 0 ? (
        <p style={{ fontSize: "13px", color: "var(--muted)", textAlign: "center", padding: "2rem", border: "1px dashed var(--border)", borderRadius: "var(--r)" }}>
          {lang.code === "es" ? "No tienes servicios creados." : "No services created."}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {services.map(s => (
            <div key={s.name} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 12px", background: "var(--paper-2)", borderRadius: "var(--r)",
              border: "1px solid var(--border)"
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--ink)" }}>{s.name}</span>
                <span style={{ fontSize: "11px", color: "var(--primary)", fontWeight: 700 }}>{s.price.toFixed(2)} €</span>
              </div>
              <button
                type="button"
                onClick={() => handleDeleteService(s.name)}
                style={{
                  background: "none", border: "none", color: "#ef4444", cursor: "pointer",
                  fontSize: "12px", fontWeight: 600, padding: "2px 6px"
                }}
              >
                {lang.code === "es" ? "Eliminar" : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
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
  const { t, lang } = useLanguage();
  
  const tabs = [
    { key: "admin", label: t("configTabAdmin" as TranslationKey), component: <AdminConfig /> },
    { key: "business", label: t("configTabBusiness" as TranslationKey), component: <BusinessConfig /> },
    { key: "services", label: lang.code === "es" ? "Servicios" : lang.code === "fr" ? "Services" : "Services", component: <BusinessServicesConfig /> },
    { key: "customer", label: t("configTabCustomer" as TranslationKey), component: <CustomerConfig /> },
  ];

  const visibleTabs = tabs.filter((tab) => {
    if (role === "business") {
      return tab.key === "business" || tab.key === "services";
    }
    return tab.key === role;
  });
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


