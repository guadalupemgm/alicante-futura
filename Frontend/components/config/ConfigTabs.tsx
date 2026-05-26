import React, { useState } from "react";
import { useLanguage, TranslationKey } from "@/components/context/LanguageContext";

function SaveButton() {
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
  };

  return (
    <button className="primary-btn" style={{ marginTop: "1rem" }} onClick={handleSave} disabled={saving}>
      {saving ? (t("settingsSaving") as string) : saved ? (t("configSavedText" as TranslationKey) as string) : (t("saveChanges" as TranslationKey) as string)}
    </button>
  );
}

function AdminConfig() {
  const { t } = useLanguage();
  return (
    <div className="config-section" style={{ padding: "1rem", animation: "fadeIn 0.4s ease" }}>
      <h3 style={{ marginBottom: "1rem", color: "var(--ink)" }}>{t("configAdminGlobal" as TranslationKey)}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <div>
          <label style={{ fontWeight: 600, color: "var(--ink-2)", display: "block", marginBottom: "0.5rem" }}>{t("configSystemTimezone" as TranslationKey)}</label>
          <select className="select">
            <option>Europe/Madrid</option>
            <option>UTC</option>
            <option>America/New_York</option>
          </select>
        </div>
        <div>
          <label style={{ fontWeight: 600, color: "var(--ink-2)", display: "block", marginBottom: "0.5rem" }}>{t("configMainCurrency" as TranslationKey)}</label>
          <select className="select">
            <option>EUR (€)</option>
            <option>USD ($)</option>
          </select>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ fontWeight: 600, color: "var(--ink-2)", display: "block", marginBottom: "0.5rem" }}>{t("configActiveUsers" as TranslationKey)}</label>
          <div style={{ padding: "1rem", background: "var(--paper-3)", borderRadius: "var(--r)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
             <input type="checkbox" defaultChecked />
             <span style={{ color: "var(--ink)" }}>{t("configNewUserVerification" as TranslationKey)}</span>
          </div>
        </div>
      </div>
      <SaveButton />
    </div>
  );
}

function BusinessConfig() {
  const { t } = useLanguage();
  return (
    <div className="config-section" style={{ padding: "1rem", animation: "fadeIn 0.4s ease" }}>
      <h3 style={{ marginBottom: "1rem", color: "var(--ink)" }}>{t("configBusinessSettingsTitle" as TranslationKey)}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        <div>
          <h4 style={{ color: "var(--ink-2)", marginBottom: "1rem" }}>{t("configHoursAndBookings" as TranslationKey)}</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.9rem", color: "var(--ink-2)", display: "block", marginBottom: "0.5rem" }}>{t("configDefaultDuration" as TranslationKey)}</label>
              <input type="number" className="input" defaultValue={30} min={5} step={5} />
            </div>
            <div>
              <label style={{ fontSize: "0.9rem", color: "var(--ink-2)", display: "block", marginBottom: "0.5rem" }}>{t("configMarginBetween" as TranslationKey)}</label>
              <input type="number" className="input" defaultValue={10} min={0} step={5} />
            </div>
          </div>
        </div>

        <div>
          <h4 style={{ color: "var(--ink-2)", marginBottom: "1rem" }}>{t("configBookingPolicies" as TranslationKey)}</h4>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.9rem", color: "var(--ink-2)", display: "block", marginBottom: "0.5rem" }}>{t("configMinAdvance" as TranslationKey)}</label>
              <input type="number" className="input" defaultValue={24} min={1} />
            </div>
            <div>
              <label style={{ fontSize: "0.9rem", color: "var(--ink-2)", display: "block", marginBottom: "0.5rem" }}>{t("configMaxBookings" as TranslationKey)}</label>
              <input type="number" className="input" defaultValue={2} min={1} />
            </div>
          </div>
        </div>

      </div>
      <SaveButton />
    </div>
  );
}

function CustomerConfig() {
  const { t } = useLanguage();
  return (
    <div className="config-section" style={{ padding: "1rem", animation: "fadeIn 0.4s ease" }}>
      <h3 style={{ marginBottom: "1rem", color: "var(--ink)" }}>{t("configCustomerPrefs" as TranslationKey)}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        <div>
          <h4 style={{ color: "var(--ink-2)", marginBottom: "1rem" }}>{t("configNotificationsTitle" as TranslationKey)}</h4>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--ink)" }}>
              <input type="checkbox" defaultChecked /> {t("configEmailReminders" as TranslationKey)}
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--ink)" }}>
              <input type="checkbox" /> {t("configSMSReminders" as TranslationKey)}
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--ink)" }}>
              <input type="checkbox" defaultChecked /> {t("configPromotions" as TranslationKey)}
            </label>
          </div>
        </div>

        <div>
          <h4 style={{ color: "var(--ink-2)", marginBottom: "1rem" }}>{t("configPrivacyTitle" as TranslationKey)}</h4>
          <button className="danger-btn" style={{ background: "transparent", color: "var(--danger-text)", border: "1px solid var(--danger-text)" }}>
            {t("configRequestDeletion" as TranslationKey)}
          </button>
        </div>

      </div>
      <SaveButton />
    </div>
  );
}

interface ConfigTabsProps {
  role: "admin" | "business" | "customer";
}

export default function ConfigTabs({ role }: ConfigTabsProps) {
  const { t } = useLanguage();
  
  const tabs = [
    { key: "admin", label: t("configTabAdmin" as TranslationKey), component: <AdminConfig /> },
    { key: "business", label: t("configTabBusiness" as TranslationKey), component: <BusinessConfig /> },
    { key: "customer", label: t("configTabCustomer" as TranslationKey), component: <CustomerConfig /> },
  ];

  const visibleTabs = tabs.filter((tab) => tab.key === role);
  const [active, setActive] = React.useState(visibleTabs[0]?.key ?? "admin");
  const activeComponent = visibleTabs.find((tab) => tab.key === active)?.component;

  return (
    <div className="config-tabs">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      <nav className="tab-nav" style={{ display: "flex", gap: "1.5rem", marginBottom: "2rem", borderBottom: "1px solid var(--line)" }}>
        {visibleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "1.1rem",
              fontWeight: 600,
              padding: "0.5rem 1rem",
              cursor: "pointer",
              color: tab.key === active ? "var(--primary)" : "var(--ink-3)",
              borderBottom: tab.key === active ? "3px solid var(--primary)" : "3px solid transparent",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <section style={{ minHeight: "300px" }}>{activeComponent}</section>
    </div>
  );
}


