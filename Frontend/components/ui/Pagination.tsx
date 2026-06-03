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

  const getPages = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 10) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);

    if (page > 4) {
      pages.push("...");
    }

    const start = Math.max(2, page - 2);
    const end = Math.min(totalPages - 1, page + 2);

    let adjustedStart = start;
    let adjustedEnd = end;

    if (page <= 4) {
      adjustedEnd = 5;
    }
    if (page >= totalPages - 3) {
      adjustedStart = totalPages - 4;
    }

    for (let i = adjustedStart; i <= adjustedEnd; i++) {
      pages.push(i);
    }

    if (page < totalPages - 3) {
      pages.push("...");
    }

    pages.push(totalPages);
    return pages;
  };

  const pages = getPages();

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "12px",
      padding: "12px 0 4px",
    }}>
      <span style={{ 
        fontSize: "13px", 
        color: "var(--muted)",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}>
        {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} de {total}
      </span>

      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
        <button
          className="secondary-btn"
          style={{ padding: "4px 10px", fontSize: "13px" }}
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          <i className="bi bi-chevron-left"></i>
        </button>

        {pages.map((p, idx) => {
          if (p === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                style={{
                  padding: "4px 10px",
                  fontSize: "13px",
                  color: "var(--muted)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ...
              </span>
            );
          }

          const pageNum = p as number;
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`pg-btn ${pageNum === page ? "pg-btn--active" : ""}`}
            >
              {pageNum}
            </button>
          );
        })}

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

