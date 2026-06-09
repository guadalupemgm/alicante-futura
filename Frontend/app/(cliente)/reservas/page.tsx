"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import { useLanguage, TranslationKey } from "@/components/context/LanguageContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type BookingStatus = "pending" | "confirmed" | "paid" | "cancelled";

type Booking = {
  id: number;
  date: string;
  time: string;
  status: BookingStatus;
  customerId: number;
  businessId: number;
  serviceName: string;
};

// Componente de tarjeta para los indicadores superiores
function SummaryCard({ title, value, statusClass }: { title: string; value: number; statusClass: string }) {
  return (
    <div className={`kpi-card ${statusClass}`}>
      <p className="kpi-card__label" style={{ fontSize: '11px', textTransform: 'uppercase' }}>{title}</p>
      <h3 className="kpi-card__value">{value}</h3>
    </div>
  );
}

export default function MisReservasPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Booking; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });

  const STATUS_LABEL: Record<BookingStatus, string> = {
    pending: t("statusPending"),
    confirmed: t("statusConfirmed"),
    paid: t("statusPaid"),
    cancelled: t("statusCancelled"),
  };

  useEffect(() => {
    if (!user?.customerId) return;
    const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);
    const headers: HeadersInit = activeToken ? { Authorization: `Bearer ${activeToken}` } : {};
    
    fetch(`${API_URL}/appointments/customer/${user.customerId}`, { headers })
      .then((r) => r.json())
      .then((d) => setBookings(Array.isArray(d) ? d : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, token]);

  const stats = useMemo(() => ({
    upcoming: bookings.filter(b => b.status === "confirmed" || b.status === "pending").length,
    completed: bookings.filter(b => b.status === "paid").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
    pendingPayment: bookings.filter(b => b.status === "pending").length,
  }), [bookings]);

  const sortedBookings = useMemo(() => {
    return [...bookings].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      if (sortConfig.key === 'date') {
        aValue = `${a.date}T${a.time}` as any;
        bValue = `${b.date}T${b.time}` as any;
      }
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [bookings, sortConfig]);

  const requestSort = (key: keyof Booking) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>{t("misReservasTitle")}</h2>
          <p>{t("misReservasSubtitle")}</p>
        </div>
        <button className="primary-btn" onClick={() => router.push("/reservas/nueva")}>
          {t("newReservation")}
        </button>
      </section>

      {/* Indicadores de estado */}
      {!loading && bookings.length > 0 && (
        <section className="kpi-grid" style={{ marginBottom: "2rem", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
          <SummaryCard title="Próximas" value={stats.upcoming} statusClass="status-confirmed" />
          <SummaryCard title="Completadas" value={stats.completed} statusClass="status-paid" />
          <SummaryCard title="Pend. Pago" value={stats.pendingPayment} statusClass="status-pending" />
          <SummaryCard title="Canceladas" value={stats.cancelled} statusClass="status-neutral" />
        </section>
      )}

      <section className="section-card">
        <div className="panel-title-row">
          <h3 className="panel-title">{t("appointments")}</h3>
          <span style={{ color: "var(--muted)", fontSize: 14 }}>{bookings.length} {t("reservasCount")}</span>
        </div>

        {loading ? (
          <p style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>{t("loadingText")}</p>
        ) : bookings.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <p style={{ color: "var(--muted)", marginBottom: "1rem" }}>{t("noReservas")}</p>
            <button className="primary-btn" onClick={() => router.push("/empresas")}>{t("exploreBusinesses")}</button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {[{ key: 'serviceName', label: t("service") }, { key: 'date', label: t("dateTime") }, { key: 'status', label: t("status") }].map((col) => (
                  <th key={col.key} onClick={() => requestSort(col.key as keyof Booking)} style={{ cursor: 'pointer' }}>{col.label} ↕</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedBookings.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 600 }}>{b.serviceName}</td>
                  <td>
                    <div>{new Date(b.date).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{b.time} hs</div>
                  </td>
                  <td>
                    <span className={`badge badge--${b.status}`}>{STATUS_LABEL[b.status]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}