"use client";

import { useMemo, useState, useEffect } from "react";
import type { Booking, BookingStatus, CreateBookingDto, Business, Customer, CreateCustomerDto, CreateBusinessDto } from "@/lib/api";
import { createAppointment, deleteAppointment, updateAppointment, getBusinesses, getCustomers, createCustomer, createBusiness } from "@/lib/api";
import { useLanguage } from "@/components/context/LanguageContext";

export default function BookingsClient({ initialBookings }: { initialBookings: Booking[] }) {
  const { t, lang } = useLanguage();
  const [bookings, setBookings]           = useState<Booking[]>(initialBookings);
  const [businesses, setBusinesses]       = useState<Business[]>([]);
  const [customers, setCustomers]         = useState<Customer[]>([]);
  const [statusFilter, setStatusFilter]   = useState<"all" | BookingStatus>("all");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Booking | null; direction: "asc" | "desc" }>({ key: null, direction: "asc" });
  const handleSort = (key: keyof Booking) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };
  const [isFormOpen, setIsFormOpen]       = useState(false);
  const [editingId, setEditingId]         = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [message, setMessage]             = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Sub-modales de creación rápida
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [showNewBusiness, setShowNewBusiness] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState<CreateCustomerDto>({ name: "", email: "", phone: "", business: "" });
  const [newBusinessForm, setNewBusinessForm] = useState<CreateBusinessDto>({ name: "", address: "", category: "", phone: "", status: "active", ownerEmail: "", ownerPassword: "" });
  const [subModalError, setSubModalError] = useState<string | null>(null);
  const [subModalLoading, setSubModalLoading] = useState(false);

  const [form, setForm] = useState<CreateBookingDto>({
    date: "", time: "", status: "pending", customerId: 0, businessId: 0, serviceName: "",
  });

  useEffect(() => {
    getBusinesses().then(setBusinesses).catch(console.error);
    getCustomers().then(setCustomers).catch(console.error);
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const stats = useMemo(() => ({
    total:     bookings.length,
    pending:   bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    paid:      bookings.filter(b => b.status === "paid").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
  }), [bookings]);
  const filtered = useMemo(() => {
    // 1. Filtrar primero
    let data = statusFilter === "all" 
      ? [...bookings] 
      : bookings.filter(b => b.status === statusFilter);
    
    // 2. Ordenar después
    if (sortConfig.key) {
      data.sort((a, b) => {
        // Obtenemos los valores de forma segura y los convertimos a string
        const valA = String(a[sortConfig.key!] ?? "").toLowerCase();
        const valB = String(b[sortConfig.key!] ?? "").toLowerCase();
        
        if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
        if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [bookings, statusFilter, sortConfig]);

  const conflictIds = useMemo(() => {
    const ids = new Set<number>();
    for (let i = 0; i < bookings.length; i++) {
      const b1 = bookings[i];
      if (b1.status === "cancelled") continue;
      for (let j = i + 1; j < bookings.length; j++) {
        const b2 = bookings[j];
        if (b2.status === "cancelled") continue;
        if (
          b1.date === b2.date &&
          b1.time === b2.time &&
          b1.businessId === b2.businessId
        ) {
          ids.add(b1.id);
          ids.add(b2.id);
        }
      }
    }
    return ids;
  }, [bookings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        const updated = await updateAppointment(editingId, form);
        setBookings(bookings.map(b => b.id === editingId ? updated : b));
        setMessage({ text: t("savedOk"), type: "success" });
      } else {
        const created = await createAppointment(form);
        setBookings([created, ...bookings]);
        setMessage({ text: t("createdOk"), type: "success" });
      }
      setIsFormOpen(false);
      setEditingId(null);
    } catch {
      setMessage({ text: t("errorMsg"), type: "error" });
    }
  };

  const handleCreateCustomer = async () => {
    if (!newCustomerForm.name.trim() || !newCustomerForm.email.trim() || !newCustomerForm.phone.trim()) {
      setSubModalError(t("quickCustomerValidation"));
      return;
    }
    setSubModalLoading(true);
    setSubModalError(null);
    try {
      const created = await createCustomer(newCustomerForm);
      setCustomers(prev => [...prev, created]);
      setForm(f => ({ ...f, customerId: created.id }));
      setShowNewCustomer(false);
      setNewCustomerForm({ name: "", email: "", phone: "", business: "" });
      setMessage({ text: t("quickCustomerCreated"), type: "success" });
    } catch {
      setSubModalError(t("quickCustomerError"));
    } finally {
      setSubModalLoading(false);
    }
  };

  const handleCreateBusiness = async () => {
    if (!newBusinessForm.name.trim() || !newBusinessForm.address.trim() || !newBusinessForm.ownerEmail.trim() || !newBusinessForm.ownerPassword.trim()) {
      setSubModalError(t("quickBusinessValidation"));
      return;
    }
    setSubModalLoading(true);
    setSubModalError(null);
    try {
      const created = await createBusiness(newBusinessForm);
      setBusinesses(prev => [...prev, created]);
      setForm(f => ({ ...f, businessId: created.id }));
      setShowNewBusiness(false);
      setNewBusinessForm({ name: "", address: "", category: "", phone: "", status: "active", ownerEmail: "", ownerPassword: "" });
      setMessage({ text: t("quickBusinessCreated"), type: "success" });
    } catch {
      setSubModalError(t("quickBusinessError"));
    } finally {
      setSubModalLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetId === null) return;
    try {
      await deleteAppointment(deleteTargetId);
      setBookings(bookings.filter(x => x.id !== deleteTargetId));
      setMessage({ text: t("deletedOk"), type: "success" });
    } catch {
      setMessage({ text: t("errorMsg"), type: "error" });
    } finally {
      setDeleteTargetId(null);
    }
  };

  return (
    <div className="page-stack">

      <div className="page-hero">
        <div>
          <h2>{t("bookingsTitle")}</h2>
          {message && (
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: message.type === "success" ? "#15803d" : "#b91c1c" }}>
              {message.text}
            </p>
          )}
        </div>
        <button
          className="primary-btn"
          onClick={() => {
            setEditingId(null);
            setForm({ date: "", time: "", status: "pending", customerId: 0, businessId: 0, serviceName: "" });
            setIsFormOpen(true);
          }}
        >
          {t("newBooking")}
        </button>
      </div>

      <div className="kpi-grid">
        {[
          { label: t("total"),      val: stats.total,     sub: t("historical"),  color: "var(--text)" },
          { label: t("pending"),    val: stats.pending,   sub: t("pendingSub"),  color: "var(--warning-text)" },
          { label: t("confirmed"),  val: stats.confirmed, sub: t("inAgenda"),    color: "var(--success-text)" },
          { label: t("paid"),       val: stats.paid,      sub: t("completed"),   color: "var(--paid-text)" },
          { label: t("kpiCancelled"), val: stats.cancelled, sub: t("kpiCancelledSub"), color: "#ef4444" },
        ].map((kpi, i) => (
          <div key={i} className="kpi-card" style={{ borderLeft: "4px solid " + kpi.color }}>
            <p className="kpi-card__label">{kpi.label}</p>
            <h3 className="kpi-card__value" style={{ color: kpi.color }}>{kpi.val}</h3>
            <p className="kpi-card__meta">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {conflictIds.size > 0 && (
        <div style={{
          background: "rgba(239, 68, 68, 0.08)",
          border: "1px solid rgba(239, 68, 68, 0.2)",
          borderRadius: "var(--r-md)",
          padding: "16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          color: "#b91c1c",
          marginBottom: "16px"
        }}>
          <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: "20px" }} />
          <div>
            <h4 style={{ margin: 0, fontWeight: 700, fontSize: "14px" }}>
              {lang.code === "es" ? "Conflictos detectados" : "Conflicts detected"}
            </h4>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "rgba(185, 28, 28, 0.85)" }}>
              {lang.code === "es"
                ? `Se han detectado ${conflictIds.size} citas programadas a la misma hora en el mismo negocio.`
                : `We detected ${conflictIds.size} appointments scheduled at the same time in the same business.`}
            </p>
          </div>
        </div>
      )}

      <div className="section-card">
        <div className="panel-title-row">
          <h3 className="panel-title">{t("upcomingAppointmentsPanel")}</h3>
          <div className="filter-row">
            {(["all", "pending", "confirmed", "paid", "cancelled"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={"filter-pill filter-pill--" + f + (statusFilter === f ? " active" : "")}
              >
                {f === "all"       ? t("filterAll") :
                 f === "pending"   ? t("statusPending") :
                 f === "confirmed" ? t("statusConfirmed") :
                 f === "paid"      ? t("filterPaid") :
                                    t("filterCancelled")}
              </button>
            ))}
          </div>
        </div>

        <table className="data-table">
        <thead>
          <tr>
            <th style={{ cursor: "pointer" }} onClick={() => handleSort("serviceName")}>
              {t("serviceCol")} <span style={{ marginLeft: "8px", opacity: 0.5 }}>↕</span>
            </th>
            <th style={{ cursor: "pointer" }} onClick={() => handleSort("date")}>
              {t("dateTime")} <span style={{ marginLeft: "8px", opacity: 0.5 }}>↕</span>
            </th>
            <th style={{ cursor: "pointer" }} onClick={() => handleSort("status")}>
              {t("statusCol")} <span style={{ marginLeft: "8px", opacity: 0.5 }}>↕</span>
            </th>
            <th style={{ textAlign: "right" }}>{t("actionsCol")}</th>
          </tr>
        </thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{b.serviceName}</div>
                  <div style={{ fontSize: "12px", color: "var(--muted)" }}>{t("clientId")}: #{b.customerId}</div>
                </td>
                <td>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div>{new Date(b.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</div>
                    {conflictIds.has(b.id) && (
                      <span 
                        title={lang.code === "es" ? "Conflicto: Hay otra cita a esta misma hora" : "Conflict: Another appointment is at the same time"}
                        style={{
                          background: "#ef4444",
                          color: "#fff",
                          borderRadius: "4px",
                          padding: "2px 6px",
                          fontSize: "10px",
                          fontWeight: 700,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "3px"
                        }}
                      >
                        <i className="bi bi-exclamation-circle-fill" />
                        {lang.code === "es" ? "Conflicto" : "Conflict"}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--muted)" }}>{b.time} hs</div>
                </td>
                <td>
                  <span className={"badge badge--" + b.status}>
                    {b.status === "pending"   && t("statusPending")}
                    {b.status === "confirmed" && t("statusConfirmed")}
                    {b.status === "paid"      && t("statusPaid")}
                    {b.status === "cancelled" && t("statusCancelled")}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <button
                    className="secondary-btn"
                    style={{ padding: "6px 12px", marginRight: "8px" }}
                    onClick={() => {
                      setEditingId(b.id);
                      setForm({ date: b.date, time: b.time, status: b.status, customerId: b.customerId, businessId: b.businessId, serviceName: b.serviceName });
                      setIsFormOpen(true);
                    }}
                  >
                    {t("edit")}
                  </button>
                  <button
                    className="secondary-btn"
                    style={{ padding: "6px 12px" }}
                    onClick={() => setDeleteTargetId(b.id)}
                  >
                    {t("delete")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de confirmación de borrado */}
      {deleteTargetId !== null && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-icon">!</div>
            <h3 className="modal-title">{t("deleteModalTitle")}</h3>
            <p className="modal-text">
              {t("deleteModalText")} #{deleteTargetId}? {t("deleteModalUndo")}
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setDeleteTargetId(null)}
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                className="danger-btn"
                onClick={handleConfirmDelete}
              >
                {t("delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de formulario */}
      {isFormOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3 className="modal-title">
              {editingId ? t("updateAppointment") : t("newAppointment")}
            </h3>
            <p className="modal-text">{t("fillFields")}</p>
            <form onSubmit={handleSubmit}>
              <div className="page-stack">
                <div>
                  <label className="kpi-card__label" style={{ fontSize: "11px" }}>{t("serviceLabel")}</label>
                  <input className="input" type="text" value={form.serviceName}
                    onChange={e => setForm({ ...form, serviceName: e.target.value })} required />
                </div>
                <div className="form-grid">
                  <div>
                    <label className="kpi-card__label" style={{ fontSize: "11px" }}>{t("dateLabel")}</label>
                    <input className="input" type="date" value={form.date}
                      onChange={e => setForm({ ...form, date: e.target.value })} required />
                  </div>
                  <div>
                    <label className="kpi-card__label" style={{ fontSize: "11px" }}>{t("timeLabel")}</label>
                    <input className="input" type="time" value={form.time}
                      onChange={e => setForm({ ...form, time: e.target.value })} required />
                  </div>
                </div>
                <div>
                  <label className="kpi-card__label" style={{ fontSize: "11px" }}>{t("businessLabel")}</label>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <select className="select" style={{ flex: 1 }} value={form.businessId}
                      onChange={e => setForm({ ...form, businessId: Number(e.target.value) })} required>
                      <option value={0}>{t("selectBusiness")}</option>
                      {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                    <button
                      type="button"
                      className="secondary-btn"
                      style={{ padding: "6px 10px", whiteSpace: "nowrap", fontSize: "12px" }}
                      onClick={() => { setSubModalError(null); setShowNewBusiness(true); }}
                    >
                      {t("quickAddNew")}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="kpi-card__label" style={{ fontSize: "11px" }}>{t("clientLabel")}</label>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <select className="select" style={{ flex: 1 }} value={form.customerId}
                      onChange={e => setForm({ ...form, customerId: Number(e.target.value) })} required>
                      <option value={0}>{t("selectClient")}</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button
                      type="button"
                      className="secondary-btn"
                      style={{ padding: "6px 10px", whiteSpace: "nowrap", fontSize: "12px" }}
                      onClick={() => { setSubModalError(null); setShowNewCustomer(true); }}
                    >
                      {t("quickAddNew")}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="kpi-card__label" style={{ fontSize: "11px" }}>{t("statusLabel")}</label>
                  <select className="select" value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value as BookingStatus })}>
                    <option value="pending">{t("statusPending")}</option>
                    <option value="confirmed">{t("statusConfirmed")}</option>
                    <option value="paid">{t("statusPaid")}</option>
                    <option value="cancelled">{t("statusCancelled")}</option>
                  </select>
                </div>
                <div className="modal-actions" style={{ marginTop: "20px" }}>
                  <button type="button" className="secondary-btn" onClick={() => setIsFormOpen(false)}>
                    {t("cancel")}
                  </button>
                  <button type="submit" className="primary-btn">
                    {t("finish")}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sub-modal: Nuevo Cliente */}
      {showNewCustomer && (
        <div className="modal-backdrop" style={{ zIndex: 9999 }}>
          <div className="modal-card" style={{ maxWidth: "420px" }}>
            <h3 className="modal-title">{t("quickNewCustomer")}</h3>
            <p className="modal-text">{t("quickNewCustomerDesc")}</p>
            <div className="page-stack">
              <div>
                <label className="kpi-card__label" style={{ fontSize: "11px" }}>{t("quickNameLabel")}</label>
                <input className="input" type="text" placeholder={t("quickNamePlaceholder")}
                  value={newCustomerForm.name}
                  onChange={e => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })} />
              </div>
              <div>
                <label className="kpi-card__label" style={{ fontSize: "11px" }}>{t("quickEmailLabel")}</label>
                <input className="input" type="email" placeholder={t("quickEmailPlaceholder")}
                  value={newCustomerForm.email}
                  onChange={e => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })} />
              </div>
              <div>
                <label className="kpi-card__label" style={{ fontSize: "11px" }}>{t("quickPhoneLabel")}</label>
                <input className="input" type="tel" placeholder={t("quickPhonePlaceholder")}
                  value={newCustomerForm.phone}
                  onChange={e => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })} />
              </div>
              <div>
                <label className="kpi-card__label" style={{ fontSize: "11px" }}>{t("quickBusinessOptLabel")}</label>
                <input className="input" type="text" placeholder={t("quickBusinessPlaceholder")}
                  value={newCustomerForm.business ?? ""}
                  onChange={e => setNewCustomerForm({ ...newCustomerForm, business: e.target.value })} />
              </div>
              {subModalError && (
                <p style={{ color: "#b91c1c", fontSize: "13px", margin: 0 }}>{subModalError}</p>
              )}
              <div className="modal-actions" style={{ marginTop: "16px" }}>
                <button type="button" className="secondary-btn" onClick={() => { setShowNewCustomer(false); setSubModalError(null); }}>
                  {t("cancel")}
                </button>
                <button type="button" className="primary-btn" disabled={subModalLoading} onClick={handleCreateCustomer}>
                  {subModalLoading ? t("quickSaving") : t("quickCreateCustomer")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-modal: Nuevo Negocio */}
      {showNewBusiness && (
        <div className="modal-backdrop" style={{ zIndex: 9999 }}>
          <div className="modal-card" style={{ maxWidth: "420px" }}>
            <h3 className="modal-title">{t("quickNewBusiness")}</h3>
            <p className="modal-text">{t("quickNewBusinessDesc")}</p>
            <div className="page-stack">
              <div>
                <label className="kpi-card__label" style={{ fontSize: "11px" }}>{t("quickNameLabel")}</label>
                <input className="input" type="text" placeholder={t("nameBusiness")}
                  value={newBusinessForm.name}
                  onChange={e => setNewBusinessForm({ ...newBusinessForm, name: e.target.value })} />
              </div>
              <div>
                <label className="kpi-card__label" style={{ fontSize: "11px" }}>{t("quickAddressLabel")}</label>
                <input className="input" type="text" placeholder={t("quickAddressPlaceholder")}
                  value={newBusinessForm.address}
                  onChange={e => setNewBusinessForm({ ...newBusinessForm, address: e.target.value })} />
              </div>
              <div className="form-grid">
                <div>
                  <label className="kpi-card__label" style={{ fontSize: "11px" }}>{t("quickCategoryLabel")}</label>
                  <input className="input" type="text" placeholder={t("quickCategoryPlaceholder")}
                    value={newBusinessForm.category ?? ""}
                    onChange={e => setNewBusinessForm({ ...newBusinessForm, category: e.target.value })} />
                </div>
                <div>
                  <label className="kpi-card__label" style={{ fontSize: "11px" }}>{t("quickPhoneLabel")}</label>
                  <input className="input" type="tel" placeholder={t("quickPhonePlaceholder")}
                    value={newBusinessForm.phone ?? ""}
                    onChange={e => setNewBusinessForm({ ...newBusinessForm, phone: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="kpi-card__label" style={{ fontSize: "11px" }}>{t("quickOwnerEmailLabel")}</label>
                <input className="input" type="email" placeholder={t("quickOwnerEmailPlaceholder")}
                  value={newBusinessForm.ownerEmail}
                  onChange={e => setNewBusinessForm({ ...newBusinessForm, ownerEmail: e.target.value })} />
              </div>
              <div>
                <label className="kpi-card__label" style={{ fontSize: "11px" }}>{t("quickOwnerPassLabel")}</label>
                <input className="input" type="password" placeholder={t("quickOwnerPassPlaceholder")}
                  value={newBusinessForm.ownerPassword}
                  onChange={e => setNewBusinessForm({ ...newBusinessForm, ownerPassword: e.target.value })} />
              </div>
              {subModalError && (
                <p style={{ color: "#b91c1c", fontSize: "13px", margin: 0 }}>{subModalError}</p>
              )}
              <div className="modal-actions" style={{ marginTop: "16px" }}>
                <button type="button" className="secondary-btn" onClick={() => { setShowNewBusiness(false); setSubModalError(null); }}>
                  {t("cancel")}
                </button>
                <button type="button" className="primary-btn" disabled={subModalLoading} onClick={handleCreateBusiness}>
                  {subModalLoading ? t("quickSaving") : t("quickCreateBusiness")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}