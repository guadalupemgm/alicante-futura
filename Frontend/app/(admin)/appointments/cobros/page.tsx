"use client";

import { useEffect, useState, useMemo } from "react";
import { getAppointmentsByBusiness } from "@/lib/api";
import { useAuth } from "@/components/context/AuthContext";
import { useLanguage } from "@/components/context/LanguageContext";

export default function CobrosPendientesPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.businessId) {
      getAppointmentsByBusiness(user.businessId)
        .then((data) => {
          console.log("Estructura de la reserva:", data[0]); //
          // Filtramos solo las que están pendientes de pago
          const pendings = data.filter((b: any) => b.status === "pending");
          setBookings(pendings);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  // Total acumulado de deuda
  const totalDeuda = useMemo(() => 
    bookings.reduce((sum, b) => sum + (Number(b.price) || 0), 0), 
  [bookings]);

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>{t("pendingPayments")}</h2>
          <p>Gestión de reservas que aún no han sido liquidadas.</p>
        </div>
        
        {/* KPI de Control de Deuda */}
        <div className="kpi-card status-pending" style={{ padding: "10px 20px", minWidth: "180px" }}>
          <p style={{ fontSize: "11px", textTransform: "uppercase", margin: 0 }}>Total a cobrar</p>
          <h3 style={{ margin: "5px 0 0 0" }}>${totalDeuda.toLocaleString()}</h3>
        </div>
      </section>

      <section className="section-card">
        {loading ? (
          <p style={{ padding: "2rem", textAlign: "center" }}>Cargando pendientes...</p>
        ) : bookings.length === 0 ? (
          <p style={{ padding: "2rem", textAlign: "center" }}>No hay cobros pendientes. ¡Buen trabajo!</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Servicio</th>
                <th>Fecha</th>
                <th>Monto</th>
                <th style={{ textAlign: "right" }}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td>{b.customerName || "Cliente"}</td>
                  <td>{b.serviceName}</td>
                  <td>{new Date(b.date).toLocaleDateString("es-ES")}</td>
                  <td style={{ fontWeight: 600 }}>${b.price || 0}</td>
                  <td style={{ textAlign: "right" }}>
                    <button 
                      className="primary-btn" 
                      onClick={() => alert(`Procesar pago de ${b.id}`)}
                      style={{ padding: "5px 15px", fontSize: "12px" }}
                    >
                      Marcar como Pagado
                    </button>
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