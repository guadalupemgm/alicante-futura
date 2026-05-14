"use client";

import { useState, useEffect } from "react";

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

function Badge({ status }: { status: BusinessStatus }) {
  return (
    <span className={`badge badge--${status === "active" ? "confirmed" : "pending"}`}>
      {status === "active" ? "Activo" : "Inactivo"}
    </span>
  );
}

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    name: "",
    category: "",
    email: "",
    phone: "",
    address: "",
    status: "active",
  });

  useEffect(() => {
    fetch(`${API_URL}/business`)
      .then((r) => r.json())
      .then((d) => setBusinesses(Array.isArray(d) ? d : []));
  }, []);

  const handleCreate = async () => {
    const res = await fetch(`${API_URL}/business`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        category: form.category,
        email: form.email,
        phone: form.phone,
        address: form.address,
        status: form.status,
      }),
    });
    if (res.ok) {
      const newBusiness = await res.json();
      setBusinesses([...businesses, newBusiness]);
      setShowModal(false);
      setForm({ name: "", category: "", email: "", phone: "", address: "", status: "active" });
      setSuccess("Negocio registrado correctamente");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const totalActive = businesses.filter((b) => b.status === "active").length;
  const totalInactive = businesses.filter((b) => b.status === "inactive").length;

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>Negocios</h2>
          <p>Gestión de negocios registrados en la plataforma.</p>
        </div>
        <button className="primary-btn" type="button" onClick={() => setShowModal(true)}>
          Añadir negocio
        </button>
      </section>

      {success && <p style={{ color: "green" }}>{success}</p>}

      <section className="kpi-grid">
        <div className="kpi-card">
          <p className="kpi-card__label">Negocios activos</p>
          <h3 className="kpi-card__value">{totalActive}</h3>
          <p className="kpi-card__meta kpi-card__meta--positive">
            {businesses.length} negocios en total
          </p>
        </div>
        <div className="kpi-card">
          <p className="kpi-card__label">Inactivos</p>
          <h3 className="kpi-card__value">{totalInactive}</h3>
          <p className="kpi-card__meta kpi-card__meta--warning">
            {totalInactive} por revisar
          </p>
        </div>
      </section>

      <section className="section-card">
        <div className="panel-title-row">
          <h3 className="panel-title">Listado de negocios</h3>
          <span style={{ color: "var(--muted)", fontSize: 14 }}>{businesses.length} resultados</span>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Estado</th>
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
                <td><Badge status={b.status as BusinessStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3 className="modal-title">Añadir negocio</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <input
                className="input"
                type="text"
                placeholder="Nombre del negocio"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="input"
                type="text"
                placeholder="Categoría (ej: Peluquería, Spa...)"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
              <input
                className="input"
                type="email"
                placeholder="Email de contacto"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                className="input"
                type="tel"
                placeholder="Teléfono"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <input
                className="input"
                type="text"
                placeholder="Dirección"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
              <select
                className="input"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="active">Activo</option>
                <option value="inactive">Inactivo</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="primary-btn" onClick={handleCreate}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}