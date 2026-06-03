"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/context/AuthContext";

export default function ReservasPage() {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("¿Qué ve la página de Reservas?", { user, token });

  useEffect(() => {
    // 1. Esperamos a que el AuthContext termine de cargar
    if (user === undefined) return;

    // 2. Si después de cargar no hay usuario, lanzamos error
    if (!user || !token) {
      setTimeout(() => {
        setError("No se ha detectado una sesión activa. Por favor, inicia sesión.");
        setLoading(false);
      }, 0);
      return;
    }

    // 3. Buscamos el ID (usamos el ID del usuario directamente si customerId es null)
    const idToFetch = user.customerId || user.id;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/appointments/customer/${idToFetch}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setAppointments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Error al conectar con el servidor.");
        setLoading(false);
      });
  }, [user, token]);

  // Pantalla de carga
  if (loading) return <div>Cargando...</div>;

  // Pantalla de error (Solo si falla la sesión)
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  // Pantalla principal (Aquí es donde se ven tus reservas)
  return (
    <div style={{ padding: '20px' }}>
      <h1>Mis Reservas</h1>
      {appointments.length === 0 ? (
        <p>No tienes reservas.</p>
      ) : (
        appointments.map(appt => (
          <div key={appt.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px' }}>
            <h3>{appt.serviceName}</h3>
            <p>Estado: {appt.status}</p>
          </div>
        ))
      )}
    </div>
  );
}