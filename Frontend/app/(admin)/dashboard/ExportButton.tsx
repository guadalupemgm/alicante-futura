"use client";

import { useCallback } from "react";

export default function ExportButton() {
  const handleExport = useCallback(async () => {
    const res = await fetch("http://localhost:3000/appointments", {
      cache: "no-store",
    });
    const bookings = await res.json();

    const headers = ["ID", "Fecha", "Hora", "Estado", "Cliente ID", "Negocio ID", "Servicio"];
    const rows = bookings.map((b: any) => [
      b.id, b.date, b.time, b.status, b.customerId, b.businessId, b.serviceName
    ]);

    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reservas.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <button className="primary-btn" type="button" onClick={handleExport}>
      Export report
    </button>
  );
}