"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Business = { id: number; name: string; category: string; address: string };

function NuevaReservaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const preBusinessId   = Number(searchParams.get("businessId") ?? 0);
  const preBusinessName = searchParams.get("businessName") ?? "";

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [form, setForm] = useState({
    businessId: preBusinessId,
    serviceName: "",
    date: "",
    time: "",
  });
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);

  useEffect(() => {
    fetch(API_URL + "/business")
      .then((r) => r.json())
      .then((d) => setBusinesses(Array.isArray(d) ? d.filter((b: any) => b.status === "active") : []));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessId || !form.serviceName || !form.date || !form.time) {
      setError("Completa todos los campos.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(API_URL + "/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId:  form.businessId,
          customerId:  user?.customerId ?? 0,
          serviceName: form.serviceName,
          date:        form.date,
          time:        form.time,
          status:      "pending",
        }),
      });

      if (!res.ok) throw new Error();
      setSuccess(true);
    } catch {
      setError("Error al crear la reserva. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="page-stack" style={{ maxWidth: 480, margin: "0 auto", paddingTop: "2rem" }}>
        <div className="section-card" style={{ textAlign: "center", padding: "2.5rem" }}>
          <div style={{ fontSize: 48, marginBottom: "1rem" }}>✅</div>
          <h3 style={{ marginBottom: "0.5rem" }}>¡Reserva creada!</h3>
          <p style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
            Tu cita está pendiente de confirmación por el negocio.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="secondary-btn" onClick={() => router.push("/reservas")}>
              Ver mis reservas
            </button>
            <button className="primary-btn" onClick={() => router.push("/empresas")}>
              Volver a empresas
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack" style={{ maxWidth: 520, margin: "0 auto", paddingTop: "2rem" }}>
      <section className="page-hero" style={{ marginBottom: 0 }}>
        <div>
          <h2>Nueva Reserva</h2>
          <p>Elige un negocio, el servicio y la fecha.</p>
        </div>
        <button className="secondary-btn" onClick={() => router.push("/empresas")}>
          ← Volver
        </button>
      </section>

      <div className="section-card">
        <form onSubmit={handleSubmit}>
          <div className="page-stack">

            <div>
              <label className="kpi-card__label" style={{ fontSize: 11 }}>Negocio *</label>
              <select
                className="select"
                value={form.businessId}
                onChange={(e) => setForm({ ...form, businessId: Number(e.target.value) })}
                required
              >
                <option value={0}>Selecciona un negocio</option>
                {businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} — {b.category}
                  </option>
                ))}
              </select>
              {preBusinessName && form.businessId === preBusinessId && (
                <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
                  <i className="bi bi-check-circle-fill" style={{ color: "var(--success-text)", marginRight: 4 }} />
                  {preBusinessName} seleccionado
                </p>
              )}
            </div>

            <div>
              <label className="kpi-card__label" style={{ fontSize: 11 }}>Servicio *</label>
              <input
                className="input"
                type="text"
                placeholder="Ej: Corte de pelo, Masaje, Consulta..."
                value={form.serviceName}
                onChange={(e) => setForm({ ...form, serviceName: e.target.value })}
                required
              />
            </div>

            <div className="form-grid">
              <div>
                <label className="kpi-card__label" style={{ fontSize: 11 }}>Fecha *</label>
                <input
                  className="input"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="kpi-card__label" style={{ fontSize: 11 }}>Hora *</label>
                <input
                  className="input"
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  required
                />
              </div>
            </div>

            {error && (
              <p style={{ color: "#b91c1c", fontSize: 13, margin: 0 }}>{error}</p>
            )}

            <div className="modal-actions" style={{ marginTop: 8 }}>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => router.push("/empresas")}
              >
                Cancelar
              </button>
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? "Enviando..." : "Confirmar reserva"}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}

export default function NuevaReservaPage() {
  return (
    <Suspense fallback={<div className="auth-loading"><div className="auth-loading__spinner" /></div>}>
      <NuevaReservaForm />
    </Suspense>
  );
}