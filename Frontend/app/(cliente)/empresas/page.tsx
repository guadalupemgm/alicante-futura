"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Pagination from "@/components/ui/Pagination";

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
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_URL + "/business")
      .then((r) => r.json())
      .then((d) => setBusinesses(Array.isArray(d) ? d : []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return businesses.filter(
      (b) =>
        b.status === "active" &&
        (b.name.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.address.toLowerCase().includes(q))
    );
  }, [businesses, search]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
  }, [filtered, page]);

  const handleReservar = (business: Business) => {
    router.push(`/reservas/nueva?businessId=${business.id}&businessName=${encodeURIComponent(business.name)}`);
  };

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>Empresas disponibles</h2>
          <p>Encuentra un negocio y reserva tu cita al instante.</p>
        </div>
        <button
          className="primary-btn"
          onClick={() => router.push("/reservas/nueva")}
        >
          + Nueva Reserva
        </button>
      </section>

      <section className="section-card">
        <div className="panel-title-row">
          <h3 className="panel-title">Negocios activos</h3>
          <input
            className="input"
            style={{ maxWidth: 260, marginBottom: 0 }}
            type="text"
            placeholder="Buscar por nombre, categoría..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        {loading ? (
          <p style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>
            Cargando negocios...
          </p>
        ) : paginated.length === 0 ? (
          <p style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>
            No se encontraron negocios.
          </p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Negocio</th>
                <th>Categoría</th>
                <th>Teléfono</th>
                <th>Dirección</th>
                <th style={{ textAlign: "right" }}>Reservar</th>
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
                      Reservar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <Pagination
          total={filtered.length}
          page={page}
          perPage={PER_PAGE}
          onPageChange={setPage}
        />
      </section>
    </div>
  );
}