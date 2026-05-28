"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import { useLanguage } from "@/components/context/LanguageContext";

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

export default function MisReservasPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);

  const STATUS_LABEL: Record<BookingStatus, string> = {
    pending:   t("statusPending"),
    confirmed: t("statusConfirmed"),
    paid:      t("statusPaid"),
    cancelled: t("statusCancelled"),
  };

  useEffect(() => {
    if (!user?.customerId) return;
    const activeToken = token || (typeof window !== "undefined" ? localStorage.getItem("auth_token") : null);
    const headers = activeToken ? { Authorization: `Bearer ${activeToken}` } : {};
    fetch(API_URL + "/appointments/customer/" + user.customerId, { headers })
      .then((r) => r.json())
      .then((d) => {
        setBookings(Array.isArray(d) ? d : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, token]);

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>{t("misReservasTitle")}</h2>
          <p>{t("misReservasSubtitle")}</p>
        </div>
        <button
          className="primary-btn"
          onClick={() => router.push("/reservas/nueva")}
        >
          {t("newReservation")}
        </button>
      </section>

      <section className="section-card">
        <div className="panel-title-row">
          <h3 className="panel-title">{t("appointments")}</h3>
          <span style={{ color: "var(--muted)", fontSize: 14 }}>
            {bookings.length} {t("reservasCount")}
          </span>
        </div>

        {loading ? (
          <p style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>
            {t("loadingText")}
          </p>
        ) : bookings.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <p style={{ color: "var(--muted)", marginBottom: "1rem" }}>
              {t("noReservas")}
            </p>
            <button
              className="primary-btn"
              onClick={() => router.push("/empresas")}
            >
              {t("exploreBusinesses")}
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t("service")}</th>
                <th>{t("dateTime")}</th>
                <th>{t("status")}</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 600 }}>{b.serviceName}</td>
                  <td>
                    <div>
                      {new Date(b.date).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{b.time} hs</div>
                  </td>
                  <td>
                    <span className={`badge badge--${b.status}`}>
                      {STATUS_LABEL[b.status]}
                    </span>
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
