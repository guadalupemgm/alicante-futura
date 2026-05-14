"use client";

import { useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function ExportButton() {
  const handleExport = useCallback(async () => {
    const res = await fetch(`${API_URL}/appointments`, {
      cache: "no-store",
    });
    const bookings = await res.json();

    if (!bookings.length) {
      alert("No hay reservas para exportar.");
      return;
    }

    const headers = ["ID", "Fecha", "Hora", "Servicio", "Estado", "Cliente ID", "Negocio ID"];
    const rows = bookings.map((b: any) => [
      b.id,
      b.date,
      b.time,
      b.serviceName,
      b.status,
      b.customerId,
      b.businessId,
    ]);

    const csv = [headers, ...rows]
      .map(r => r.map((v: any) => `"${v}"`).join(";"))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Lista_Reservas.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <button className="primary-btn" type="button" onClick={handleExport}>
      Export report
    </button>
  );
}