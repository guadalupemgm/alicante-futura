export default function ConfiguracionPage() {
  return (
    <div className="page-stack">
      <div className="page-hero">
        <div>
          <h2>Configuración</h2>
          <p>Ajustes de la plataforma</p>
        </div>
      </div>

      <div className="section-card" style={{ minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "var(--ink-3)" }}>
          <i className="bi bi-gear" style={{ fontSize: 40, display: "block", marginBottom: 12 }} />
          <p style={{ margin: 0, fontSize: 14 }}>Próximamente — Opciones de configuración</p>
        </div>
      </div>
    </div>
  );
}