"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Pagination from "@/components/ui/Pagination";
import { useLanguage } from "@/components/context/LanguageContext";

const PER_PAGE = 8;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

type BusinessStatus = "active" | "inactive";

type Business = {
  id: number;
  name: string;
  category: string;
  email: string;
  phone: string;
  address: string;
  status: BusinessStatus;
};

export default function EmpresasClientePage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Business; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    fetch(API_URL + "/business")
      .then((r) => r.json())
      .then((d) => setBusinesses(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  const processedData = useMemo(() => {
  const q = search.toLowerCase();
  let data = businesses.filter(
    (b) => b.status === "active" &&
    (b.name.toLowerCase().includes(q) || b.category.toLowerCase().includes(q) || b.address.toLowerCase().includes(q))
  );

      if (sortConfig !== null) {
        data.sort((a, b) => {
          const aValue = a[sortConfig.key];
          const bValue = b[sortConfig.key];
          if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        });
      }
      return data;
    }, [businesses, search, sortConfig]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return processedData.slice(start, start + PER_PAGE);
  }, [processedData, page]);

  const handleReservar = (business: Business) => {
    router.push(`/reservas/nueva?businessId=${business.id}&businessName=${encodeURIComponent(business.name)}`);
  };

  const requestSort = (key: keyof Business) => {
  setSortConfig((prev) => ({
    key,
    direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
  }));
};

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>{t("empresasTitle")}</h2>
          <p>{t("empresasSubtitle")}</p>
        </div>
        <button className="primary-btn" onClick={() => router.push("/reservas/nueva")}>
          {t("newReservation")}
        </button>
      </section>

      <section className="section-card">
        <div className="panel-title-row">
          <h3 className="panel-title">{t("activeBusinesses")}</h3>
          <input
            className="input"
            style={{ maxWidth: 260, marginBottom: 0 }}
            type="text"
            placeholder={t("searchBusinessPlaceholder")}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {loading ? (
          <p style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>
            {t("loadingBusinesses")}
          </p>
        ) : paginated.length === 0 ? (
          <p style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>
            {t("noBusinessesFound")}
          </p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {[
                  { key: 'name', label: t("businessCol") },
                  { key: 'category', label: t("categoryCol") },
                  { key: 'phone', label: t("phoneCol") },
                  { key: 'address', label: t("addressCol") }
                ].map((col) => (
                  <th 
                    key={col.key} 
                    onClick={() => requestSort(col.key as keyof Business)} 
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    {col.label} ↕
                  </th>
                ))}
                <th style={{ textAlign: "right" }}>{t("bookCol")}</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((b) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 600 }}>{b.name}</td>
                  <td>
                    <span className="badge badge--confirmed">{b.category}</span>
                  </td>
                  <td>{b.phone}</td>
                  <td style={{ color: "var(--muted)", fontSize: 13 }}>{b.address}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="primary-btn"
                      style={{ padding: "6px 16px", fontSize: 13 }}
                      onClick={() => handleReservar(b)}
                    >
                      <i className="bi bi-calendar2-plus" style={{ marginRight: 6 }} />
                      {t("bookNow")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <Pagination
          total={processedData.length}
          page={page}
          perPage={PER_PAGE}
          onPageChange={setPage}
        />
      </section>
    </div>
  );
}
