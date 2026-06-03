"use client";

import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/components/context/LanguageContext";
import Pagination from "@/components/ui/Pagination";

const PER_PAGE = 9;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

const emptyForm = { name: "", phone: "", email: "" };

export default function CustomersClient() {
  const { t } = useLanguage();
  const [customers, setCustomers]       = useState<Customer[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Crear
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState(emptyForm);

  // Editar
  const [editTarget, setEditTarget] = useState<Customer | null>(null);
  const [editForm, setEditForm]     = useState(emptyForm);

  const [success, setSuccess] = useState("");
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [search, setSearch]   = useState("");
  const [page, setPage]       = useState(1);

  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const authHeaders = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  useEffect(() => {
    fetch(`${API_URL}/customers`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => setCustomers(Array.isArray(data) ? data : []));
    fetch(`${API_URL}/appointments`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => setAppointments(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setPage(1);
    }, 0);
  }, [search]);

  const getNextBooking = (customerId: number) => {
    const today = new Date().toISOString().split("T")[0];
    const future = appointments
      .filter((a) => a.customerId === customerId && a.date >= today)
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    if (future.length === 0) return t("noNextBooking");
    const next = future[0];
    return next.date + " · " + next.time;
  };

  const validate = (f: typeof emptyForm) => {
    const newErrors: Record<string, string> = {};
    if (!f.name.trim()) newErrors.name = t("errName");
    if (!f.phone.trim()) newErrors.phone = t("errPhone");
    else if (!/^\d{9}$/.test(f.phone.replace(/\s/g, ""))) newErrors.phone = t("errPhoneFormat");
    if (!f.email.trim()) newErrors.email = t("errEmail");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) newErrors.email = t("errEmailFormat");
    return newErrors;
  };

  const handleCreate = async () => {
    const newErrors = validate(form);
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    const res = await fetch(`${API_URL}/customers`, {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const newCustomer = await res.json();
      setCustomers([...customers, newCustomer]);
      setShowModal(false);
      setForm(emptyForm);
      setSuccess(t("customerCreated"));
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const openEdit = (c: Customer) => {
    setEditTarget(c);
    setEditForm({ name: c.name, phone: c.phone, email: c.email });
    setErrors({});
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    const newErrors = validate(editForm);
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    const res = await fetch(`${API_URL}/customers/${editTarget.id}`, {
      method: "PATCH",
      headers: authHeaders,
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      const updated = await res.json();
      setCustomers(customers.map((c) => (c.id === updated.id ? updated : c)));
      setEditTarget(null);
      setSuccess("Cliente actualizado correctamente");
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  const filtered = useMemo(() =>
    customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
  , [customers, search]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
  }, [filtered, page]);

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>{t("customersTitle")}</h2>
          <p>{t("customersSubtitle")}</p>
        </div>
        <button className="primary-btn" type="button" onClick={() => setShowModal(true)}>
          {t("newCustomer")}
        </button>
      </section>

      {success && <p style={{ color: "green" }}>{success}</p>}

      <section className="section-card">
        <div className="search-row">
          <input className="input" placeholder={t("searchCustomer")} value={search}
            onChange={(e) => setSearch(e.target.value)} />
          <button className="secondary-btn" type="button" onClick={() => setSearch("")}>
            {t("clearSearch")}
          </button>
        </div>
      </section>

      <section className="customer-grid">
        {paginated.map((customer) => (
          <div className="customer-card" key={customer.id}>
            <p className="customer-name">{customer.name}</p>
            <p className="customer-meta">{customer.phone}</p>
            <p className="customer-meta">{customer.email}</p>
            <div className="customer-next">
              <strong>{t("nextBooking")}</strong> {getNextBooking(customer.id)}
            </div>
            <button
              className="secondary-btn"
              style={{ marginTop: "0.75rem", width: "100%", fontSize: "0.8rem" }}
              onClick={() => openEdit(customer)}
            >
              ✏️ Editar
            </button>
          </div>
        ))}
      </section>

      <Pagination total={filtered.length} page={page} perPage={PER_PAGE} onPageChange={setPage} />

      {/* Modal Crear */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3 className="modal-title">{t("newCustomerModal")}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <input className="input" placeholder={t("namePlaceholder")} value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
              {errors.name && <p style={{ color: "red", fontSize: "0.8rem", margin: 0 }}>{errors.name}</p>}
              <input className="input" placeholder={t("phonePlaceholder")} value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              {errors.phone && <p style={{ color: "red", fontSize: "0.8rem", margin: 0 }}>{errors.phone}</p>}
              <input className="input" placeholder={t("emailPlaceholder")} value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
              {errors.email && <p style={{ color: "red", fontSize: "0.8rem", margin: 0 }}>{errors.email}</p>}
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
            <h3 className="modal-title">✏️ Editar cliente</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <input className="input" placeholder={t("namePlaceholder")} value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              {errors.name && <p style={{ color: "red", fontSize: "0.8rem", margin: 0 }}>{errors.name}</p>}
              <input className="input" placeholder={t("phonePlaceholder")} value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
              {errors.phone && <p style={{ color: "red", fontSize: "0.8rem", margin: 0 }}>{errors.phone}</p>}
              <input className="input" placeholder={t("emailPlaceholder")} value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              {errors.email && <p style={{ color: "red", fontSize: "0.8rem", margin: 0 }}>{errors.email}</p>}
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