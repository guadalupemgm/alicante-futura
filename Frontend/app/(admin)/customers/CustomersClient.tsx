"use client";

import { useState, useEffect } from "react";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  business: string;
}

interface Appointment {
  id: number;
  date: string;
  time: string;
  customerId: number;
  status: string;
  serviceName: string;
}

export default function CustomersClient() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/customers")
      .then((res) => res.json())
      .then((data) => setCustomers(Array.isArray(data) ? data : []));

    fetch("http://localhost:3000/appointments")
      .then((res) => res.json())
      .then((data) => setAppointments(Array.isArray(data) ? data : []));
  }, []);

  const getNextBooking = (customerId: number) => {
    const today = new Date().toISOString().split("T")[0];
    const future = appointments
      .filter((a) => a.customerId === customerId && a.date >= today)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    if (future.length === 0) return "Sin reservas proximas";
    const next = future[0];
    return `${next.date} · ${next.time}`;
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "El nombre es obligatorio";
    if (!form.phone.trim()) newErrors.phone = "El telefono es obligatorio";
    else if (!/^\d{9}$/.test(form.phone.replace(/\s/g, ""))) newErrors.phone = "El telefono debe tener 9 digitos";
    if (!form.email.trim()) newErrors.email = "El email es obligatorio";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "El email no es valido";
    return newErrors;
  };

  const handleCreate = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    const res = await fetch("http://localhost:3000/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const newCustomer = await res.json();
      setCustomers([...customers, newCustomer]);
      setShowModal(false);
      setForm({ name: "", phone: "", email: "" });
      setSuccess("Cliente creado correctamente");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>Customer directory</h2>
          <p>Gestion visual de clientes y proximas reservas.</p>
        </div>
        <button className="primary-btn" type="button" onClick={() => setShowModal(true)}>
          Nuevo cliente
        </button>
      </section>

      {success && <p style={{ color: "green" }}>{success}</p>}

      <section className="section-card">
        <div className="search-row">
          <input
            className="input"
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="secondary-btn" type="button" onClick={() => setSearch("")}>
            Limpiar
          </button>
        </div>
      </section>

      <section className="customer-grid">
        {filtered.map((customer) => (
          <div className="customer-card" key={customer.id}>
            <p className="customer-name">{customer.name}</p>
            <p className="customer-meta">{customer.phone}</p>
            <p className="customer-meta">{customer.email}</p>
            <div className="customer-next">
              <strong>Proxima reserva:</strong> {getNextBooking(customer.id)}
            </div>
          </div>
        ))}
      </section>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3 className="modal-title">Nuevo cliente</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>

              <input className="input" placeholder="Nombre" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
              {errors.name && <p style={{ color: "red", fontSize: "0.8rem", margin: 0 }}>{errors.name}</p>}

              <input className="input" placeholder="Telefono" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              {errors.phone && <p style={{ color: "red", fontSize: "0.8rem", margin: 0 }}>{errors.phone}</p>}

              <input className="input" placeholder="Email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
              {errors.email && <p style={{ color: "red", fontSize: "0.8rem", margin: 0 }}>{errors.email}</p>}

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