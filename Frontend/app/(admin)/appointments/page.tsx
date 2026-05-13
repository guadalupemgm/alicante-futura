'use client'; // Indica que esto se ejecuta en el navegador del usuario

import { useEffect, useState } from 'react';

// Definimos cómo es una reserva para que TypeScript no nos dé errores
interface Appointment {
  id: number;
  date: string;
  time: string;
  serviceName: string;
  status: string;
  customerId: number;
}

export default function AppointmentsPage() {
  // Aquí guardamos la lista de reservas que traeremos del Backend
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  // Estado para saber si estamos cargando los datos
  const [loading, setLoading] = useState(true);

  // Función para pedir las reservas a nuestro servidor NestJS
  const fetchAppointments = async () => {
    try {
      const response = await fetch('http://localhost:3000/appointments');
      const data = await response.json();
      setAppointments(data); // Guardamos los datos recibidos
      setLoading(false);
    } catch (error) {
      console.error('Error al traer las reservas:', error);
      setLoading(false);
    }
  };

  // useEffect hace que la función se ejecute nada más abrir la página
  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Reservas</h1>
        <p className="text-gray-600">Aquí puedes ver y gestionar las citas de los clientes.</p>
      </header>

      <section className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <p className="p-4">Cargando reservas...</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha y Hora</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Servicio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente ID</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{item.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date} - {item.time}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{item.serviceName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 uppercase">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.customerId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && appointments.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No hay reservas registradas todavía. ¡Crea una desde Swagger para probar!
          </div>
        )}
      </section>
    </div>
  );
}