"use client";

import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/components/context/LanguageContext";
import { useAuth } from "@/components/context/AuthContext";
import Pagination from "@/components/ui/Pagination";

const PER_PAGE = 8;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

type PaymentStatus = "pending" | "paid" | "cancelled";
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

const METHODS = ["Tarjeta", "Efectivo", "Bizum", "Transferencia"];

function Badge({ status, label }: { status: PaymentStatus; label: string }) {
  const cls =
    status === "paid"
      ? "badge--confirmed"
      : status === "cancelled"
      ? "badge--cancelled"
      : "badge--pending";
  return <span className={`badge ${cls}`}>{label}</span>;
}

export default function PaymentsPage() {
  const { user, token } = useAuth();
  const { t } = useLanguage();

  const [payments, setPayments]         = useState<Payment[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | PaymentStatus>("all");
  const [showModal, setShowModal]       = useState(false);
  const [success, setSuccess]           = useState("");
  const [page, setPage]                 = useState(1);

  // Formulario crear manualmente
  const [form, setForm] = useState({ amount: "", method: "", status: "pending" as PaymentStatus, appointmentId: "" });

  // Estado visual para la pasarela de tarjeta (no funcional de momento)
  const [cardForm, setCardForm] = useState({ number: "", expiry: "", cvv: "", name: "" });

  // Modal editar pago
  const [editTarget, setEditTarget] = useState<Payment | null>(null);
  const [editForm, setEditForm]     = useState({ amount: "", method: "", status: "pending" as PaymentStatus });

  const FILTERS = [
    { key: "all",       label: t("seeAll"),        cls: "filter-pill--all" },
    { key: "pending",   label: t("pendingFilter"), cls: "filter-pill--pending" },
    { key: "paid",      label: t("paidFilter"),    cls: "filter-pill--paid" },
    { key: "cancelled", label: t("filterCancelled") ?? "Cancelados", cls: "filter-pill--cancelled" },
  ];

  const flash = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  // Carga de datos evitando condiciones de carrera (Race Conditions)
  useEffect(() => {
    let ignore = false;
    const endpointPayments = user?.role === "business" ? `${API_URL}/payments/business/${user.businessId}` : `${API_URL}/payments`;
    const endpointAppointments = user?.role === "business" ? `${API_URL}/appointments/business/${user.businessId}` : `${API_URL}/appointments`;

    const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);
    const headers = {
      "Content-Type": "application/json",
      ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
    };

    Promise.all([
      fetch(endpointPayments, { headers }).then(r => r.json()),
      fetch(endpointAppointments, { headers }).then(r => r.json())
    ]).then(([paymentsData, appointmentsData]) => {
      if (!ignore) {
        setPayments(Array.isArray(paymentsData) ? paymentsData : []);
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      }
    }).catch(err => console.error("Error cargando datos", err));

    return () => {
      ignore = true;
    };
  }, [user, token]);

  useEffect(() => {
    setTimeout(() => {
      setPage(1);
    }, 0);
  }, [statusFilter]);

  // Crear pago manualmente con validaciones e interfaz de tarjeta simulada
  const handleCreate = async () => {
    const appId = parseInt(form.appointmentId);
    if (!form.amount || !form.method || isNaN(appId)) {
      alert("Por favor, rellena todos los campos obligatorios.");
      return;
    }

    if (form.method === "Tarjeta" && (!cardForm.number || !cardForm.cvv)) {
      alert("Por favor, introduce los datos simulados de la tarjeta.");
      return;
    }

    const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);
    const res = await fetch(`${API_URL}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
      body: JSON.stringify({
        amount: parseFloat(form.amount),
        method: form.method,
        status: form.method === "Tarjeta" ? "paid" : form.status, // Si es tarjeta se asume pagado directamente
        appointmentId: appId,
      }),
    });
    if (res.ok) {
      const newPayment = await res.json();
      setPayments(prev => [...prev, newPayment]);
      setShowModal(false);
      setForm({ amount: "", method: "", status: "pending", appointmentId: "" });
      setCardForm({ number: "", expiry: "", cvv: "", name: "" });
      flash(t("paymentRegistered"));
    }
  };

  // Cambio rápido de estado (botón en tabla)
  const handleStatusChange = async (id: number, newStatus: PaymentStatus) => {
    const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);
    const res = await fetch(`${API_URL}/payments/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      flash(newStatus === "paid" ? t("markedPaid") : t("markedPending"));
    }
  };

  // Abrir modal editar
  const openEdit = (p: Payment) => {
    setEditTarget(p);
    setEditForm({ amount: String(p.amount), method: p.method, status: p.status });
  };

  // Guardar edición completa
  const handleEdit = async () => {
    if (!editTarget) return;
    const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);
    const res = await fetch(`${API_URL}/payments/${editTarget.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
      },
      body: JSON.stringify({
        amount: parseFloat(editForm.amount),
        method: editForm.method,
        status: editForm.status,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setPayments(prev => prev.map(p => p.id === updated.id ? updated : p));
      setEditTarget(null);
      flash("Pago actualizado correctamente");
    }
  };

  // Contadores y sumatorios optimizados con useMemo
  const { totalPaid, totalPending, counts } = useMemo(() => {
    return payments.reduce((acc, p) => {
      const amt = Number(p.amount) || 0;
      if (p.status === "paid") acc.totalPaid += amt;
      if (p.status === "pending") acc.totalPending += amt;
      if (p.status in acc.counts) acc.counts[p.status] += 1;
      return acc;
    }, { totalPaid: 0, totalPending: 0, counts: { paid: 0, pending: 0, cancelled: 0 } });
  }, [payments]);

  const filtered = useMemo(() =>
    statusFilter === "all" ? payments : payments.filter(p => p.status === statusFilter)
  , [payments, statusFilter]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
  }, [filtered, page]);

  const appointmentLabel = (id: number) => {
    const a = appointments.find(a => a.id === id);
    return a ? `#${a.id} — ${a.date} ${a.time} · ${a.serviceName}` : `#${id}`;
  };

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
            {counts.paid} {t("operations")}
          </p>
        </div>
        <div className="kpi-card">
          <p className="kpi-card__label">{t("pending")}</p>
          <h3 className="kpi-card__value">{totalPending.toFixed(2)} €</h3>
          <p className="kpi-card__meta kpi-card__meta--warning">
            {counts.pending} {t("toReview")}
          </p>
        </div>
      </section>

      <section className="section-card">
        <div className="panel-title-row">
          <h3 className="panel-title">{t("paymentList")}</h3>
          <div className="filter-row">
            {FILTERS.map(f => (
              <button key={f.key} type="button"
                onClick={() => setStatusFilter(f.key as any)}
                className={`filter-pill ${f.cls}${statusFilter === f.key ? " active" : ""}`}
              >
                {f.label}
                {f.key !== "all" && (
                  <span className="filter-pill__count">{counts[f.key as PaymentStatus] || 0}</span>
                )}
              </button>
            ))}
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
              {paginated.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>COB-{String(p.id).padStart(3, "0")}</td>
                  <td>{Number(p.amount).toFixed(2)} €</td>
                  <td>{p.method}</td>
                  <td style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{appointmentLabel(p.appointmentId)}</td>
                  <td>
                    <Badge
                      status={p.status}
                      label={
                        p.status === "paid" ? t("statusPaid") :
                        p.status === "cancelled" ? t("statusCancelled") :
                        t("toPay")
                      }
                    />
                  </td>
                  <td style={{ textAlign: "right", display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                    <button
                      className="secondary-btn"
                      style={{ padding: "4px 10px", fontSize: "12px" }}
                      onClick={() => openEdit(p)}
                    >
                      ✏️ Editar
                    </button>
                    {p.status === "pending" ? (
                      <button className="primary-btn" style={{ padding: "4px 10px", fontSize: "12px" }}
                        onClick={() => handleStatusChange(p.id, "paid")}>
                        {t("markPaid")}
                      </button>
                    ) : p.status === "paid" ? (
                      <button className="secondary-btn" style={{ padding: "4px 10px", fontSize: "12px" }}
                        onClick={() => handleStatusChange(p.id, "pending")}>
                        {t("markPending")}
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <Pagination total={filtered.length} page={page} perPage={PER_PAGE} onPageChange={setPage} />
      </section>

      {/* Modal Crear pago manual */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3 className="modal-title">{t("registerPaymentModal")}</h3>
            <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>
              Los pagos se crean automáticamente al crear una reserva. Usa este formulario solo para añadir pagos extra.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <input className="input" type="number" placeholder={t("amountPlaceholder")}
                value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
              
              <select className="input" value={form.appointmentId}
                onChange={e => setForm({ ...form, appointmentId: e.target.value })}>
                <option value="">{t("selectReservation")}</option>
                {appointments.map(a => (
                  <option key={a.id} value={a.id}>#{a.id} — {a.date} {a.time} · {a.serviceName}</option>
                ))}
              </select>

              <select className="input" value={form.method} onChange={e => setForm({ ...form, method: e.target.value })}>
                <option value="">{t("paymentMethod")}</option>
                {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>

              {/* INTERFAZ VISUAL DE LA PASARELA DE TARJETA (NO FUNCIONAL) */}
              {form.method === "Tarjeta" && (
                <div style={{ 
                  background: "#f8f9fa", 
                  padding: "12px", 
                  borderRadius: "8px", 
                  border: "1px dashed #cbd5e1",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}>
                  <p style={{ fontSize: "11px", fontWeight: "bold", color: "#64748b", textTransform: "uppercase", margin: 0 }}>
                    💳 Interfaz de Pasarela de Pago
                  </p>
                  <input className="input" type="text" placeholder="Nombre del titular"
                    value={cardForm.name} onChange={e => setCardForm({ ...cardForm, name: e.target.value })} />
                  <input className="input" type="text" maxLength={16} placeholder="0000 0000 0000 0000"
                    value={cardForm.number} onChange={e => setCardForm({ ...cardForm, number: e.target.value })} />
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input className="input" type="text" maxLength={5} placeholder="MM/AA" style={{ textAlign: "center" }}
                      value={cardForm.expiry} onChange={e => setCardForm({ ...cardForm, expiry: e.target.value })} />
                    <input className="input" type="password" maxLength={3} placeholder="CVV" style={{ textAlign: "center" }}
                      value={cardForm.cvv} onChange={e => setCardForm({ ...cardForm, cvv: e.target.value })} />
                  </div>
                </div>
              )}

              <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as PaymentStatus })} disabled={form.method === "Tarjeta"}>
                <option value="pending">{t("toPay")}</option>
                <option value="paid">{t("statusPaid")}</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setShowModal(false)}>{t("cancel")}</button>
              <button className="primary-btn" onClick={handleCreate}>{t("save")}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar pago */}
      {editTarget && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3 className="modal-title">✏️ Editar pago COB-{String(editTarget.id).padStart(3, "0")}</h3>
            <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>
              Reserva vinculada: {appointmentLabel(editTarget.appointmentId)}<br />
              <strong>El estado de la reserva se actualizará automáticamente.</strong>
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <div>
                <label style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Importe (€)
                </label>
                <input className="input" type="number" step="0.01"
                  value={editForm.amount} onChange={e => setEditForm({ ...editForm, amount: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Método de pago
                </label>
                <select className="input" value={editForm.method}
                  onChange={e => setEditForm({ ...editForm, method: e.target.value })}>
                  <option value="Pendiente">Sin definir</option>
                  {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Estado del pago
                </label>
                <select className="input" value={editForm.status}
                  onChange={e => setEditForm({ ...editForm, status: e.target.value as PaymentStatus })}>
                  <option value="pending">{t("toPay")}</option>
                  <option value="paid">{t("statusPaid")}</option>
                  <option value="cancelled">{t("statusCancelled")}</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setEditTarget(null)}>{t("cancel")}</button>
              <button className="primary-btn" onClick={handleEdit}>{t("save")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}