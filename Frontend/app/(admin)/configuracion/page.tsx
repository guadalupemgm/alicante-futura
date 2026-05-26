"use client";

import { useLanguage } from "@/components/context/LanguageContext";
import { useAuth } from "@/components/context/AuthContext";
import ConfigTabs from "@/components/config/ConfigTabs";

export default function ConfiguracionPage() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const role = user?.role ?? "customer";

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>{t("configTitle")}</h2>
          <p>{t("configSubtitle")}</p>
        </div>
      </section>

      <section className="section-card">
        <ConfigTabs role={role} />
      </section>
    </div>
  );
}
