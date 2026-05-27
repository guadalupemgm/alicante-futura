"use client";

import { useCallback } from "react";
import { useLanguage } from "@/components/context/LanguageContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function ExportButton() {
  const { t } = useLanguage();

  const handleExport = useCallback(async () => {
    const res = await fetch(`${API_URL}/appointments`, {
      cache: "no-store",
    });
    const bookings = await res.json();

    if (!bookings.length) {
      alert(t("noBookingsExport"));
      return;
    }

    const headers = ["ID", t("date"), t("time"), t("service"), t("status"), t("clientId"), t("businessLabel")];
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
  }, [t]);

  return (
    <button className="primary-btn" type="button" onClick={handleExport}>
      {t("exportReport")}
    </button>
  );
}