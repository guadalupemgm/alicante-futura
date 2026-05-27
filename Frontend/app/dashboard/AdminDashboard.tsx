"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAppointments } from "@/lib/api";
import { useLanguage, TranslationKey } from "@/components/context/LanguageContext";
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
    status === "pending"
      ? t("statusPending")
      : status === "confirmed"
        ? t("statusConfirmed")
        : t("statusPaid");

  return <span className={`badge badge--${status}`}>{label}</span>;
}

function KpiCard({
  title, value, subtitle, variant,
}: {
  title: string; value: string; subtitle: string; variant?: "positive" | "warning";
}) {
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
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    getAppointments().then(setBookings).catch(console.error);
  }, []);

  const total     = bookings.length;
  const pending   = bookings.filter(b => b.status === "pending").length;
  const confirmed = bookings.filter(b => b.status === "confirmed").length;
  const paid      = bookings.filter(b => b.status === "paid").length;
  const upcoming  = bookings.slice(0, 5);

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
        <KpiCard title={t("totalBookings")} value={String(total)}     subtitle={t("totalBookingsSub")} />
        <KpiCard title={t("pending")}       value={String(pending)}   subtitle={t("pendingSub")}  variant="warning" />
        <KpiCard title={t("confirmed")}     value={String(confirmed)} subtitle={t("confirmedSub")} variant="positive" />
        <KpiCard title={t("paid")}          value={String(paid)}      subtitle={t("paidSub")} />
      </section>

      <section className="dashboard-grid">
        <div className="section-card">
          <div className="panel-title-row">
            <h3 className="panel-title">{t("upcomingBookings")}</h3>
            <Link href="/bookings" className="panel-subtle-link">{t("viewAll")}</Link>
          </div>

          {bookings.length === 0 ? (
            <p style={{ padding: "1rem", color: "var(--muted)" }}>{t("noBookingsYet")}</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t("date")}</th>
                  <th>{t("time")}</th>
                  <th>{t("service")}</th>
                  <th>{t("status")}</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((booking) => (
                  <tr key={booking.id}>
                    <td style={{ fontWeight: 600 }}>
                      {new Date(booking.date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                    </td>
                    <td>{booking.time}</td>
                    <td>{booking.serviceName}</td>
                    <td>
                      <Badge status={booking.status as DashboardBookingStatus} t={t} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

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