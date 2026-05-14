import Link from "next/link";
import { getAppointments } from "@/lib/api";
import ExportButton from "./ExportButton";

type DashboardBookingStatus = "pending" | "confirmed" | "paid";

function Badge({ status }: { status: DashboardBookingStatus }) {
  const label =
    status === "pending"
      ? "Pendiente"
      : status === "confirmed"
        ? "Confirmada"
        : "Pagada";

  return <span className={`badge badge--${status}`}>{label}</span>;
}

function KpiCard({
  title,
  value,
  subtitle,
  variant,
}: {
  title: string;
  value: string;
  subtitle: string;
  variant?: "positive" | "warning";
}) {
  return (
    <div className="kpi-card">
      <p className="kpi-card__label">{title}</p>
      <h3 className="kpi-card__value">{value}</h3>
      <p
        className={`kpi-card__meta ${
          variant === "positive"
            ? "kpi-card__meta--positive"
            : variant === "warning"
              ? "kpi-card__meta--warning"
              : ""
        }`}
      >
        {subtitle}
      </p>
    </div>
  );
}

export default async function DashboardPage() {
  const bookings = await getAppointments();

  const total = bookings.length;
  const pending = bookings.filter(b => b.status === "pending").length;
  const confirmed = bookings.filter(b => b.status === "confirmed").length;
  const paid = bookings.filter(b => b.status === "paid").length;

  const upcoming = bookings.slice(0, 5);

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>Dashboard overview</h2>
          <p>Control diario de reservas, actividad y pagos.</p>
        </div>

        <ExportButton />
      </section>

      <section className="kpi-grid">
        <KpiCard
          title="Total reservas"
          value={String(total)}
          subtitle="Registros en base de datos"
        />
        <KpiCard
          title="Pendientes"
          value={String(pending)}
          subtitle="Por confirmar"
          variant="warning"
        />
        <KpiCard
          title="Confirmadas"
          value={String(confirmed)}
          subtitle="En agenda"
          variant="positive"
        />
        <KpiCard
          title="Pagadas"
          value={String(paid)}
          subtitle="Completadas"
        />
      </section>

      <section className="dashboard-grid">
        <div className="section-card">
          <div className="panel-title-row">
            <h3 className="panel-title">Próximas reservas</h3>
            <Link href="/bookings" className="panel-subtle-link">
              Ver todas
            </Link>
          </div>

          {bookings.length === 0 ? (
            <p style={{ padding: "1rem", color: "var(--muted)" }}>
              No hay reservas registradas todavía.
            </p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Servicio</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((booking) => (
                  <tr key={booking.id}>
                    <td style={{ fontWeight: 600 }}>
                      {new Date(booking.date).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td>{booking.time}</td>
                    <td>{booking.serviceName}</td>
                    <td>
                      <Badge status={booking.status as DashboardBookingStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="info-stack">
          <div className="info-box">
            <p className="info-box__eyebrow">Total reservas</p>
            <p className="info-box__title">{total}</p>
            <p className="info-box__text">Registradas en el sistema</p>
          </div>

          <div className="info-box">
            <p className="info-box__eyebrow">Pendientes de confirmar</p>
            <p className="info-box__title">{pending}</p>
            <p className="info-box__text">Requieren seguimiento</p>
          </div>

          <div className="info-box">
            <p className="info-box__eyebrow">Pagadas</p>
            <p className="info-box__title">{paid}</p>
            <p className="info-box__text">Reservas cerradas</p>
          </div>
        </div>
      </section>
    </div>
  );
}