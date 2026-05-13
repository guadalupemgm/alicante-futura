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

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
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
          <span style={{ color: "#6b7280", fontSize: 14 }}>{payments.length} resultados</span>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Importe</th>
              <th>Método</th>
              <th>Reserva</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>COB-{String(p.id).padStart(3, "0")}</td>
                <td>{Number(p.amount).toFixed(2)} €</td>
                <td>{p.method}</td>
                <td>#{p.appointmentId}</td>
                <td><Badge status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {showModal && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
        }}>
          <div style={{ background: "white", padding: "2rem", borderRadius: "8px", minWidth: "360px" }}>
            <h3 style={{ marginBottom: "1rem" }}>Registrar cobro</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>

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
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <button className="primary-btn" onClick={handleCreate}>Guardar</button>
              <button className="secondary-btn" onClick={() => setShowModal(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}