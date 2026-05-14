"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/components/context/LanguageContext";

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
  status?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function Badge({ status, label }: { status: PaymentStatus; label: string }) {
  return (
    <span className={`badge badge--${status === "pending" ? "pending" : "confirmed"}`}>
      {label}
    </span>
  );
}

export default function PaymentsPage() {
  const { t } = useLanguage();
  const [payments, setPayments]         = useState<Payment[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | PaymentStatus>("all");
  const [showModal, setShowModal]       = useState(false);
  const [success, setSuccess]           = useState("");
  const [form, setForm] = useState({ amount: "", method: "", status: "pending", appointmentId: "" });

  const FILTERS = [
    { key: "all",     label: t("seeAll"),        className: "filter-pill--all" },
    { key: "pending", label: t("pendingFilter"), className: "filter-pill--pending" },
    { key: "paid",    label: t("paidFilter"),    className: "filter-pill--paid" },
  ];

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
      if (form.appointmentId) {
        const bookingStatus = form.status === "paid" ? "paid" : "pending";
        await fetch(`${API_URL}/appointments/${form.appointmentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: bookingStatus }),
        });
      }
      setSuccess(t("paymentRegistered"));
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
      const payment = payments.find(p => p.id === id);
      if (payment?.appointmentId) {
        const bookingStatus = newStatus === "paid" ? "paid" : "pending";
        await fetch(`${API_URL}/appointments/${payment.appointmentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: bookingStatus }),
        });
        setAppointments(appointments.map(a =>
          a.id === payment.appointmentId ? { ...a, status: bookingStatus } : a
        ));
      }
      setSuccess(newStatus === "paid" ? t("markedPaid") : t("markedPending"));
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const filtered = statusFilter === "all" ? payments : payments.filter(p => p.status === statusFilter);
  const totalPaid    = payments.filter(p => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);
  const totalPending = payments.filter(p => p.status === "pending").reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>{t("paymentsTitle")}</h2>
          <p>{t("paymentsSubtitle")}</p>
        </div>
        <button className="primary-btn" type="button" onClick={() => setShowModal(true)}>
          {t("registerPayment")}
        </button>
      </section>

      {success && <p style={{ color: "green" }}>{success}</p>}

      <section className="kpi-grid">
        <div className="kpi-card">
          <p className="kpi-card__label">{t("collected")}</p>
          <h3 className="kpi-card__value">{totalPaid.toFixed(2)} €</h3>
          <p className="kpi-card__meta kpi-card__meta--positive">
            {payments.filter(p => p.status === "paid").length} {t("operations")}
          </p>
        </div>
        <div className="kpi-card">
          <p className="kpi-card__label">{t("pending")}</p>
          <h3 className="kpi-card__value">{totalPending.toFixed(2)} €</h3>
          <p className="kpi-card__meta kpi-card__meta--warning">
            {payments.filter(p => p.status === "pending").length} {t("toReview")}
          </p>
        </div>
      </section>

      <section className="section-card">
        <div className="panel-title-row">
          <h3 className="panel-title">{t("paymentList")}</h3>
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
            {t("noPaymentsCategory")}
          </p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>{t("amount")}</th>
                <th>{t("method")}</th>
                <th>{t("reservation")}</th>
                <th>{t("status")}</th>
                <th style={{ textAlign: "right" }}>{t("actionsCol")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>COB-{String(p.id).padStart(3, "0")}</td>
                  <td>{Number(p.amount).toFixed(2)} €</td>
                  <td>{p.method}</td>
                  <td>#{p.appointmentId}</td>
                  <td>
                    <Badge
                      status={p.status}
                      label={p.status === "pending" ? t("toPay") : t("statusPaid")}
                    />
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {p.status === "pending" ? (
                      <button className="primary-btn" style={{ padding: "4px 12px", fontSize: "12px" }}
                        onClick={() => handleStatusChange(p.id, "paid")}>
                        {t("markPaid")}
                      </button>
                    ) : (
                      <button className="secondary-btn" style={{ padding: "4px 12px", fontSize: "12px" }}
                        onClick={() => handleStatusChange(p.id, "pending")}>
                        {t("markPending")}
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
            <h3 className="modal-title">{t("registerPaymentModal")}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <input className="input" type="number" placeholder={t("amountPlaceholder")}
                value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              <select className="input" value={form.method}
                onChange={(e) => setForm({ ...form, method: e.target.value })}>
                <option value="">{t("paymentMethod")}</option>
                <option value="Tarjeta">{t("card")}</option>
                <option value="Efectivo">{t("cash")}</option>
                <option value="Bizum">Bizum</option>
                <option value="Transferencia">{t("transfer")}</option>
              </select>
              <select className="input" value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="pending">{t("toPay")}</option>
                <option value="paid">{t("statusPaid")}</option>
              </select>
              <select className="input" value={form.appointmentId}
                onChange={(e) => setForm({ ...form, appointmentId: e.target.value })}>
                <option value="">{t("selectReservation")}</option>
                {appointments.map((a) => (
                  <option key={a.id} value={a.id}>
                    #{a.id} — {a.date} {a.time} · {a.serviceName}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setShowModal(false)}>{t("cancel")}</button>
              <button className="primary-btn" onClick={handleCreate}>{t("save")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}