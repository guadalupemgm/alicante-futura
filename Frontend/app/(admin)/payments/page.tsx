"use client";

import { useState, useEffect } from "react";

type PaymentStatus = "pending" | "paid";

type Payment = {
  id: number;
  amount: number;
  method: string;
  status: PaymentStatus;
  appointmentId: number;
};

type Appointment = {
  id: number;
  date: string;
  time: string;
  serviceName: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function Badge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`badge badge--${status === "pending" ? "pending" : "confirmed"}`}>
      {status === "pending" ? "Por cobrar" : "Pagado"}
    </span>
  );
}

const FILTERS = [
  { key: "all", label: "Ver todos", className: "filter-pill--all" },
  { key: "pending", label: "Pendientes", className: "filter-pill--pending" },
  { key: "paid", label: "Pagados", className: "filter-pill--paid" },
];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | PaymentStatus>("all");
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    amount: "",
    method: "",
    status: "pending",
    appointmentId: "",
  });

  useEffect(() => {
    fetch(`${API_URL}/payments`)
      .then((r) => r.json())
      .then((d) => setPayments(Array.isArray(d) ? d : []));

    fetch(`${API_URL}/appointments`)
      .then((r) => r.json())
      .then((d) => setAppointments(Array.isArray(d) ? d : []));
  }, []);

  const handleCreate = async () => {
    const res = await fetch(`${API_URL}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: parseFloat(form.amount),
        method: form.method,
        status: form.status,
        appointmentId: parseInt(form.appointmentId),
      }),
    });
    if (res.ok) {
      const newPayment = await res.json();
      setPayments([...payments, newPayment]);
      setShowModal(false);
      setForm({ amount: "", method: "", status: "pending", appointmentId: "" });
      setSuccess("Cobro registrado correctamente");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const handleStatusChange = async (id: number, newStatus: PaymentStatus) => {
    const res = await fetch(`${API_URL}/payments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setPayments(payments.map(p => p.id === id ? { ...p, status: newStatus } : p));
    }
  };

  const filtered = statusFilter === "all"
    ? payments
    : payments.filter(p => p.status === statusFilter);

  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>Payments</h2>
          <p>Seguimiento de cobros realizados y pendientes.</p>
        </div>
        <button className="primary-btn" type="button" onClick={() => setShowModal(true)}>
          Registrar cobro
        </button>
      </section>

      {success && <p style={{ color: "green" }}>{success}</p>}

      <section className="kpi-grid">
        <div className="kpi-card">
          <p className="kpi-card__label">Cobrado</p>
          <h3 className="kpi-card__value">{totalPaid.toFixed(2)} €</h3>
          <p className="kpi-card__meta kpi-card__meta--positive">
            {payments.filter((p) => p.status === "paid").length} operaciones
          </p>
        </div>
        <div className="kpi-card">
          <p className="kpi-card__label">Pendiente</p>
          <h3 className="kpi-card__value">{totalPending.toFixed(2)} €</h3>
          <p className="kpi-card__meta kpi-card__meta--warning">
            {payments.filter((p) => p.status === "pending").length} por revisar
          </p>
        </div>
      </section>

      <section className="section-card">
        <div className="panel-title-row">
          <h3 className="panel-title">Listado de cobros</h3>
          <div className="filter-row">
            {FILTERS.map((f) => {
              const isActive = statusFilter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setStatusFilter(f.key as "all" | PaymentStatus)}
                  className={`filter-pill ${f.className} ${isActive ? "active" : ""}`}
                >
                  {f.label}
                  {f.key !== "all" && (
                    <span className="filter-pill__count">
                      {payments.filter(p => p.status === f.key).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p style={{ color: "var(--muted)", textAlign: "center", padding: "32px 0" }}>
            No hay cobros en esta categoría
          </p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Importe</th>
                <th>Método</th>
                <th>Reserva</th>
                <th>Estado</th>
                <th style={{ textAlign: "right" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>COB-{String(p.id).padStart(3, "0")}</td>
                  <td>{Number(p.amount).toFixed(2)} €</td>
                  <td>{p.method}</td>
                  <td>#{p.appointmentId}</td>
                  <td><Badge status={p.status} /></td>
                  <td style={{ textAlign: "right" }}>
                    {p.status === "pending" ? (
                      <button
                        className="primary-btn"
                        style={{ padding: "4px 12px", fontSize: "12px" }}
                        onClick={() => handleStatusChange(p.id, "paid")}
                      >
                        Marcar pagado
                      </button>
                    ) : (
                      <button
                        className="secondary-btn"
                        style={{ padding: "4px 12px", fontSize: "12px" }}
                        onClick={() => handleStatusChange(p.id, "pending")}
                      >
                        Marcar pendiente
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3 className="modal-title">Registrar cobro</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <input
                className="input"
                type="number"
                placeholder="Importe (€)"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
              <select
                className="input"
                value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value })}
              >
                <option value="">Método de pago</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Bizum">Bizum</option>
                <option value="Transferencia">Transferencia</option>
              </select>
              <select
                className="input"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="pending">Por cobrar</option>
                <option value="paid">Pagado</option>
              </select>
              <select
                className="input"
                value={form.appointmentId}
                onChange={(e) => setForm({ ...form, appointmentId: e.target.value })}
              >
                <option value="">Selecciona una reserva</option>
                {appointments.map((a) => (
                  <option key={a.id} value={a.id}>
                    #{a.id} — {a.date} {a.time} · {a.serviceName}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="primary-btn" onClick={handleCreate}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}