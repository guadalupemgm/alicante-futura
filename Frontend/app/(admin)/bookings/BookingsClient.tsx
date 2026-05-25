"use client";

import { useMemo, useState, useEffect } from "react";
import type { Booking, BookingStatus, CreateBookingDto, Business, Customer, CreateCustomerDto, CreateBusinessDto } from "@/lib/api";
import { createAppointment, deleteAppointment, updateAppointment, getBusinesses, getCustomers, createCustomer, createBusiness } from "@/lib/api";
import { useLanguage } from "@/components/context/LanguageContext";

export default function BookingsClient({ initialBookings }: { initialBookings: Booking[] }) {
  const { t } = useLanguage();
  const [bookings, setBookings]           = useState<Booking[]>(initialBookings);
  const [businesses, setBusinesses]       = useState<Business[]>([]);
  const [customers, setCustomers]         = useState<Customer[]>([]);
  const [statusFilter, setStatusFilter]   = useState<"all" | BookingStatus>("all");
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

  const filtered = useMemo(() =>
    statusFilter === "all" ? bookings : bookings.filter(b => b.status === statusFilter)
  , [bookings, statusFilter]);

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
      setSubModalError("Nombre, email y teléfono son obligatorios.");
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
      setMessage({ text: "Cliente creado correctamente", type: "success" });
    } catch {
      setSubModalError("Error al crear el cliente. Inténtalo de nuevo.");
    } finally {
      setSubModalLoading(false);
    }
  };

  const handleCreateBusiness = async () => {
    if (!newBusinessForm.name.trim() || !newBusinessForm.address.trim() || !newBusinessForm.ownerEmail.trim() || !newBusinessForm.ownerPassword.trim()) {
      setSubModalError("Nombre, dirección, email y contraseña del propietario son obligatorios.");
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
      setMessage({ text: "Negocio creado correctamente", type: "success" });
    } catch {
      setSubModalError("Error al crear el negocio. Inténtalo de nuevo.");
    } finally {
      setSubModalLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetId === null) return;
    try {
      await deleteAppointment(deleteTargetId);
      setBookings(bookings.filter(x => x.id !== deleteTargetId));
      setMessage({ text: "Reserva eliminada correctamente", type: "success" });
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
          { label: "Total",       val: stats.total,     sub: "Histórico",    color: "var(--text)" },
          { label: "Pendientes",  val: stats.pending,   sub: "Por confirmar", color: "var(--warning-text)" },
          { label: "Confirmadas", val: stats.confirmed, sub: "En agenda",    color: "var(--success-text)" },
          { label: "Pagadas",     val: stats.paid,      sub: "Completado",   color: "var(--paid-text)" },
          { label: "Canceladas",  val: stats.cancelled, sub: "Anuladas",     color: "#ef4444" },
        ].map((kpi, i) => (
          <div key={i} className="kpi-card" style={{ borderLeft: "4px solid " + kpi.color }}>
            <p className="kpi-card__label">{kpi.label}</p>
            <h3 className="kpi-card__value" style={{ color: kpi.color }}>{kpi.val}</h3>
            <p className="kpi-card__meta">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="section-card">
        <div className="panel-title-row">
          <h3 className="panel-title">Próximas Citas</h3>
          <div className="filter-row">
            {(["all", "pending", "confirmed", "paid", "cancelled"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={"filter-pill filter-pill--" + f + (statusFilter === f ? " active" : "")}
              >
                {f === "all" ? "Ver todas" :
                 f === "paid" ? "Pagadas" :
                 f === "cancelled" ? "Canceladas" :
                 f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>{t("serviceCol")}</th>
              <th>{t("dateTime")}</th>
              <th>{t("statusCol")}</th>
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
                  <div>{new Date(b.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</div>
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
            <h3 className="modal-title">Eliminar reserva</h3>
            <p className="modal-text">
              ¿Seguro que quieres eliminar la reserva #{deleteTargetId}? Esta acción no se puede deshacer.
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
                      + Nuevo
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
                      + Nuevo
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
            <h3 className="modal-title">Nuevo cliente</h3>
            <p className="modal-text">Rellena los datos del nuevo cliente. Se guardará automáticamente.</p>
            <div className="page-stack">
              <div>
                <label className="kpi-card__label" style={{ fontSize: "11px" }}>Nombre *</label>
                <input className="input" type="text" placeholder="Nombre completo"
                  value={newCustomerForm.name}
                  onChange={e => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })} />
              </div>
              <div>
                <label className="kpi-card__label" style={{ fontSize: "11px" }}>Email *</label>
                <input className="input" type="email" placeholder="correo@ejemplo.com"
                  value={newCustomerForm.email}
                  onChange={e => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })} />
              </div>
              <div>
                <label className="kpi-card__label" style={{ fontSize: "11px" }}>Teléfono *</label>
                <input className="input" type="tel" placeholder="612 345 678"
                  value={newCustomerForm.phone}
                  onChange={e => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })} />
              </div>
              <div>
                <label className="kpi-card__label" style={{ fontSize: "11px" }}>Negocio (opcional)</label>
                <input className="input" type="text" placeholder="Nombre del negocio"
                  value={newCustomerForm.business ?? ""}
                  onChange={e => setNewCustomerForm({ ...newCustomerForm, business: e.target.value })} />
              </div>
              {subModalError && (
                <p style={{ color: "#b91c1c", fontSize: "13px", margin: 0 }}>{subModalError}</p>
              )}
              <div className="modal-actions" style={{ marginTop: "16px" }}>
                <button type="button" className="secondary-btn" onClick={() => { setShowNewCustomer(false); setSubModalError(null); }}>
                  Cancelar
                </button>
                <button type="button" className="primary-btn" disabled={subModalLoading} onClick={handleCreateCustomer}>
                  {subModalLoading ? "Guardando..." : "Crear cliente"}
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
            <h3 className="modal-title">Nuevo negocio</h3>
            <p className="modal-text">Rellena los datos del nuevo negocio. Se guardará automáticamente.</p>
            <div className="page-stack">
              <div>
                <label className="kpi-card__label" style={{ fontSize: "11px" }}>Nombre *</label>
                <input className="input" type="text" placeholder="Nombre del negocio"
                  value={newBusinessForm.name}
                  onChange={e => setNewBusinessForm({ ...newBusinessForm, name: e.target.value })} />
              </div>
              <div>
                <label className="kpi-card__label" style={{ fontSize: "11px" }}>Dirección *</label>
                <input className="input" type="text" placeholder="Calle, número, ciudad"
                  value={newBusinessForm.address}
                  onChange={e => setNewBusinessForm({ ...newBusinessForm, address: e.target.value })} />
              </div>
              <div className="form-grid">
                <div>
                  <label className="kpi-card__label" style={{ fontSize: "11px" }}>Categoría</label>
                  <input className="input" type="text" placeholder="Peluquería, Spa..."
                    value={newBusinessForm.category ?? ""}
                    onChange={e => setNewBusinessForm({ ...newBusinessForm, category: e.target.value })} />
                </div>
                <div>
                  <label className="kpi-card__label" style={{ fontSize: "11px" }}>Teléfono</label>
                  <input className="input" type="tel" placeholder="612 345 678"
                    value={newBusinessForm.phone ?? ""}
                    onChange={e => setNewBusinessForm({ ...newBusinessForm, phone: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="kpi-card__label" style={{ fontSize: "11px" }}>Email del propietario *</label>
                <input className="input" type="email" placeholder="propietario@ejemplo.com"
                  value={newBusinessForm.ownerEmail}
                  onChange={e => setNewBusinessForm({ ...newBusinessForm, ownerEmail: e.target.value })} />
              </div>
              <div>
                <label className="kpi-card__label" style={{ fontSize: "11px" }}>Contraseña del propietario *</label>
                <input className="input" type="password" placeholder="Mínimo 6 caracteres"
                  value={newBusinessForm.ownerPassword}
                  onChange={e => setNewBusinessForm({ ...newBusinessForm, ownerPassword: e.target.value })} />
              </div>
              {subModalError && (
                <p style={{ color: "#b91c1c", fontSize: "13px", margin: 0 }}>{subModalError}</p>
              )}
              <div className="modal-actions" style={{ marginTop: "16px" }}>
                <button type="button" className="secondary-btn" onClick={() => { setShowNewBusiness(false); setSubModalError(null); }}>
                  Cancelar
                </button>
                <button type="button" className="primary-btn" disabled={subModalLoading} onClick={handleCreateBusiness}>
                  {subModalLoading ? "Guardando..." : "Crear negocio"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}