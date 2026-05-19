"use client";

import ParticularSearch from "@/components/dashboard/ParticularSearch";
import { useLanguage } from "@/components/context/LanguageContext";

// GM: Componente aislado exclusivo para la experiencia de usuario del cliente final
export default function ParticularDashboard() {
  const { t } = useLanguage();

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>{t("dashboardTitle")}</h2>
          <p>{t("dashboardSubtitle")}</p>
        </div>
      </section>

      <section className="dashboard-grid" style={{ display: "block" }}>
        <ParticularSearch />
      </section>
    </div>
  );
}