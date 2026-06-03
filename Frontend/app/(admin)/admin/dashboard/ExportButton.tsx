"use client";

import { useCallback } from "react";
import { useLanguage } from "@/components/context/LanguageContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface Booking {
  id: string | number;
  date: string;
  time: string;
  serviceName: string;
  status: string;
  customerId: string | number;
  businessId: string | number;
}

export default function ExportButton() {
  const { t } = useLanguage();

  const handleExport = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
    const res = await fetch(`${API_URL}/appointments`, {
      cache: "no-store",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    const bookings: Booking[] = await res.json();

    if (!bookings.length) {
      alert(t("noBookingsExport"));
      return;
    }

    const headers = ["ID", t("date"), t("time"), t("service"), t("status"), t("clientId"), t("businessLabel")];
    const rows: (string | number)[][] = bookings.map((b: Booking) => [
      b.id,
      b.date,
      b.time,
      b.serviceName,
      b.status,
      b.customerId,
      b.businessId,
    ]);

    const csv = [headers, ...rows]
      .map(r => r.map((v: string | number) => `"${v}"`).join(";"))
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