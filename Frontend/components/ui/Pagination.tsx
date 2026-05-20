"use client";

interface PaginationProps {
  total: number;
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ total, page, perPage, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "12px 0 4px",
    }}>
      <span style={{ fontSize: "13px", color: "var(--muted)" }}>
        {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} de {total}
      </span>

      <div style={{ display: "flex", gap: "4px" }}>
        <button
          className="secondary-btn"
          style={{ padding: "4px 10px", fontSize: "13px" }}
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          <i className="bi bi-chevron-left"></i>
        </button>

        {pages.map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            style={{
              padding: "4px 10px",
              fontSize: "13px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              background: p === page ? "var(--primary)" : "transparent",
              color: p === page ? "#fff" : "var(--text)",
              cursor: "pointer",
              fontWeight: p === page ? 600 : 400,
            }}
          >
            {p}
          </button>
        ))}

        <button
          className="secondary-btn"
          style={{ padding: "4px 10px", fontSize: "13px" }}
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}
