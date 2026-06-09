"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/components/context/AuthContext";


interface Appointment {
  id: number;
  serviceName: string;
  status: string;
}

export default function ReservasPage() {
  const { user, token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
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

  // 1. Estado para el orden
const [sortConfig, setSortConfig] = useState<{ key: keyof Appointment; direction: 'asc' | 'desc' }>({ key: 'id', direction: 'desc' });

// 2. Lógica de ordenado
const sortedAppointments = useMemo(() => {
  return [...appointments].sort((a, b) => {
    let aVal = a[sortConfig.key] || "";
    let bVal = b[sortConfig.key] || "";
    
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });
}, [appointments, sortConfig]);

// 3. Función de clic
const requestSort = (key: keyof Appointment) => {
  setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
};

  // Pantalla principal (Aquí es donde se ven tus reservas)
  return (
    <div style={{ padding: '20px' }}>
      <h1>Mis Reservas</h1>
      {appointments.length === 0 ? (
        <p>No tienes reservas.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
  <thead>
    <tr>
      <th onClick={() => requestSort('serviceName')} style={{ cursor: 'pointer' }}>Servicio ↕</th>
      <th onClick={() => requestSort('status')} style={{ cursor: 'pointer' }}>Estado ↕</th>
    </tr>
  </thead>
  <tbody>
    {sortedAppointments.map(appt => (
      <tr key={appt.id}>
        <td>{appt.serviceName}</td>
        <td>{appt.status}</td>
      </tr>
    ))}
  </tbody>
</table>
      )}
    </div>
  );
}