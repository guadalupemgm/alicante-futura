"use client";

import { useState } from "react";

export default function ParticularSearch() {
  const [filter, setFilter] = useState("all");

  return (
    <div className="section-card">
      <div style={{ padding: "1rem" }}>
        <h3>Buscador de Servicios</h3>
        <p>Filtro seleccionado: {filter}</p>
        {/* Aquí irá el HTML de los filtros y el grid de negocios */}
      </div>
    </div>
  );
}