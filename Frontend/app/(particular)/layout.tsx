"use client";

import Sidebar from "@/components/layout/Sidebar"; 
import Header from "@/components/layout/Header";

/**
 * ParticularLayout
 * Este componente define la estructura base para el espacio del cliente particular.
 * Integra el Sidebar unificado y el Header con todas sus funcionalidades.
 */
export default function ParticularLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-shell">
      {/* El Sidebar es compartido y detecta automáticamente el rol del usuario (particular).
        No es necesario pasar props adicionales, toda la lógica de filtrado de menús 
        reside internamente en el componente.
      */}
      <Sidebar />

      <div className="admin-main">
        {/* El Header ahora contiene toda la lógica de notificaciones, 
          menú de usuario, selector de idioma y cambio de tema (dark mode).
        */}
        <Header role="particular" />
        
        {/* El main contenedor donde se renderizan las páginas específicas del cliente.
          La clase 'admin-content' mantiene el espaciado global del diseño.
        */}
        <main className="admin-content">
          {children}
        </main>
      </div>

      {/* Si fuera necesario añadir un footer global o modales de sesión, 
        se insertarían justo debajo de 'admin-content' aquí.
      */}
    </div>
  );
}