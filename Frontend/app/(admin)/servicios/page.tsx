"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { useLanguage, TranslationKey } from "@/components/context/LanguageContext";

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;   // minutos
  description: string;
  category: string;
  active: boolean;
}

const SERVICE_CATEGORIES_ES = ["Corte de pelo", "Coloración", "Tratamiento", "Masaje", "Facial", "Manicura", "Pedicura", "Depilación", "Consulta", "Asesoría", "Otro"];
const SERVICE_CATEGORIES_EN = ["Haircut", "Colouring", "Treatment", "Massage", "Facial", "Manicure", "Pedicure", "Waxing", "Consultation", "Advisory", "Other"];
const SERVICE_CATEGORIES_FR = ["Coupe", "Coloration", "Traitement", "Massage", "Facial", "Manucure", "Pédicure", "Épilation", "Consultation", "Conseil", "Autre"];

const DEFAULT_FORM: Omit<Service, "id"> = {
  name: "",
  price: 0,
  duration: 30,
  description: "",
  category: "",
  active: true,
};

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

export default function ServiciosPage() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();

  const storageKey = user?.businessId
    ? `bf_services_by_business_${user.businessId}`
    : null;

  const [services, setServices] = useState<Service[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Service, "id">>(DEFAULT_FORM);
  const [searchQ, setSearchQ] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Cargar desde localStorage
  useEffect(() => {
    if (!storageKey) return;
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Migrar datos simples { name, price } al nuevo formato
          const migrated: Service[] = parsed.map((item: any) => {
            if (typeof item === "string") {
              return { id: generateId(), name: item, price: 35, duration: 30, description: "", category: "", active: true };
            }
            return {
              id: item.id || generateId(),
              name: item.name || "",
              price: typeof item.price === "number" ? item.price : 0,
              duration: typeof item.duration === "number" ? item.duration : 30,
              description: item.description || "",
              category: item.category || "",
              active: item.active !== false,
            };
          });
          setServices(migrated);
        }
      } catch {
        setServices([]);
      }
    }
  }, [storageKey]);

  const persist = (updated: Service[]) => {
    setServices(updated);
    if (storageKey) {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const openAdd = () => {
    setForm(DEFAULT_FORM);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (svc: Service) => {
    const { id, ...rest } = svc;
    setForm(rest);
    setEditingId(id);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || form.price < 0) return;
    if (editingId) {
      persist(services.map(s => s.id === editingId ? { ...form, id: editingId } : s));
    } else {
      persist([...services, { ...form, id: generateId() }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    persist(services.filter(s => s.id !== id));
    setDeleteConfirm(null);
  };

  const toggleActive = (id: string) => {
    persist(services.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const categories = useMemo(() => {
    const cats = lang.code === "fr"
      ? SERVICE_CATEGORIES_FR
      : lang.code === "en"
      ? SERVICE_CATEGORIES_EN
      : SERVICE_CATEGORIES_ES;
    return cats;
  }, [lang.code]);

  const uniqueCats = useMemo(() => {
    const set = new Set(services.map(s => s.category).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [services]);

  const filtered = useMemo(() => {
    return services.filter(s => {
      const matchQ = s.name.toLowerCase().includes(searchQ.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQ.toLowerCase());
      const matchCat = filterCat === "all" || s.category === filterCat;
      return matchQ && matchCat;
    });
  }, [services, searchQ, filterCat]);

  const stats = useMemo(() => ({
    total: services.length,
    active: services.filter(s => s.active).length,
    avgPrice: services.length ? (services.reduce((a, s) => a + s.price, 0) / services.length).toFixed(2) : "0.00",
    minPrice: services.length ? Math.min(...services.map(s => s.price)).toFixed(2) : "0.00",
    maxPrice: services.length ? Math.max(...services.map(s => s.price)).toFixed(2) : "0.00",
  }), [services]);

  const labelAdd      = lang.code === "es" ? "Añadir servicio" : lang.code === "fr" ? "Ajouter un service" : "Add service";
  const labelEdit     = lang.code === "es" ? "Editar" : lang.code === "fr" ? "Modifier" : "Edit";
  const labelDel      = lang.code === "es" ? "Eliminar" : lang.code === "fr" ? "Supprimer" : "Delete";
  const labelSave     = lang.code === "es" ? "Guardar" : lang.code === "fr" ? "Enregistrer" : "Save";
  const labelCancel   = lang.code === "es" ? "Cancelar" : lang.code === "fr" ? "Annuler" : "Cancel";
  const labelName     = lang.code === "es" ? "Nombre del servicio *" : lang.code === "fr" ? "Nom du service *" : "Service name *";
  const labelPrice    = lang.code === "es" ? "Precio (€) *" : lang.code === "fr" ? "Prix (€) *" : "Price (€) *";
  const labelDuration = lang.code === "es" ? "Duración (min)" : lang.code === "fr" ? "Durée (min)" : "Duration (min)";
  const labelDesc     = lang.code === "es" ? "Descripción breve" : lang.code === "fr" ? "Courte description" : "Short description";
  const labelCat      = lang.code === "es" ? "Categoría" : lang.code === "fr" ? "Catégorie" : "Category";
  const labelActive   = lang.code === "es" ? "Activo" : lang.code === "fr" ? "Actif" : "Active";
  const labelConfDel  = lang.code === "es" ? "¿Eliminar este servicio?" : lang.code === "fr" ? "Supprimer ce service ?" : "Delete this service?";
  const labelSearch   = lang.code === "es" ? "Buscar servicio..." : lang.code === "fr" ? "Rechercher un service..." : "Search service...";
  const labelEmpty    = lang.code === "es"
    ? "Aún no tienes servicios. Añade tu primer servicio para que tus clientes puedan seleccionarlo al reservar."
    : lang.code === "fr"
    ? "Vous n'avez pas encore de services. Ajoutez votre premier service afin que vos clients puissent le sélectionner lors de leur réservation."
    : "You don't have any services yet. Add your first service so customers can select it when booking.";
  const labelModalTitle = editingId
    ? (lang.code === "es" ? "Editar servicio" : lang.code === "fr" ? "Modifier le service" : "Edit service")
    : (lang.code === "es" ? "Nuevo servicio" : lang.code === "fr" ? "Nouveau service" : "New service");
  const labelAll      = lang.code === "es" ? "Todos" : lang.code === "fr" ? "Tous" : "All";
  const labelMin      = lang.code === "es" ? "Precio mín." : lang.code === "fr" ? "Prix min." : "Min price";
  const labelMax      = lang.code === "es" ? "Precio máx." : lang.code === "fr" ? "Prix max." : "Max price";
  const labelAvg      = lang.code === "es" ? "Precio medio" : lang.code === "fr" ? "Prix moyen" : "Avg price";
  const labelServicesTitle = lang.code === "es" ? "Mis Servicios" : lang.code === "fr" ? "Mes Services" : "My Services";
  const labelServicesSubtitle = lang.code === "es"
    ? "Gestiona el catálogo de servicios de tu negocio. Los clientes podrán seleccionarlos al hacer una reserva."
    : lang.code === "fr"
    ? "Gérez le catalogue de services de votre entreprise. Les clients pourront les sélectionner lors d'une réservation."
    : "Manage your business's service catalogue. Customers will be able to select them when making a booking.";
  const labelNoFilter = lang.code === "es" ? "Sin resultados para tu búsqueda." : lang.code === "fr" ? "Aucun résultat pour votre recherche." : "No results for your search.";

  return (
    <div className="page-stack animate-fadeIn">

      {/* Header */}
      <section className="page-hero" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div>
          <h2 style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <i className="bi bi-stars" style={{ color: "var(--primary)", fontSize: 22 }} />
            {labelServicesTitle}
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 13, maxWidth: 560 }}>{labelServicesSubtitle}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {saved && (
            <span className="badge" style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", padding: "6px 14px", fontSize: 12, fontWeight: 600, borderRadius: "var(--r-full)", display: "flex", alignItems: "center", gap: 6, animation: "fadeIn 0.2s ease" }}>
              <i className="bi bi-check-circle-fill" /> {lang.code === "es" ? "Guardado" : lang.code === "fr" ? "Enregistré" : "Saved"}
            </span>
          )}
          <button className="primary-btn" style={{ display: "flex", alignItems: "center", gap: 8 }} onClick={openAdd}>
            <i className="bi bi-plus-lg" /> {labelAdd}
          </button>
        </div>
      </section>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
        {[
          { label: lang.code === "es" ? "Total servicios" : lang.code === "fr" ? "Total services" : "Total services", value: stats.total, icon: "bi-grid-3x3-gap-fill", color: "var(--primary)" },
          { label: lang.code === "es" ? "Activos" : lang.code === "fr" ? "Actifs" : "Active", value: stats.active, icon: "bi-toggle-on", color: "#10b981" },
          { label: labelMin, value: `${stats.minPrice} €`, icon: "bi-arrow-down-circle-fill", color: "#6366f1" },
          { label: labelAvg, value: `${stats.avgPrice} €`, icon: "bi-bar-chart-fill", color: "#f59e0b" },
          { label: labelMax, value: `${stats.maxPrice} €`, icon: "bi-arrow-up-circle-fill", color: "#ec4899" },
        ].map((kpi) => (
          <div key={kpi.label} className="kpi-card" style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span className="kpi-card__label" style={{ fontSize: 11 }}>{kpi.label}</span>
              <i className={`bi ${kpi.icon}`} style={{ fontSize: 14, color: kpi.color }} />
            </div>
            <div className="kpi-card__value" style={{ fontSize: 22, color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      {services.length > 0 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 220px" }}>
            <i className="bi bi-search" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: 13 }} />
            <input
              type="text"
              className="input"
              placeholder={labelSearch}
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              style={{ paddingLeft: 36 }}
            />
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {uniqueCats.map(cat => (
              <button
                key={cat}
                className={`filter-pill ${filterCat === cat ? "active" : ""}`}
                onClick={() => setFilterCat(cat)}
                style={{ border: "1px solid var(--border)", background: filterCat === cat ? "var(--primary)" : "transparent" }}
              >
                {cat === "all" ? labelAll : cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Services Grid / Empty */}
      {services.length === 0 ? (
        <div className="section-card" style={{ textAlign: "center", padding: "3rem 2rem" }}>
          <div style={{ fontSize: 48, marginBottom: 12, filter: "grayscale(0.3)" }}>✨</div>
          <h3 style={{ fontWeight: 600, marginBottom: 8 }}>{lang.code === "es" ? "Sin servicios todavía" : lang.code === "fr" ? "Aucun service pour l'instant" : "No services yet"}</h3>
          <p style={{ color: "var(--muted)", fontSize: 13, maxWidth: 440, margin: "0 auto 1.5rem" }}>{labelEmpty}</p>
          <button className="primary-btn" onClick={openAdd} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <i className="bi bi-plus-lg" /> {labelAdd}
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="section-card" style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ color: "var(--muted)", fontSize: 13 }}>{labelNoFilter}</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {filtered.map(svc => (
            <div
              key={svc.id}
              className="section-card"
              style={{
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                opacity: svc.active ? 1 : 0.55,
                transition: "opacity 0.2s",
                borderLeft: `3px solid ${svc.active ? "var(--primary)" : "var(--border)"}`,
              }}
            >
              {/* Card header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{svc.name}</span>
                    {!svc.active && (
                      <span className="badge" style={{ fontSize: 10, padding: "2px 8px", background: "var(--surface-2)", color: "var(--muted)", flexShrink: 0 }}>
                        {lang.code === "es" ? "Inactivo" : lang.code === "fr" ? "Inactif" : "Inactive"}
                      </span>
                    )}
                  </div>
                  {svc.category && (
                    <span style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{svc.category}</span>
                  )}
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => openEdit(svc)}
                    title={labelEdit}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary)", fontSize: 15, padding: "4px" }}
                  >
                    <i className="bi bi-pencil-fill" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(svc.id)}
                    title={labelDel}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger-text)", fontSize: 15, padding: "4px" }}
                  >
                    <i className="bi bi-trash3-fill" />
                  </button>
                </div>
              </div>

              {/* Description */}
              {svc.description && (
                <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5, margin: 0 }}>{svc.description}</p>
              )}

              {/* Info row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: "auto" }}>
                <div style={{ display: "flex", gap: 14 }}>
                  <span style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 5, color: "var(--muted)" }}>
                    <i className="bi bi-clock" style={{ fontSize: 12 }} />
                    {svc.duration} min
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 18, fontWeight: 800, color: "var(--primary)" }}>{svc.price.toFixed(2)} €</span>
                  <label style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", fontSize: 12, color: "var(--muted)" }}>
                    <input
                      type="checkbox"
                      checked={svc.active}
                      onChange={() => toggleActive(svc.id)}
                      style={{ accentColor: "var(--primary)", cursor: "pointer" }}
                    />
                    {labelActive}
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1rem"
          }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div
            className="section-card"
            style={{ width: "100%", maxWidth: 480, padding: "2rem", animation: "slideIn 0.2s ease" }}
          >
            <h3 style={{ marginBottom: "1.5rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 10 }}>
              <i className="bi bi-stars" style={{ color: "var(--primary)" }} />
              {labelModalTitle}
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Name */}
              <div>
                <label className="kpi-card__label" style={{ fontSize: 11, marginBottom: 6, display: "block" }}>{labelName}</label>
                <input
                  type="text"
                  className="input"
                  placeholder={lang.code === "es" ? "Ej: Corte de pelo" : lang.code === "fr" ? "Ex : Coupe de cheveux" : "E.g. Haircut"}
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  autoFocus
                />
              </div>

              {/* Price + Duration */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label className="kpi-card__label" style={{ fontSize: 11, marginBottom: 6, display: "block" }}>{labelPrice}</label>
                  <input
                    type="number"
                    className="input"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={form.price || ""}
                    onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <label className="kpi-card__label" style={{ fontSize: 11, marginBottom: 6, display: "block" }}>{labelDuration}</label>
                  <input
                    type="number"
                    className="input"
                    min="5"
                    step="5"
                    value={form.duration || ""}
                    onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) || 30 }))}
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="kpi-card__label" style={{ fontSize: 11, marginBottom: 6, display: "block" }}>{labelCat}</label>
                <select
                  className="input"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                >
                  <option value="">{lang.code === "es" ? "Sin categoría" : lang.code === "fr" ? "Sans catégorie" : "No category"}</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="kpi-card__label" style={{ fontSize: 11, marginBottom: 6, display: "block" }}>{labelDesc}</label>
                <textarea
                  className="input"
                  rows={2}
                  style={{ resize: "vertical" }}
                  placeholder={lang.code === "es" ? "Describe brevemente el servicio..." : lang.code === "fr" ? "Décrivez brièvement le service..." : "Briefly describe the service..."}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>

              {/* Active toggle */}
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                  style={{ accentColor: "var(--primary)", width: 16, height: 16, cursor: "pointer" }}
                />
                <span>{labelActive} — {lang.code === "es" ? "visible para los clientes al reservar" : lang.code === "fr" ? "visible par les clients lors de la réservation" : "visible to customers when booking"}</span>
              </label>
            </div>

            <div className="modal-actions" style={{ marginTop: "1.5rem" }}>
              <button className="secondary-btn" onClick={() => setShowModal(false)}>{labelCancel}</button>
              <button
                className="primary-btn"
                onClick={handleSave}
                disabled={!form.name.trim() || form.price < 0}
              >
                {labelSave}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 1100,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "1rem"
          }}
          onClick={e => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}
        >
          <div className="section-card" style={{ width: "100%", maxWidth: 360, padding: "2rem", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
            <h4 style={{ fontWeight: 700, marginBottom: 8 }}>{labelConfDel}</h4>
            <p style={{ color: "var(--muted)", fontSize: 13, marginBottom: "1.5rem" }}>
              {lang.code === "es" ? "Esta acción no se puede deshacer." : lang.code === "fr" ? "Cette action est irréversible." : "This action cannot be undone."}
            </p>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setDeleteConfirm(null)}>{labelCancel}</button>
              <button
                className="primary-btn"
                style={{ background: "var(--danger-text)", boxShadow: "none" }}
                onClick={() => handleDelete(deleteConfirm)}
              >
                {labelDel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
