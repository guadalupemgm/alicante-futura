"use client";

import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/components/context/LanguageContext";
import Pagination from "@/components/ui/Pagination";

const PER_PAGE = 8;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

const emptyForm = {
  name: "",
  category: "",
  email: "",
  phone: "",
  address: "",
  status: "active",
  ownerEmail: "",
  ownerPassword: "",
};

const emptyEditForm = {
  name: "",
  category: "",
  email: "",
  phone: "",
  address: "",
  status: "active" as BusinessStatus,
};

function Badge({ status, activeLabel, inactiveLabel }: { status: BusinessStatus; activeLabel: string; inactiveLabel: string }) {
  return (
    <span className={"badge badge--" + (status === "active" ? "confirmed" : "pending")}>
      {status === "active" ? activeLabel : inactiveLabel}
    </span>
  );
}

export default function BusinessesPage() {
  const { t } = useLanguage();

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [showModal, setShowModal]   = useState(false);
  const [success, setSuccess]       = useState("");
  const [page, setPage]             = useState(1);
  const [errors, setErrors]         = useState<Record<string, string>>({});

  // Crear
  const [form, setForm] = useState(emptyForm);

  // Editar
  const [editTarget, setEditTarget] = useState<Business | null>(null);
  const [editForm, setEditForm]     = useState(emptyEditForm);

  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const authHeaders = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  useEffect(() => {
    fetch(API_URL + "/business")
      .then((r) => r.json())
      .then((d) => setBusinesses(Array.isArray(d) ? d : []));
  }, []);

  const validateCreate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "El nombre es obligatorio";
    if (!form.category.trim()) newErrors.category = "La categoría es obligatoria";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = "Email inválido";
    if (!/^[0-9+\s()-]{6,20}$/.test(form.phone)) newErrors.phone = "Teléfono inválido";
    if (!form.address.trim()) newErrors.address = "La dirección es obligatoria";
    if (!/^\S+@\S+\.\S+$/.test(form.ownerEmail)) newErrors.ownerEmail = "Email del propietario inválido";
    if (form.ownerPassword.length < 6) newErrors.ownerPassword = "Mínimo 6 caracteres";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEdit = () => {
    const newErrors: Record<string, string> = {};
    if (!editForm.name.trim()) newErrors.name = "El nombre es obligatorio";
    if (!editForm.category.trim()) newErrors.category = "La categoría es obligatoria";
    if (editForm.email && !/^\S+@\S+\.\S+$/.test(editForm.email)) newErrors.email = "Email inválido";
    if (editForm.phone && !/^[0-9+\s()-]{6,20}$/.test(editForm.phone)) newErrors.phone = "Teléfono inválido";
    if (!editForm.address.trim()) newErrors.address = "La dirección es obligatoria";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateCreate()) return;
    const res = await fetch(API_URL + "/business", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const newBusiness = await res.json();
      setBusinesses([...businesses, newBusiness]);
      setShowModal(false);
      setForm(emptyForm);
      setErrors({});
      setSuccess(t("businessCreated"));
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const openEdit = (b: Business) => {
    setEditTarget(b);
    setEditForm({
      name: b.name,
      category: b.category ?? "",
      email: b.email ?? "",
      phone: b.phone ?? "",
      address: b.address,
      status: b.status,
    });
    setErrors({});
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    if (!validateEdit()) return;
    const res = await fetch(`${API_URL}/business/${editTarget.id}`, {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      const updated = await res.json();
      setBusinesses(businesses.map((b) => (b.id === updated.id ? updated : b)));
      setEditTarget(null);
      setSuccess("Negocio actualizado correctamente");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const paginated = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return businesses.slice(start, start + PER_PAGE);
  }, [businesses, page]);

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
          <span style={{ color: "var(--muted)", fontSize: 14 }}>
            {businesses.length} resultados
          </span>
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
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((b) => (
              <tr key={b.id}>
                <td style={{ fontWeight: 600 }}>NEG-{String(b.id).padStart(3, "0")}</td>
                <td>{b.name}</td>
                <td>{b.category}</td>
                <td>{b.email}</td>
                <td>{b.phone}</td>
                <td>{b.address}</td>
                <td>
                  <Badge status={b.status} activeLabel={t("active")} inactiveLabel={t("inactive")} />
                </td>
                <td>
                  <button
                    className="secondary-btn"
                    style={{ fontSize: "0.78rem", padding: "0.3rem 0.75rem" }}
                    onClick={() => openEdit(b)}
                  >
                    ✏️ Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination total={businesses.length} page={page} perPage={PER_PAGE} onPageChange={setPage} />
      </section>

      {/* Modal Crear */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3 className="modal-title">{t("newBusinessModal")}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
              {[
                { key: "name", placeholder: t("nameBusiness"), type: "text" },
                { key: "category", placeholder: t("category"), type: "text" },
                { key: "email", placeholder: t("emailPlaceholder"), type: "email" },
                { key: "phone", placeholder: t("phonePlaceholder"), type: "tel" },
                { key: "address", placeholder: t("address"), type: "text" },
              ].map(({ key, placeholder, type }) => (
                <div key={key}>
                  <input
                    className={`input ${errors[key] ? "input-error" : ""}`}
                    type={type}
                    placeholder={placeholder}
                    value={(form as any)[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  />
                  {errors[key] && <span className="error-text">{errors[key]}</span>}
                </div>
              ))}
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="active">{t("active")}</option>
                <option value="inactive">{t("inactive")}</option>
              </select>
              <div>
                <input className={`input ${errors.ownerEmail ? "input-error" : ""}`} type="email"
                  placeholder="Email del propietario" value={form.ownerEmail}
                  onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })} />
                {errors.ownerEmail && <span className="error-text">{errors.ownerEmail}</span>}
              </div>
              <div>
                <input className={`input ${errors.ownerPassword ? "input-error" : ""}`} type="password"
                  placeholder="Contraseña del propietario" value={form.ownerPassword}
                  onChange={(e) => setForm({ ...form, ownerPassword: e.target.value })} />
                {errors.ownerPassword && <span className="error-text">{errors.ownerPassword}</span>}
              </div>
            </div>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setShowModal(false)}>{t("cancel")}</button>
              <button className="primary-btn" onClick={handleCreate}>{t("save")}</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {editTarget && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3 className="modal-title">✏️ Editar negocio</h3>
            <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>
              NEG-{String(editTarget.id).padStart(3, "0")} · {editTarget.name}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
              {[
                { key: "name", placeholder: t("nameBusiness"), type: "text" },
                { key: "category", placeholder: t("category"), type: "text" },
                { key: "email", placeholder: t("emailPlaceholder"), type: "email" },
                { key: "phone", placeholder: t("phonePlaceholder"), type: "tel" },
                { key: "address", placeholder: t("address"), type: "text" },
              ].map(({ key, placeholder, type }) => (
                <div key={key}>
                  <input
                    className={`input ${errors[key] ? "input-error" : ""}`}
                    type={type}
                    placeholder={placeholder}
                    value={(editForm as any)[key]}
                    onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                  />
                  {errors[key] && <span className="error-text">{errors[key]}</span>}
                </div>
              ))}
              <select className="input" value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as BusinessStatus })}>
                <option value="active">{t("active")}</option>
                <option value="inactive">{t("inactive")}</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setEditTarget(null)}>{t("cancel")}</button>
              <button className="primary-btn" onClick={handleEdit}>{t("save")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}