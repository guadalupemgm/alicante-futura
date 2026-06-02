"use client";

import { useLanguage } from "@/components/context/LanguageContext";
import { useAuth } from "@/components/context/AuthContext";
import ConfigTabs from "@/components/config/ConfigTabs";

export default function SettingsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();

  const role = user?.role ?? "customer";

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>{t("settingsTitle")}</h2>
          <p>{t("settingsSubtitle")}</p>
        </div>
      </section>

      <section className="section-card">
        <ConfigTabs role={role} />
      </section>
    </div>
  );
}