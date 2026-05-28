"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/context/LanguageContext";

// Interface para tipar los datos que vienen del backend
interface Business {
  id: number;
  name: string;
  category: string;
  rating: number;
  address: string;
  imageUrl?: string;
}

export default function ParticularSearch() {
  const { t } = useLanguage();
  
  // Estados para filtros y búsqueda
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Estados para los datos de la API
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Estado para capturar fallos de red

  // LLAMADA REAL A LA API
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Sustituye esta URL por tu endpoint real (ej. "https://api.tuservidor.com/businesses" o "/api/businesses")
        const response = await fetch("http://localhost:3000/business");
        
        if (!response.ok) {
          throw new Error("Error al cargar los negocios");
        }
        
        const data: Business[] = await response.json();
        setBusinesses(data);
      } catch (err) {
        console.error("Error fetching businesses:", err);
        setError(t("errorLoadingBusinesses") || "No se pudieron cargar los negocios. Inténtalo de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [t]); // Se añade 't' si las traducciones cambian dinámicamente

  // Filtrado en tiempo real en el cliente (mantiene tu lógica actual)
  const filteredBusinesses = businesses.filter((biz) => {
    const matchesCategory = categoryFilter === "all" || biz.category === categoryFilter;
    const matchesSearch = biz.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          biz.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="search-container">
      
      {/* 1. SECCIÓN DE FILTROS Y BÚSQUEDA */}
      <div className="section-card search-filters-card" style={{ marginBottom: "2rem", padding: "1.5rem" }}>
        <h3 style={{ marginBottom: "1rem", fontSize: "1.25rem", fontWeight: 600 }}>
          {t("businessTitle")}
        </h3>
        
        <div className="search-form-layout" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {/* Input de texto de búsqueda */}
          <input
            type="text"
            placeholder={t("searchBusinessPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-control"
            style={{ flex: 1, padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--border)" }}
          />

          {/* Selector de Categorías */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-select"
            style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid var(--border)", minWidth: "180px" }}
          >
            <option value="all">{t("filterAll")}</option>
            <option value="beauty">Belleza y Estética</option>
            <option value="health">Salud y Bienestar</option>
            <option value="sports">Deportes y Fitness</option>
          </select>
        </div>
      </div>

      {/* 2. CONTROL DE ESTADOS (LOADING, ERROR Y GRID) */}
      {loading ? (
        <p style={{ textAlign: "center", color: "var(--muted)", padding: "2rem" }}>
          {t("loadingBusinesses")}
        </p>
      ) : error ? (
        <div className="section-card" style={{ textAlign: "center", padding: "3rem", color: "red" }}>
          <p>{error}</p>
        </div>
      ) : filteredBusinesses.length === 0 ? (
        <div className="section-card" style={{ textAlign: "center", padding: "3rem", color: "var(--muted)" }}>
          <p>{t("noBusinessesFound")}</p>
        </div>
      ) : (
        <div className="business-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
          {filteredBusinesses.map((biz) => (
            <div key={biz.id} className="section-card business-card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              
              {/* Encabezado visual de la tarjeta */}
              <div style={{ height: "140px", backgroundColor: "var(--border-subtle, #f3f4f6)", borderRadius: "6px 6px 0 0", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
                🖼️ {biz.category.toUpperCase()}
              </div>
              
              {/* Contenido de la tarjeta informativa */}
              <div style={{ padding: "1rem", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span className="badge badge--subtle" style={{ fontSize: "0.75rem" }}>
                      {biz.category}
                    </span>
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "#eab308" }}>
                      ⭐ {biz.rating}
                    </span>
                  </div>
                  <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem", fontWeight: 600 }}>
                    {biz.name}
                  </h4>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}>
                    📍 {biz.address}
                  </p>
                </div>

                {/* Enlace dinámico hacia el portal de reservas del negocio */}
                <Link 
                  href={`/booking/${biz.id}`} 
                  className="btn-primary" 
                  style={{ 
                    marginTop: "1rem", 
                    width: "100%", 
                    padding: "0.6rem", 
                    borderRadius: "6px", 
                    textAlign: "center",
                    display: "block",
                    textDecoration: "none"
                  }}
                >
                  {t("bookNow")}
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}