"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import type { Booking, BookingStatus, Customer } from "@/lib/api";
import { getCustomers, updateAppointment, createAppointment } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const STATUS_LABELS: Record<BookingStatus | "all", string> = {
  all: "Todas",
  pending: "Pendiente",
  confirmed: "Confirmada",
  paid: "Pagada",
};

const NEXT_STATUS: Record<BookingStatus, { label: string; next: BookingStatus } | null> = {
  pending: { label: "Confirmar", next: "confirmed" },
  confirmed: { label: "Marcar pagada", next: "paid" },
  paid: null,
};

export default function BusinessBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>("all");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    serviceName: "",
    date: "",
    time: "",
    status: "pending" as BookingStatus,
    customerId: 0,
  });

  const [creatingCustomer, setCreatingCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "" });
  const [savingCustomer, setSavingCustomer] = useState(false);

  useEffect(() => {
    if (!user?.businessId) return;
    Promise.all([
      fetch(`${API_URL}/appointments/business/${user.businessId}`).then((r) => r.json()),
      getCustomers(),
    ])
      .then(([appts, custs]) => {
        setBookings(Array.isArray(appts) ? appts : []);
        setCustomers(Array.isArray(custs) ? custs : []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [user]);

  const showMsg = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleStatusChange = async (booking: Booking, next: BookingStatus) => {
    try {
      const updated = await updateAppointment(booking.id, { status: next });
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? updated : b)));
      showMsg("Estado actualizado correctamente", "success");
    } catch {
      showMsg("No se pudo actualizar el estado", "error");
    }
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.name.trim()) return;
    setSavingCustomer(true);
    try {
      const res = await fetch(`${API_URL}/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCustomer.name,
          phone: newCustomer.phone || "-",
          email: `sin-email-${Date.now()}@placeholder.com`,
        }),
      });
      if (!res.ok) throw new Error();
      const created: Customer = await res.json();
      setCustomers((prev) => [...prev, created]);
      setForm((f) => ({ ...f, customerId: created.id }));
      setCreatingCustomer(false);
      setNewCustomer({ name: "", phone: "" });
      showMsg(`Cliente "${created.name}" creado y seleccionado`, "success");
    } catch {
      showMsg("No se pudo crear el cliente", "error");
    } finally {
      setSavingCustomer(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.businessId) return;
    try {
      const created = await createAppointment({ ...form, businessId: user.businessId });
      setBookings((prev) => [created, ...prev]);
      setShowForm(false);
      setForm({ serviceName: "", date: "", time: "", status: "pending", customerId: 0 });
      showMsg("Reserva creada correctamente", "success");
    } catch {
      showMsg("No se pudo crear la reserva", "error");
    }
  };

  const stats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    paid: bookings.filter((b) => b.status === "paid").length,
  }), [bookings]);

  const filtered = useMemo(() => {
    let list = statusFilter === "all" ? bookings : bookings.filter((b) => b.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((b) =>
        b.serviceName.toLowerCase().includes(q) || String(b.customerId).includes(q)
      );
    }
    return list;
  }, [bookings, statusFilter, search]);

  const customerName = (id: number) => customers.find((c) => c.id === id)?.name ?? `#${id}`;

  if (!user) return null;

  return (
    <div className="page-stack">

      <div className="page-hero">
        <div>
          <h2>Mis Reservas</h2>
          {message && (
            <p style={{ marginTop: 4, fontSize: 13, color: message.type === "success" ? "green" : "red" }}>
              {message.text}
            </p>
          )}
        </div>
        <button className="primary-btn" onClick={() => setShowForm(true)}>
          + Nueva Reserva
        </button>
      </div>

      <div className="kpi-grid">
        {[
          { label: "Total", val: stats.total, sub: "Historico", color: "var(--text)" },
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
          <h3 className="panel-title">Listado de citas</h3>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            <input
              className="input"
              style={{ width: 200, padding: "6px 12px", fontSize: 13 }}
              placeholder="Buscar servicio o cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="filter-row">
              {(["all", "pending", "confirmed", "paid"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`filter-pill filter-pill--${f}${statusFilter === f ? " active" : ""}`}
                >
                  {STATUS_LABELS[f]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading && <p style={{ color: "var(--muted)", padding: "2rem", textAlign: "center" }}>Cargando reservas...</p>}
        {error && <p style={{ color: "red", padding: "1rem" }}>{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>
            <i className="bi bi-calendar-x" style={{ fontSize: "2rem" }}></i>
            <p style={{ marginTop: "0.75rem" }}>No hay reservas con estos filtros.</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <table className="data-table">
            <thead>
              <tr>
                <th>SERVICIO</th>
                <th>CLIENTE</th>
                <th>FECHA</th>
                <th>HORA</th>
                <th>ESTADO</th>
                <th style={{ textAlign: "right" }}>ACCION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => {
                const nextStatus = NEXT_STATUS[b.status];
                return (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600 }}>{b.serviceName}</td>
                    <td>{customerName(b.customerId)}</td>
                    <td>
                      {new Date(b.date).toLocaleDateString("es-ES", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </td>
                    <td>{b.time} hs</td>
                    <td>
                      <span className={`badge badge--${b.status}`}>{STATUS_LABELS[b.status]}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {nextStatus ? (
                        <button
                          className="secondary-btn"
                          style={{ padding: "6px 12px" }}
                          onClick={() => handleStatusChange(b, nextStatus.next)}
                        >
                          {nextStatus.label}
                        </button>
                      ) : (
                        <span style={{ color: "var(--muted)", fontSize: 12 }}>Completada</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3 className="modal-title">Nueva Reserva</h3>
            <p className="modal-text">Rellena los datos de la reserva.</p>

            <form onSubmit={handleCreate}>
              <div className="page-stack">

                <div>
                  <label className="kpi-card__label" style={{ fontSize: 11 }}>Servicio</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="Ej: Corte de pelo"
                    value={form.serviceName}
                    onChange={(e) => setForm({ ...form, serviceName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-grid">
                  <div>
                    <label className="kpi-card__label" style={{ fontSize: 11 }}>Fecha</label>
                    <input
                      className="input"
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="kpi-card__label" style={{ fontSize: 11 }}>Hora</label>
                    <input
                      className="input"
                      type="time"
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Cliente */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <label className="kpi-card__label" style={{ fontSize: 11 }}>Cliente</label>
                    <button
                      type="button"
                      onClick={() => setCreatingCustomer(!creatingCustomer)}
                      style={{
                        fontSize: 12,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--primary, #6366f1)",
                        fontWeight: 600,
                        padding: 0,
                      }}
                    >
                      {creatingCustomer ? "✕ Cancelar nuevo" : "+ Nuevo cliente"}
                    </button>
                  </div>

                  {/* Mini formulario nuevo cliente — aparece encima del select */}
                  {creatingCustomer && (
                    <div style={{
                      background: "var(--surface-2, #1e1e2e)",
                      borderRadius: 8,
                      padding: "0.85rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      border: "1px solid var(--border)",
                      marginBottom: "0.5rem",
                    }}>
                      <input
                        className="input"
                        type="text"
                        placeholder="Nombre *"
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                      />
                      <input
                        className="input"
                        type="tel"
                        placeholder="Telefono (opcional)"
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      />
                      <button
                        type="button"
                        className="primary-btn"
                        disabled={savingCustomer || !newCustomer.name.trim()}
                        onClick={handleCreateCustomer}
                        style={{ width: "100%" }}
                      >
                        {savingCustomer ? "Guardando..." : "Guardar y seleccionar"}
                      </button>
                    </div>
                  )}

                  <select
                    className="select"
                    value={form.customerId}
                    onChange={(e) => setForm({ ...f => f, customerId: Number(e.target.value) })}
                    required
                  >
                    <option value={0}>Selecciona un cliente</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="kpi-card__label" style={{ fontSize: 11 }}>Estado inicial</label>
                  <select
                    className="select"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as BookingStatus })}
                  >
                    <option value="pending">Pendiente</option>
                    <option value="confirmed">Confirmada</option>
                  </select>
                </div>

                <div className="modal-actions" style={{ marginTop: 20 }}>
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() => {
                      setShowForm(false);
                      setCreatingCustomer(false);
                      setNewCustomer({ name: "", phone: "" });
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="primary-btn"
                    disabled={form.customerId === 0}
                  >
                    Crear reserva
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