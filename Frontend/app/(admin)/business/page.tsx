"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/components/context/LanguageContext";

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

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function Badge({ status, activeLabel, inactiveLabel }: { status: BusinessStatus; activeLabel: string; inactiveLabel: string }) {
  return (
    <span className={`badge badge--${status === "active" ? "confirmed" : "pending"}`}>
      {status === "active" ? activeLabel : inactiveLabel}
    </span>
  );
}

export default function BusinessesPage() {
  const { t } = useLanguage();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [showModal, setShowModal]   = useState(false);
  const [success, setSuccess]       = useState("");
  const [form, setForm] = useState({ name: "", category: "", email: "", phone: "", address: "", status: "active" });

  useEffect(() => {
    fetch(`${API_URL}/business`)
      .then((r) => r.json())
      .then((d) => setBusinesses(Array.isArray(d) ? d : []));
  }, []);

  const handleCreate = async () => {
    const res = await fetch(`${API_URL}/business`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const newBusiness = await res.json();
      setBusinesses([...businesses, newBusiness]);
      setShowModal(false);
      setForm({ name: "", category: "", email: "", phone: "", address: "", status: "active" });
      setSuccess(t("businessCreated"));
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const totalActive   = businesses.filter((b) => b.status === "active").length;
  const totalInactive = businesses.filter((b) => b.status === "inactive").length;

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>{t("businessTitle")}</h2>
          <p>{t("businessSubtitle")}</p>
        </div>
        <button className="primary-btn" type="button" onClick={() => setShowModal(true)}>
          {t("newBusiness")}
        </button>
      </section>

      {success && <p style={{ color: "green" }}>{success}</p>}

      <section className="kpi-grid">
        <div className="kpi-card">
          <p className="kpi-card__label">{t("active")}</p>
          <h3 className="kpi-card__value">{totalActive}</h3>
          <p className="kpi-card__meta kpi-card__meta--positive">
            {businesses.length} {t("businessTitle").toLowerCase()}
          </p>
        </div>
        <div className="kpi-card">
          <p className="kpi-card__label">{t("inactive")}</p>
          <h3 className="kpi-card__value">{totalInactive}</h3>
          <p className="kpi-card__meta kpi-card__meta--warning">
            {totalInactive} {t("toReview")}
          </p>
        </div>
      </section>

      <section className="section-card">
        <div className="panel-title-row">
          <h3 className="panel-title">{t("businessTitle")}</h3>
          <span style={{ color: "var(--muted)", fontSize: 14 }}>{businesses.length} resultados</span>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{t("name")}</th>
              <th>{t("category")}</th>
              <th>{t("email")}</th>
              <th>{t("phone")}</th>
              <th>{t("address")}</th>
              <th>{t("statusBusiness")}</th>
            </tr>
          </thead>
          <tbody>
            {businesses.map((b) => (
              <tr key={b.id}>
                <td style={{ fontWeight: 600 }}>NEG-{String(b.id).padStart(3, "0")}</td>
                <td>{b.name}</td>
                <td>{b.category}</td>
                <td>{b.email}</td>
                <td>{b.phone}</td>
                <td>{b.address}</td>
                <td>
                  <Badge
                    status={b.status as BusinessStatus}
                    activeLabel={t("active")}
                    inactiveLabel={t("inactive")}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3 className="modal-title">{t("newBusinessModal")}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <input className="input" type="text" placeholder={t("nameBusiness")}
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className="input" type="text" placeholder={t("category")}
                value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              <input className="input" type="email" placeholder={t("emailPlaceholder")}
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className="input" type="tel" placeholder={t("phonePlaceholder")}
                value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              <input className="input" type="text" placeholder={t("address")}
                value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              <select className="input" value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">{t("active")}</option>
                <option value="inactive">{t("inactive")}</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setShowModal(false)}>{t("cancel")}</button>
              <button className="primary-btn" onClick={handleCreate}>{t("save")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}