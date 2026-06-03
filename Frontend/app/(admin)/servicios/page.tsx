"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { useLanguage } from "@/components/context/LanguageContext";

/* ─── Types ─────────────────────────────────────────────────── */
interface Service {
  id: string;
  name: string;
  price: number;
  duration: number | null;   // null = indefinido
  description: string;
  category: string;
  active: boolean;
  // Discount
  discountType: "none" | "percent" | "fixed"; // none | % | €
  discountValue: number;   // % o importe en €
  discountLabel: string;   // ej. "Oferta de verano"
  discountUntil: string;   // ISO date string o ""
}

/* ─── Category presets ───────────────────────────────────────── */
const CATS: Record<string, string[]> = {
  es: ["Corte de pelo","Coloración","Tratamiento","Masaje","Facial","Manicura","Pedicura","Depilación","Consulta","Asesoría","Otro"],
  en: ["Haircut","Colouring","Treatment","Massage","Facial","Manicure","Pedicure","Waxing","Consultation","Advisory","Other"],
  fr: ["Coupe","Coloration","Traitement","Massage","Facial","Manucure","Pédicure","Épilation","Consultation","Conseil","Autre"],
};

const BLANK: Omit<Service, "id"> = {
  name: "", price: 0, duration: 30,
  description: "", category: "", active: true,
  discountType: "none", discountValue: 0, discountLabel: "", discountUntil: "",
};

function uid() { return Math.random().toString(36).substring(2, 10); }

/* ─── Helpers ────────────────────────────────────────────────── */
function discountedPrice(svc: Service): number | null {
  if (svc.discountType === "none" || svc.discountValue <= 0) return null;
  if (svc.discountType === "percent") return svc.price * (1 - svc.discountValue / 100);
  return Math.max(0, svc.price - svc.discountValue);
}

