"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";

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

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending:   "Pendiente",
  confirmed: "Confirmada",
  paid:      "Pagada",
  cancelled: "Cancelada",
};

export default function MisReservasPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch(API_URL + "/appointments")
      .then((r) => r.json())
      .then((d) => {
        const all = Array.isArray(d) ? d : [];
        // Filtrar solo las reservas del cliente autenticado
        setBookings(all.filter((b: Booking) => b.customerId === user?.customerId));
      })
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>Mis Reservas</h2>
          <p>Historial de todas tus citas y su estado actual.</p>
        </div>
        <button
          className="primary-btn"
          onClick={() => router.push("/reservas/nueva")}
        >
          + Nueva Reserva
        </button>
      </section>

      <section className="section-card">
        <div className="panel-title-row">
          <h3 className="panel-title">Citas</h3>
          <span style={{ color: "var(--muted)", fontSize: 14 }}>
            {bookings.length} reservas
          </span>
        </div>

        {loading ? (
          <p style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>
            Cargando...
          </p>
        ) : bookings.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <p style={{ color: "var(--muted)", marginBottom: "1rem" }}>
              Aún no tienes reservas.
            </p>
            <button
              className="primary-btn"
              onClick={() => router.push("/empresas")}
            >
              Explorar negocios
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Fecha y hora</th>
                <th>Estado</th>
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