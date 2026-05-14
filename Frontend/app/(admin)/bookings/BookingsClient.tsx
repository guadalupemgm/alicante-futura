"use client";

import { useMemo, useState, useEffect } from "react";
import type { Booking, BookingStatus, CreateBookingDto, Business, Customer } from "@/lib/api";
import { createAppointment, deleteAppointment, updateAppointment, getBusinesses, getCustomers } from "@/lib/api";
import { useLanguage } from "@/components/context/LanguageContext";

export default function BookingsClient({ initialBookings }: { initialBookings: Booking[] }) {
  const { t } = useLanguage();
  const [bookings, setBookings]       = useState<Booking[]>(initialBookings);
  const [businesses, setBusinesses]   = useState<Business[]>([]);
  const [customers, setCustomers]     = useState<Customer[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>("all");
  const [isFormOpen, setIsFormOpen]   = useState(false);
  const [editingId, setEditingId]     = useState<number | null>(null);
  const [message, setMessage]         = useState<{ text: string; type: "success" | "error" } | null>(null);

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

  // 1. Estadísticas actualizadas con "cancelled"
  const stats = useMemo(() => ({
    total:     bookings.length,
    pending:   bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    paid: bookings.filter(b => b.status === "paid").length,
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

      {/* 2. Grid de KPIs con 5 elementos */}
      <div className="kpi-grid">
        {[
          { label: "Total", val: stats.total, sub: "Histórico", color: "var(--text)" },
          { label: "Pendientes", val: stats.pending, sub: "Por confirmar", color: "var(--warning-text)" },
          { label: "Confirmadas", val: stats.confirmed, sub: "En agenda", color: "var(--success-text)" },
          { label: "Pagadas", val: stats.paid, sub: "Completado", color: "var(--paid-text)" },
          { label: "Canceladas", val: stats.cancelled, sub: "Anuladas", color: "#ef4444" },
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
          {/* 3. Filtros actualizados */}
          <div className="filter-row">
            {["all", "pending", "confirmed", "paid", "cancelled"].map((f) => (
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
                    {b.status === "pending" && t("statusPending")}
                    {b.status === "confirmed" && t("statusConfirmed")}
                    {b.status === "paid" && t("statusPaid")}
                    {b.status === "cancelled" && (t("statusCancelled"))}
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
                    onClick={async () => {
                      if (confirm(t("confirmDelete"))) {
                        await deleteAppointment(b.id);
                        setBookings(bookings.filter(x => x.id !== b.id));
                      }
                    }}
                  >
                    {t("delete")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
                  <select className="select" value={form.businessId}
                    onChange={e => setForm({ ...form, businessId: Number(e.target.value) })} required>
                    <option value={0}>{t("selectBusiness")}</option>
                    {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="kpi-card__label" style={{ fontSize: "11px" }}>{t("clientLabel")}</label>
                  <select className="select" value={form.customerId}
                    onChange={e => setForm({ ...form, customerId: Number(e.target.value) })} required>
                    <option value={0}>{t("selectClient")}</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {/* 4. Select de Estado con 4 opciones */}
               <div>
  <label className="kpi-card__label" style={{ fontSize: "11px" }}>
    {t("statusLabel")}
  </label>
  <select
    className="select"
    value={form.status}
    onChange={e => setForm({ ...form, status: e.target.value as BookingStatus })}
  >
    <option value="pending">{t("statusPending")}</option>
    <option value="confirmed">{t("statusConfirmed")}</option>
    <option value="paid">{t("statusPaid")}</option>
    {/* Añadimos la opción cancelada respetando el formato anterior */}
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
    </div>
  );
}