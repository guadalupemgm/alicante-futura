"use client";

import { useMemo, useState, useEffect } from "react";
import type { Booking, BookingStatus, CreateBookingDto, Business, Customer } from "@/lib/api";
import { createAppointment, deleteAppointment, updateAppointment, getBusinesses, getCustomers } from "@/lib/api";

export default function BookingsClient({ initialBookings }: { initialBookings: Booking[] }) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

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
    total: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    paid: bookings.filter(b => b.status === "paid").length,
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
        setMessage({ text: "Cambios guardados con éxito", type: "success" });
      } else {
        const created = await createAppointment(form);
        setBookings([created, ...bookings]);
        setMessage({ text: "Cita programada correctamente", type: "success" });
      }
      setIsFormOpen(false);
      setEditingId(null);
    } catch {
      setMessage({ text: "No pudimos procesar la solicitud", type: "error" });
    }
  };

  return (
    <div className="admin-shell">
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h2 className="admin-header__title">Panel de Citas</h2>
            <div style={{ height: "20px" }}>
              {message && (
                <span className={`message-${message.type}`} style={{ fontSize: "12px" }}>
                  {message.type === "success" ? "● " : "○ "}{message.text}
                </span>
              )}
            </div>
          </div>

          <div className="admin-header__actions">
            <button
              className="primary-btn"
              onClick={() => {
                setEditingId(null);
                setForm({ date: "", time: "", status: "pending", customerId: 0, businessId: 0, serviceName: "" });
                setIsFormOpen(true);
              }}
            >
              + Nueva Reserva
            </button>
            <div className="admin-avatar">JD</div>
          </div>
        </header>

        <div className="admin-content">
          <div className="page-stack">

            <div className="kpi-grid">
              {[
                { label: "Total", val: stats.total, sub: "Histórico", color: "var(--text)" },
                { label: "Pendientes", val: stats.pending, sub: "Por confirmar", color: "var(--warning-text)" },
                { label: "Confirmadas", val: stats.confirmed, sub: "En agenda", color: "var(--success-text)" },
                { label: "Pagadas", val: stats.paid, sub: "Completado", color: "var(--paid-text)" },
              ].map((kpi, i) => (
                <div key={i} className="kpi-card" style={{ borderLeft: `4px solid ${kpi.color}` }}>
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
                  {["all", "pending", "confirmed", "paid"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setStatusFilter(f as any)}
                      className={`filter-pill filter-pill--${f} ${statusFilter === f ? "active" : ""}`}
                    >
                      {f === "all" ? "Ver todas" : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>SERVICIO</th>
                    <th>FECHA Y HORA</th>
                    <th>ESTADO</th>
                    <th style={{ textAlign: "right" }}>ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b.id} className="row-hover">
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--primary)" }}>{b.serviceName}</div>
                        <div style={{ fontSize: "12px", color: "var(--muted)" }}>ID Cliente: #{b.customerId}</div>
                      </td>
                      <td>
                        <div>{new Date(b.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</div>
                        <div style={{ fontSize: "12px", color: "var(--muted)" }}>{b.time} hs</div>
                      </td>
                      <td>
                        <span className={`badge badge--${b.status}`}>{b.status.toUpperCase()}</span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="secondary-btn bg-edit"
                          style={{ padding: "6px 12px", marginRight: "8px" }}
                          onClick={() => {
                            setEditingId(b.id);
                            setForm({
                              date: b.date, time: b.time, status: b.status,
                              customerId: b.customerId, businessId: b.businessId, serviceName: b.serviceName,
                            });
                            setIsFormOpen(true);
                          }}
                        >
                          Editar
                        </button>
                        <button
                          className="secondary-btn bg-delete"
                          style={{ padding: "6px 12px" }}
                          onClick={async () => {
                            if (confirm("¿Eliminar?")) {
                              await deleteAppointment(b.id);
                              setBookings(bookings.filter(x => x.id !== b.id));
                            }
                          }}
                        >
                          Borrar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {isFormOpen && (
          <div className="modal-backdrop">
            <div className="modal-card">
              <h3 className="modal-title">
                {editingId ? "Actualizar Cita" : "Nueva Reserva"}
              </h3>
              <p className="modal-text">Completa los campos para organizar la agenda.</p>

              <form onSubmit={handleSubmit}>
                <div className="page-stack">

                  <div className="input-group">
                    <label className="kpi-card__label" style={{ fontSize: "11px" }}>Servicio</label>
                    <input
                      className="input"
                      type="text"
                      value={form.serviceName}
                      onChange={e => setForm({ ...form, serviceName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-grid">
                    <div>
                      <label className="kpi-card__label" style={{ fontSize: "11px" }}>Fecha</label>
                      <input
                        className="input"
                        type="date"
                        value={form.date}
                        onChange={e => setForm({ ...form, date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label className="kpi-card__label" style={{ fontSize: "11px" }}>Hora</label>
                      <input
                        className="input"
                        type="time"
                        value={form.time}
                        onChange={e => setForm({ ...form, time: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="kpi-card__label" style={{ fontSize: "11px" }}>Negocio</label>
                    <select
                      className="select"
                      value={form.businessId}
                      onChange={e => setForm({ ...form, businessId: Number(e.target.value) })}
                      required
                    >
                      <option value={0}>Selecciona un negocio</option>
                      {businesses.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="kpi-card__label" style={{ fontSize: "11px" }}>Cliente</label>
                    <select
                      className="select"
                      value={form.customerId}
                      onChange={e => setForm({ ...form, customerId: Number(e.target.value) })}
                      required
                    >
                      <option value={0}>Selecciona un cliente</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="kpi-card__label" style={{ fontSize: "11px" }}>Estado de Pago</label>
                    <select
                      className="select"
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value as BookingStatus })}
                    >
                      <option value="pending">Pendiente</option>
                      <option value="confirmed">Confirmada</option>
                      <option value="paid">Pagada</option>
                    </select>
                  </div>

                  <div className="modal-actions" style={{ marginTop: "20px" }}>
                    <button type="button" className="secondary-btn" onClick={() => setIsFormOpen(false)}>
                      Cancelar
                    </button>
                    <button type="submit" className="primary-btn">
                      Finalizar
                    </button>
                  </div>

                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}