function isDiscountActive(svc: Service): boolean {
  if (svc.discountType === "none" || svc.discountValue <= 0) return false;
  if (!svc.discountUntil) return true;
  return new Date(svc.discountUntil) >= new Date();
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function ServiciosPage() {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const code = lang.code as "es" | "en" | "fr";

  const storageKey = user?.businessId ? `bf_services_by_business_${user.businessId}` : null;

  const [services,      setServices]      = useState<Service[]>([]);
  const [showModal,     setShowModal]     = useState(false);
  const [editingId,     setEditingId]     = useState<string | null>(null);
  const [form,          setForm]          = useState<Omit<Service,"id">>(BLANK);
  const [searchQ,       setSearchQ]       = useState("");
  const [filterCat,     setFilterCat]     = useState("all");
  const [saved,         setSaved]         = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [discountOpen,  setDiscountOpen]  = useState(false);

  /* Load */
  useEffect(() => {
    if (!storageKey) return;
    const raw = localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;
      const migrated: Service[] = parsed.map((item: Partial<Service>) => ({
        id:            item.id            || uid(),
        name:          item.name          || "",
        price:         typeof item.price === "number" ? item.price : 0,
        duration:      item.duration === null ? null : (typeof item.duration === "number" ? item.duration : 30),
        description:   item.description   || "",
        category:      item.category      || "",
        active:        item.active        !== false,
        discountType:  item.discountType  || "none",
        discountValue: item.discountValue || 0,
        discountLabel: item.discountLabel || "",
        discountUntil: item.discountUntil || "",
      }));
      setTimeout(() => setServices(migrated), 0);
    } catch {
      setTimeout(() => setServices([]), 0);
    }
  }, [storageKey]);

  /* Persist */
  const persist = (updated: Service[]) => {
    setServices(updated);
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  /* Modal helpers */
  const openAdd  = () => { setForm(BLANK); setEditingId(null); setDiscountOpen(false); setShowModal(true); };
  const openEdit = (svc: Service) => {
    const { id, ...rest } = svc;
    setForm(rest);
    setEditingId(id);
    setDiscountOpen(svc.discountType !== "none");
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || form.price < 0) return;
    const clean: Omit<Service,"id"> = {
      ...form,
      discountType:  discountOpen ? form.discountType  : "none",
      discountValue: discountOpen ? form.discountValue : 0,
      discountLabel: discountOpen ? form.discountLabel : "",
      discountUntil: discountOpen ? form.discountUntil : "",
    };
    if (editingId) {
      persist(services.map(s => s.id === editingId ? { ...clean, id: editingId } : s));
    } else {
      persist([...services, { ...clean, id: uid() }]);
    }
    setShowModal(false);
  };

  const handleDelete   = (id: string) => { persist(services.filter(s => s.id !== id)); setDeleteConfirm(null); };
  const toggleActive   = (id: string) => persist(services.map(s => s.id === id ? { ...s, active: !s.active } : s));

  /* Derived */
  const cats = CATS[code] || CATS.es;

  const uniqueCats = useMemo(() => {
    const set = new Set(services.map(s => s.category).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [services]);

  const filtered = useMemo(() =>
    services.filter(s => {
      const q = searchQ.toLowerCase();
      return (s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
        && (filterCat === "all" || s.category === filterCat);
    }), [services, searchQ, filterCat]);

  const stats = useMemo(() => ({
    total:   services.length,
    active:  services.filter(s => s.active).length,
    onSale:  services.filter(s => isDiscountActive(s)).length,
    avgPrice: services.length ? (services.reduce((a,s) => a + s.price, 0) / services.length).toFixed(2) : "0.00",
  }), [services]);

  /* ─── i18n helpers ─────────────────────────────── */
  const T = (es: string, en: string, fr: string) =>
    code === "en" ? en : code === "fr" ? fr : es;

  const labelAdd         = T("Añadir servicio","Add service","Ajouter un service");
  const labelEdit        = T("Editar","Edit","Modifier");
  const labelDel         = T("Eliminar","Delete","Supprimer");
  const labelSave        = T("Guardar","Save","Enregistrer");
  const labelCancel      = T("Cancelar","Cancel","Annuler");
  const labelTitle       = T("Catálogo de Servicios","Service Catalogue","Catalogue de Services");
  const labelSubtitle    = T(
    "Gestiona el catálogo de tu negocio. Los clientes los verán al reservar, incluyendo ofertas activas.",
    "Manage your business service catalogue. Customers will see them when booking, including active offers.",
    "Gérez le catalogue de votre entreprise. Les clients les verront lors de la réservation, ainsi que les offres actives."
  );
  const labelSearch      = T("Buscar servicio...","Search service...","Rechercher...");
  const labelAll         = T("Todos","All","Tous");
  const labelEmpty       = T(
    "Aún no tienes servicios. Crea el primero para que tus clientes puedan reservar.",
    "You don't have any services yet. Create the first one so customers can book.",
    "Vous n'avez pas encore de services. Créez le premier pour que les clients puissent réserver."
  );
  const labelNoFilter    = T("Sin resultados.","No results.","Aucun résultat.");
  const labelModalNew    = T("Nuevo servicio","New service","Nouveau service");
  const labelModalEdit   = T("Editar servicio","Edit service","Modifier le service");
  const labelName        = T("Nombre del servicio *","Service name *","Nom du service *");
  const labelPrice       = T("Precio (€) *","Price (€) *","Prix (€) *");
  const labelDuration    = T("Duración","Duration","Durée");
  const labelDurationIndef = T("Indefinida","Open-ended","Sans limite");
  const labelDesc        = T("Descripción breve","Short description","Courte description");
  const labelCat         = T("Categoría","Category","Catégorie");
  const labelActive      = T("Activo","Active","Actif");
  const labelAddDiscount = T("+ Añadir descuento / oferta","+ Add discount / offer","+ Ajouter une réduction / offre");
  const labelRemoveDisc  = T("× Quitar descuento","× Remove discount","× Supprimer la réduction");
  const labelDiscType    = T("Tipo de descuento","Discount type","Type de réduction");
  const labelDiscPct     = T("Porcentaje (%)","Percentage (%)","Pourcentage (%)");
  const labelDiscFixed   = T("Importe fijo (€)","Fixed amount (€)","Montant fixe (€)");
  const labelDiscValue   = T("Valor del descuento","Discount value","Valeur de la réduction");
  const labelDiscPromo   = T("Etiqueta promocional (opcional)","Promo label (optional)","Étiquette promo (optionnel)");
  const labelDiscPromoPlh= T("Ej: Oferta de verano","E.g. Summer offer","Ex : Offre d'été");
  const labelDiscUntil   = T("Válido hasta (opcional)","Valid until (optional)","Valable jusqu'au (optionnel)");
  const labelConfDel     = T("¿Eliminar este servicio?","Delete this service?","Supprimer ce service ?");
  const labelIrrev       = T("Esta acción no se puede deshacer.","This action cannot be undone.","Cette action est irréversible.");
  const labelSavedTxt    = T("Guardado","Saved","Enregistré");
  const labelInactive    = T("Inactivo","Inactive","Inactif");
  const labelTotalSvc    = T("Total servicios","Total services","Total services");
  const labelActiveStat  = T("Activos","Active","Actifs");
  const labelOnSaleStat  = T("Con descuento","On sale","En promo");
  const labelAvgPrice    = T("Precio medio","Avg. price","Prix moyen");
  const labelNoCat       = T("Sin categoría","No category","Sans catégorie");
  const labelVisCli      = T("visible para clientes al reservar","visible to customers when booking","visible pour les clients lors de la réservation");

  /* ─── Duration display helper ───────────────────── */
  const durationLabel = (min: number | null) => {
    if (min === null) return labelDurationIndef;
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m === 0 ? `${h}h` : `${h}h ${m}min`;
  };

  /* ─── Render ─────────────────────────────────────── */
  return (
    <div className="page-stack animate-fadeIn">

      {/* ── Header ── */}
      <section className="page-hero" style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
        <div>
          <h2 style={{ display:"flex", alignItems:"center", gap:10 }}>
            <i className="bi bi-grid-1x2-fill" style={{ color:"var(--primary)", fontSize:20 }} />
            {labelTitle}
          </h2>
          <p style={{ color:"var(--muted)", fontSize:13, maxWidth:560 }}>{labelSubtitle}</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {saved && (
            <span style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, fontWeight:600, color:"#10b981", background:"rgba(16,185,129,0.1)", padding:"6px 14px", borderRadius:"var(--r-full)" }}>
              <i className="bi bi-check-circle-fill" /> {labelSavedTxt}
            </span>
          )}
          <button className="primary-btn" style={{ display:"flex", alignItems:"center", gap:8 }} onClick={openAdd}>
            <i className="bi bi-plus-lg" /> {labelAdd}
          </button>
        </div>
      </section>

      {/* ── Stats ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:12 }}>
        {[
          { label:labelTotalSvc,  value:stats.total,              icon:"bi-grid-3x3-gap-fill",     color:"var(--primary)" },
          { label:labelActiveStat,value:stats.active,             icon:"bi-toggle-on",              color:"#10b981" },
          { label:labelOnSaleStat,value:stats.onSale,             icon:"bi-tag-fill",               color:"#f59e0b" },
          { label:labelAvgPrice,  value:`${stats.avgPrice} €`,    icon:"bi-bar-chart-fill",          color:"#6366f1" },
        ].map(k => (
          <div key={k.label} className="kpi-card" style={{ display:"flex", flexDirection:"column", gap:4 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span className="kpi-card__label" style={{ fontSize:11 }}>{k.label}</span>
              <i className={`bi ${k.icon}`} style={{ fontSize:14, color:k.color }} />
            </div>
            <div className="kpi-card__value" style={{ fontSize:22, color:k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* ── Search + Filter ── */}
      {services.length > 0 && (
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
          <div style={{ position:"relative", flex:"1 1 220px" }}>
            <i className="bi bi-search" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"var(--muted)", fontSize:13 }} />
            <input type="text" className="input" placeholder={labelSearch}
              value={searchQ} onChange={e => setSearchQ(e.target.value)}
              style={{ paddingLeft:36 }} />
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {uniqueCats.map(cat => (
              <button key={cat}
                className={`filter-pill ${filterCat === cat ? "active" : ""}`}
                onClick={() => setFilterCat(cat)}
                style={{ border:"1px solid var(--border)", background: filterCat === cat ? "var(--primary)" : "transparent" }}>
                {cat === "all" ? labelAll : cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Grid / Empty ── */}
      {services.length === 0 ? (
        <div className="section-card" style={{ textAlign:"center", padding:"3rem 2rem" }}>
          <i className="bi bi-inbox" style={{ fontSize:44, color:"var(--muted)", display:"block", marginBottom:12 }} />
          <h3 style={{ fontWeight:600, marginBottom:8 }}>{T("Sin servicios todavía","No services yet","Aucun service pour l'instant")}</h3>
          <p style={{ color:"var(--muted)", fontSize:13, maxWidth:440, margin:"0 auto 1.5rem" }}>{labelEmpty}</p>
          <button className="primary-btn" onClick={openAdd} style={{ display:"inline-flex", alignItems:"center", gap:8 }}>
            <i className="bi bi-plus-lg" /> {labelAdd}
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="section-card" style={{ textAlign:"center", padding:"2rem" }}>
          <p style={{ color:"var(--muted)", fontSize:13 }}>{labelNoFilter}</p>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14 }}>
          {filtered.map(svc => {
            const finalPrice = discountedPrice(svc);
            const onSale     = finalPrice !== null && isDiscountActive(svc);

            return (
              <div key={svc.id} className="section-card" style={{
                padding:"1.25rem", display:"flex", flexDirection:"column", gap:10,
                opacity: svc.active ? 1 : 0.55, transition:"opacity 0.2s",
                borderLeft:`3px solid ${onSale ? "#f59e0b" : svc.active ? "var(--primary)" : "var(--border)"}`,
                position:"relative", overflow:"hidden",
              }}>

                {/* Discount ribbon */}
                {onSale && (
                  <div style={{
                    position:"absolute", top:0, right:0,
                    background:"linear-gradient(135deg,#f59e0b,#ef4444)",
                    color:"#fff", fontSize:10, fontWeight:800,
                    padding:"4px 12px 4px 20px",
                    borderBottomLeftRadius: "var(--r)",
                    letterSpacing:"0.05em",
                    clipPath:"polygon(12px 0,100% 0,100% 100%,0 100%)",
                    display:"flex", alignItems:"center", gap:4,
                  }}>
                    <i className="bi bi-tag-fill" style={{ fontSize:9 }} />
                    {svc.discountType === "percent"
                      ? `-${svc.discountValue}%`
                      : `-${svc.discountValue.toFixed(2)} €`}
                  </div>
                )}

                {/* Card header */}
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8 }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ fontSize:15, fontWeight:700, color:"var(--text)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {svc.name}
                      </span>
                      {!svc.active && (
                        <span className="badge" style={{ fontSize:10, padding:"2px 8px", background:"var(--surface-2)", color:"var(--muted)", flexShrink:0 }}>
                          {labelInactive}
                        </span>
                      )}
                    </div>
                    {svc.category && (
                      <span style={{ fontSize:11, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.05em" }}>{svc.category}</span>
                    )}
                  </div>
                  <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                    <button onClick={() => openEdit(svc)} title={labelEdit}
                      style={{ background:"none", border:"none", cursor:"pointer", color:"var(--primary)", fontSize:15, padding:4 }}>
                      <i className="bi bi-pencil-fill" />
                    </button>
                    <button onClick={() => setDeleteConfirm(svc.id)} title={labelDel}
                      style={{ background:"none", border:"none", cursor:"pointer", color:"var(--danger-text)", fontSize:15, padding:4 }}>
                      <i className="bi bi-trash3-fill" />
                    </button>
                  </div>
                </div>

                {/* Promo label */}
                {onSale && svc.discountLabel && (
                  <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:11, color:"#d97706", fontWeight:600 }}>
                    <i className="bi bi-megaphone-fill" />
                    {svc.discountLabel}
                    {svc.discountUntil && (
                      <span style={{ fontWeight:400, color:"var(--muted)" }}>
                        · {T("hasta","until","jusqu'au")} {new Date(svc.discountUntil).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}

                {/* Description */}
                {svc.description && (
                  <p style={{ fontSize:12, color:"var(--muted)", lineHeight:1.5, margin:0 }}>{svc.description}</p>
                )}

                {/* Footer row */}
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", borderTop:"1px solid var(--border)", paddingTop:10, marginTop:"auto" }}>
                  <span style={{ fontSize:12, color:"var(--muted)", display:"flex", alignItems:"center", gap:5 }}>
                    <i className="bi bi-clock" style={{ fontSize:11 }} />
                    {durationLabel(svc.duration)}
                  </span>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    {onSale ? (
                      <span>
                        <span style={{ fontSize:12, color:"var(--muted)", textDecoration:"line-through", marginRight:6 }}>
                          {svc.price.toFixed(2)} €
                        </span>
                        <span style={{ fontSize:18, fontWeight:800, color:"#f59e0b" }}>
                          {finalPrice!.toFixed(2)} €
                        </span>
                      </span>
                    ) : (
                      <span style={{ fontSize:18, fontWeight:800, color:"var(--primary)" }}>
                        {svc.price > 0 ? `${svc.price.toFixed(2)} €` : T("Consultar","On request","Sur devis")}
                      </span>
                    )}
                    <label style={{ display:"flex", alignItems:"center", gap:4, cursor:"pointer", fontSize:11, color:"var(--muted)" }}>
                      <input type="checkbox" checked={svc.active} onChange={() => toggleActive(svc.id)}
                        style={{ accentColor:"var(--primary)", cursor:"pointer" }} />
                      {labelActive}
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div style={{
          position:"fixed", inset:0, zIndex:1000,
          background:"rgba(0,0,0,0.55)", backdropFilter:"blur(4px)",
          display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem",
          overflowY:"auto",
        }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>

          <div className="section-card" style={{ width:"100%", maxWidth:500, padding:"2rem", animation:"slideIn 0.2s ease", margin:"auto" }}>
            <h3 style={{ marginBottom:"1.5rem", fontWeight:700, display:"flex", alignItems:"center", gap:10 }}>
              <i className="bi bi-briefcase-fill" style={{ color:"var(--primary)" }} />
              {editingId ? labelModalEdit : labelModalNew}
            </h3>

            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

              {/* Name */}
              <div>
                <label className="kpi-card__label" style={{ fontSize:11, marginBottom:6, display:"block" }}>{labelName}</label>
                <input type="text" className="input"
                  placeholder={T("Ej: Corte de pelo","E.g. Haircut","Ex : Coupe de cheveux")}
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  autoFocus />
              </div>

              {/* Price */}
              <div>
                <label className="kpi-card__label" style={{ fontSize:11, marginBottom:6, display:"block" }}>{labelPrice}</label>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <input type="number" className="input" min="0" step="0.01" placeholder="0.00"
                    value={form.price || ""}
                    onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
                    style={{ flex:1 }} />
                  <span style={{ fontSize:12, color:"var(--muted)", whiteSpace:"nowrap" }}>
                    {T("(0 = Consultar)","(0 = On request)","(0 = Sur devis)")}
                  </span>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="kpi-card__label" style={{ fontSize:11, marginBottom:6, display:"block" }}>{labelDuration}</label>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <select className="input" style={{ flex:1 }}
                    value={form.duration === null ? "indef" : "fixed"}
                    onChange={e => setForm(f => ({ ...f, duration: e.target.value === "indef" ? null : 30 }))}>
                    <option value="fixed">{T("Tiempo fijo","Fixed time","Temps fixe")}</option>
                    <option value="indef">{labelDurationIndef}</option>
                  </select>
                  {form.duration !== null && (
                    <input type="number" className="input" min="5" step="5"
                      value={form.duration || ""}
                      onChange={e => setForm(f => ({ ...f, duration: parseInt(e.target.value) || 30 }))}
                      style={{ width:90 }} />
                  )}
                  {form.duration !== null && <span style={{ fontSize:12, color:"var(--muted)" }}>min</span>}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="kpi-card__label" style={{ fontSize:11, marginBottom:6, display:"block" }}>{labelCat}</label>
                <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  <option value="">{labelNoCat}</option>
                  {cats.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="kpi-card__label" style={{ fontSize:11, marginBottom:6, display:"block" }}>{labelDesc}</label>
                <textarea className="input" rows={2} style={{ resize:"vertical" }}
                  placeholder={T("Describe brevemente el servicio...","Briefly describe the service...","Décrivez brièvement le service...")}
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              {/* ── Discount section ── */}
              <div style={{ borderTop:"1px solid var(--border)", paddingTop:14 }}>
                <button type="button"
                  onClick={() => setDiscountOpen(v => !v)}
                  style={{
                    background:"none", border:"none", cursor:"pointer",
                    fontSize:13, fontWeight:600,
                    color: discountOpen ? "var(--danger-text)" : "var(--primary)",
                    padding:0, display:"flex", alignItems:"center", gap:6,
                  }}>
                  <i className={`bi ${discountOpen ? "bi-x-circle" : "bi-tag-fill"}`} />
                  {discountOpen ? labelRemoveDisc : labelAddDiscount}
                </button>

                {discountOpen && (
                  <div style={{ display:"flex", flexDirection:"column", gap:12, marginTop:14 }}>

                    {/* Type */}
                    <div>
                      <label className="kpi-card__label" style={{ fontSize:11, marginBottom:6, display:"block" }}>{labelDiscType}</label>
                      <div style={{ display:"flex", gap:8 }}>
                        {(["percent","fixed"] as const).map(t => (
                          <button key={t} type="button"
                            onClick={() => setForm(f => ({ ...f, discountType: t }))}
                            style={{
                              flex:1, padding:"8px 0", borderRadius:"var(--r)",
                              border: `2px solid ${form.discountType === t ? "var(--primary)" : "var(--border)"}`,
                              background: form.discountType === t ? "rgba(99,102,241,0.08)" : "transparent",
                              cursor:"pointer", fontSize:13, fontWeight:600,
                              color: form.discountType === t ? "var(--primary)" : "var(--muted)",
                            }}>
                            {t === "percent" ? labelDiscPct : labelDiscFixed}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Value */}
                    <div>
                      <label className="kpi-card__label" style={{ fontSize:11, marginBottom:6, display:"block" }}>{labelDiscValue}</label>
                      <div style={{ position:"relative" }}>
                        <input type="number" className="input" min="0"
                          step={form.discountType === "percent" ? "1" : "0.01"}
                          max={form.discountType === "percent" ? "100" : undefined}
                          placeholder={form.discountType === "percent" ? "10" : "5.00"}
                          value={form.discountValue || ""}
                          onChange={e => setForm(f => ({ ...f, discountValue: parseFloat(e.target.value) || 0 }))}
                          style={{ paddingRight:40 }} />
                        <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", fontSize:13, fontWeight:700, color:"var(--muted)" }}>
                          {form.discountType === "percent" ? "%" : "€"}
                        </span>
                      </div>
                      {form.discountValue > 0 && form.price > 0 && (
                        <p style={{ fontSize:11, color:"#10b981", marginTop:4, fontWeight:600 }}>
                          {T("Precio final:","Final price:","Prix final:")} {discountedPrice({ ...form, id:"" } as Service)?.toFixed(2)} €
                        </p>
                      )}
                    </div>

                    {/* Promo label */}
                    <div>
                      <label className="kpi-card__label" style={{ fontSize:11, marginBottom:6, display:"block" }}>{labelDiscPromo}</label>
                      <input type="text" className="input"
                        placeholder={labelDiscPromoPlh}
                        value={form.discountLabel}
                        onChange={e => setForm(f => ({ ...f, discountLabel: e.target.value }))} />
                    </div>

                    {/* Until */}
                    <div>
                      <label className="kpi-card__label" style={{ fontSize:11, marginBottom:6, display:"block" }}>{labelDiscUntil}</label>
                      <input type="date" className="input"
                        value={form.discountUntil}
                        onChange={e => setForm(f => ({ ...f, discountUntil: e.target.value }))}
                        min={new Date().toISOString().split("T")[0]} />
                    </div>
                  </div>
                )}
              </div>

              {/* Active */}
              <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", fontSize:13 }}>
                <input type="checkbox" checked={form.active}
                  onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                  style={{ accentColor:"var(--primary)", width:16, height:16, cursor:"pointer" }} />
                {labelActive} — {labelVisCli}
              </label>
            </div>

            <div className="modal-actions" style={{ marginTop:"1.5rem" }}>
              <button className="secondary-btn" onClick={() => setShowModal(false)}>{labelCancel}</button>
              <button className="primary-btn" onClick={handleSave}
                disabled={!form.name.trim() || form.price < 0}>
                {labelSave}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteConfirm && (
        <div style={{
          position:"fixed", inset:0, zIndex:1100,
          background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)",
          display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem",
        }}
          onClick={e => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}>
          <div className="section-card" style={{ width:"100%", maxWidth:360, padding:"2rem", textAlign:"center" }}>
            <i className="bi bi-exclamation-triangle-fill" style={{ fontSize:40, color:"var(--danger-text)", display:"block", marginBottom:12 }} />
            <h4 style={{ fontWeight:700, marginBottom:8 }}>{labelConfDel}</h4>
            <p style={{ color:"var(--muted)", fontSize:13, marginBottom:"1.5rem" }}>{labelIrrev}</p>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setDeleteConfirm(null)}>{labelCancel}</button>
              <button className="primary-btn"
                style={{ background:"var(--danger-text)", boxShadow:"none" }}
                onClick={() => handleDelete(deleteConfirm)}>
                {labelDel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
