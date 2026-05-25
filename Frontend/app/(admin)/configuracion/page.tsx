"use client";

import { useLanguage } from "@/components/context/LanguageContext";

export default function ConfiguracionPage() {
  const { t } = useLanguage();
  return (
    <div className="page-stack">
      <div className="page-hero">
        <div>
          <h2>{t("configTitle")}</h2>
          <p>{t("configSubtitle")}</p>
        </div>
      </div>

      <div className="section-card" style={{ minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "var(--ink-3)" }}>
          <i className="bi bi-gear" style={{ fontSize: 40, display: "block", marginBottom: 12 }} />
          <p style={{ margin: 0, fontSize: 14 }}>{t("configComingSoon")}</p>
        </div>
      </div>
    </div>
  );
}
