"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { getAppointments, getAppointmentsByBusiness } from "@/lib/api";
import { useLanguage, TranslationKey } from "@/components/context/LanguageContext";
import { useAuth } from "@/components/context/AuthContext";
import ExportButton from "./ExportButton";

type DashboardBookingStatus = "pending" | "confirmed" | "paid";

type Booking = {
  id: number;
  date: string;
  time: string;
  serviceName: string;
  status: string;
};

function Badge({ status, t }: { status: DashboardBookingStatus; t: (k: TranslationKey) => string }) {
  const label =
    status === "pending" ? t("statusPending") : 
    status === "confirmed" ? t("statusConfirmed") : 
    t("statusPaid");
  return <span className={`badge badge--${status}`}>{label}</span>;
}

function KpiCard({ title, value, subtitle, variant }: { title: string; value: string; subtitle: string; variant?: "positive" | "warning"; }) {
  return (
    <div className="kpi-card">
      <p className="kpi-card__label">{title}</p>
      <h3 className="kpi-card__value">{value}</h3>
      <p className={`kpi-card__meta ${variant === "positive" ? "kpi-card__meta--positive" : variant === "warning" ? "kpi-card__meta--warning" : ""}`}>
        {subtitle}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Booking, direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    if (user?.role === "business" && user?.businessId) {
      getAppointmentsByBusiness(user.businessId).then(setBookings).catch(console.error);
    } else {
      getAppointments().then(setBookings).catch(console.error);
    }
  }, [user]);

  const sortedBookings = useMemo(() => {
    let sortableItems = [...bookings];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems.slice(0, 5);
  }, [bookings, sortConfig]);

  const requestSort = (key: keyof Booking) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const total = bookings.length;
  const pending = bookings.filter(b => b.status === "pending").length;
  const confirmed = bookings.filter(b => b.status === "confirmed").length;
  const paid = bookings.filter(b => b.status === "paid").length;

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>{t("dashboardTitle")}</h2>
          <p>{t("dashboardSubtitle")}</p>
        </div>
        <ExportButton />
      </section>

      <section className="kpi-grid">
        <KpiCard title={t("totalBookings")} value={String(total)} subtitle={t("totalBookingsSub")} />
        <KpiCard title={t("pending")} value={String(pending)} subtitle={t("pendingSub")} variant="warning" />
        <KpiCard title={t("confirmed")} value={String(confirmed)} subtitle={t("confirmedSub")} variant="positive" />
        <KpiCard title={t("paid")} value={String(paid)} subtitle={t("paidSub")} />
      </section>

      <section className="dashboard-grid">
        <div className="section-card">
          <div className="panel-title-row">
            <h3 className="panel-title">{t("upcomingBookings")}</h3>
            <Link href={user?.role === "business" ? "/business-bookings" : "/bookings"} className="panel-subtle-link">{t("viewAll")}</Link>
          </div>

          {bookings.length === 0 ? (
            <p style={{ padding: "1rem", color: "var(--muted)" }}>{t("noBookingsYet")}</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => requestSort('date')} style={{ cursor: "pointer" }}>{t("date")} ↕</th>
                  <th onClick={() => requestSort('time')} style={{ cursor: "pointer" }}>{t("time")} ↕</th>
                  <th onClick={() => requestSort('serviceName')} style={{ cursor: "pointer" }}>{t("service")} ↕</th>
                  <th onClick={() => requestSort('status')} style={{ cursor: "pointer" }}>{t("status")} ↕</th>
                </tr>
              </thead>
              <tbody>
                {sortedBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td style={{ fontWeight: 600 }}>{new Date(booking.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</td>
                    <td>{booking.time}</td>
                    <td>{booking.serviceName}</td>
                    <td><Badge status={booking.status as DashboardBookingStatus} t={t} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* AQUÍ ESTABAN TUS TARJETAS DE LA DERECHA */}
        <div className="info-stack">
          <div className="info-box">
            <p className="info-box__eyebrow">{t("totalBookings")}</p>
            <p className="info-box__title">{total}</p>
            <p className="info-box__text">{t("registeredInSystem")}</p>
          </div>
          <div className="info-box">
            <p className="info-box__eyebrow">{t("pendingToConfirm")}</p>
            <p className="info-box__title">{pending}</p>
            <p className="info-box__text">{t("requireFollowUp")}</p>
          </div>
          <div className="info-box">
            <p className="info-box__eyebrow">{t("paid")}</p>
            <p className="info-box__title">{paid}</p>
            <p className="info-box__text">{t("closedBookings")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}