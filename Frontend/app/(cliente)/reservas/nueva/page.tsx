"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/context/AuthContext";
import { useLanguage } from "@/components/context/LanguageContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Business = { id: number; name: string; category: string; address: string };

function NuevaReservaForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { user }     = useAuth();
  const { t, lang }  = useLanguage();

  const preBusinessId   = Number(searchParams.get("businessId") ?? 0);
  const preBusinessName = searchParams.get("businessName") ?? "";

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Stepper State
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    businessId:  preBusinessId,
    serviceName: "",
    date:        "",
    time:        "",
  });
  
  // Option state for Step 2
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Loading, Errors, Success
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);

  // Simulated Stripe Payment State
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    fetch(API_URL + "/business")
      .then((r) => r.json())
      .then((d) => setBusinesses(Array.isArray(d) ? d.filter((b: any) => b.status === "active") : []));
  }, []);

  // Auto-select pre-selected business and go to Step 2
  useEffect(() => {
    if (preBusinessId && businesses.length > 0) {
      setForm(f => ({ ...f, businessId: preBusinessId }));
      setStep(2);
    }
  }, [preBusinessId, businesses]);

  // Sync selectedOption when step is 2 or when form.serviceName / businessServices change
  useEffect(() => {
    if (step === 2) {
      if (form.serviceName) {
        if (businessServices.includes(form.serviceName)) {
          setSelectedOption(form.serviceName);
        } else {
          setSelectedOption("Otro");
        }
      } else {
        setSelectedOption(null);
      }
    }
  }, [step, form.serviceName, businessServices]);

  const selectedBusinessObj = useMemo(() => {
    return businesses.find(b => b.id === form.businessId);
  }, [businesses, form.businessId]);

  const filteredBusinesses = useMemo(() => {
    return businesses.filter(b => 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      b.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [businesses, searchQuery]);

  const getPopularServices = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("pelu") || cat.includes("barber") || cat.includes("estil")) {
      return ["Corte de pelo", "Lavado y peinado", "Corte + Barba", "Tinte de cabello"];
    }
    if (cat.includes("spa") || cat.includes("estet") || cat.includes("salud") || cat.includes("masaj")) {
      return ["Masaje relajante", "Manicura y Pedicura", "Tratamiento facial", "Limpieza de cutis"];
    }
    if (cat.includes("consult") || cat.includes("asesor") || cat.includes("abogad") || cat.includes("gestor")) {
      return ["Consulta básica", "Asesoría VIP", "Revisión de documentos", "Sesión de 1 Hora"];
    }
    return ["Servicio Estándar", "Consulta General", "Soporte Premium", "Asesoría Personalizada"];
  };

  const businessServices = useMemo(() => {
    if (!form.businessId) return [];
    
    // Check if the business has services stored in localStorage
    const saved = localStorage.getItem(`bf_services_by_business_${form.businessId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (_) {}
    }

    return [];
  }, [form.businessId]);

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
    "12:00", "12:30", "13:00", "15:00", "15:30", "16:00", 
    "16:30", "17:00", "17:30", "18:00", "18:30"
  ];

  // Formatting inputs for Simulated Card
  const handleCardNumberChange = (val: string) => {
    const clean = val.replace(/\D/g, "");
    const formatted = clean.match(/.{1,4}/g)?.join(" ") || clean;
    setCardNumber(formatted.slice(0, 19));
  };

  const handleExpiryChange = (val: string) => {
    const clean = val.replace(/\D/g, "");
    let formatted = clean;
    if (clean.length > 2) {
      formatted = `${clean.slice(0, 2)}/${clean.slice(2, 4)}`;
    }
    setCardExpiry(formatted.slice(0, 5));
  };

  const handleCvcChange = (val: string) => {
    const clean = val.replace(/\D/g, "");
    setCardCvc(clean.slice(0, 3));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.businessId || !form.serviceName || !form.date || !form.time) {
      setError(t("fillAllFields"));
      return;
    }

    if (!cardNumber || !cardName || !cardExpiry || cardCvc.length < 3) {
      setError(lang.code === "es" ? "Por favor rellena los datos de pago válidos." : "Please fill in valid payment details.");
      return;
    }

    setLoading(true);
    setError("");
    
    // Simulate Stripe payment request delay (2s)
    await new Promise(r => setTimeout(r, 2000));

    try {
      const res = await fetch(API_URL + "/appointments", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId:  form.businessId,
          customerId:  user?.customerId ?? 0,
          serviceName: form.serviceName,
          date:        form.date,
          time:        form.time,
          status:      "paid", // Prepaid reservation!
        }),
      });
      if (!res.ok) throw new Error();
      setPaymentSuccess(true);
      setSuccess(true);
    } catch {
      setError(t("errorCrearReserva"));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = () => {
    const receiptContent = `
==================================================
           COMPROBANTE DE PAGO BookFlow
==================================================
Código de Transacción: STRIPE-TX-${Math.random().toString(36).substring(2, 8).toUpperCase()}
Fecha de Pago:        ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
Pasarela de Pago:     Simulador Stripe (Entorno Seguro)
Estado del Pago:      APROBADO
--------------------------------------------------
DATOS DEL CLIENTE:
Nombre de Usuario:    ${user?.email?.split("@")[0] ?? "Usuario"}
Email de Contacto:    ${user?.email ?? ""}
--------------------------------------------------
DATOS DE LA RESERVA:
Negocio:              ${selectedBusinessObj?.name ?? "Negocio"}
Categoría:            ${selectedBusinessObj?.category ?? "Servicios"}
Dirección:            ${selectedBusinessObj?.address ?? "Local física"}
Servicio Solicitado:  ${form.serviceName}
Fecha Programada:     ${new Date(form.date).toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
Hora Programada:      ${form.time} hs
--------------------------------------------------
DETALLES DEL COBRO:
Subtotal:             28.93 €
I.V.A (21%):          6.07 €
Total Cobrado:        35.00 € (Pago Anticipado)
Método de Pago:       Tarjeta de Crédito (•••• ${cardNumber.slice(-4) || "4242"})
==================================================
¡Gracias por tu reserva en BookFlow! Presenta 
este comprobante el día de tu cita.
==================================================
`;
    const blob = new Blob([receiptContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Recibo_Reserva_${form.date}_BookFlow.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (success) {
    return (
      <div className="page-stack animate-fadeIn" style={{ maxWidth: 480, margin: "0 auto", paddingTop: "2rem" }}>
        <div className="section-card" style={{ textAlign: "center", padding: "2.5rem", borderRadius: "var(--r-lg)", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }}>
          <div className="success-icon-container" style={{
            width: 72, height: 72, background: "rgba(16, 185, 129, 0.1)", color: "#10b981", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 1.5rem"
          }}>
            <i className="bi bi-shield-fill-check"></i>
          </div>
          <h3 style={{ marginBottom: "0.5rem", fontWeight: 700 }}>{t("reservaCreada")}</h3>
          <p style={{ color: "var(--muted)", marginBottom: "1.5rem", fontSize: 14 }}>
            {lang.code === "es" 
              ? "Tu cita ha sido prepagada con éxito a través de Stripe y guardada en tu panel de control." 
              : "Your appointment was successfully prepaid via Stripe and saved to your dashboard."}
          </p>
          
          <button 
            onClick={handleDownloadReceipt}
            className="secondary-btn" 
            style={{ width: "100%", padding: "12px", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: "1.5rem", border: "1px dashed var(--border)" }}
          >
            <i className="bi bi-file-earmark-arrow-down-fill"></i>
            {lang.code === "es" ? "Descargar Recibo de Compra" : "Download Purchase Receipt"}
          </button>

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="secondary-btn" style={{ flex: 1 }} onClick={() => router.push("/reservas")}>
              {t("verMisReservas")}
            </button>
            <button className="primary-btn" style={{ flex: 1 }} onClick={() => router.push("/empresas")}>
              {t("volverEmpresas")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack animate-fadeIn" style={{ maxWidth: 640, margin: "0 auto", paddingTop: "1rem" }}>
      <section className="page-hero" style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2>{t("nuevaReservaTitle")}</h2>
          <p>{t("nuevaReservaSubtitle")}</p>
        </div>
        <button className="secondary-btn" onClick={() => {
          if (step > 1) setStep(step - 1);
          else router.push("/empresas");
        }}>
          {t("goBack")}
        </button>
      </section>

      {/* Stepper Indicator */}
      <div className="stepper-indicator">
        {[
          { num: 1, name: lang.code === "es" ? "Negocio" : "Business", icon: "bi-shop" },
          { num: 2, name: lang.code === "es" ? "Servicio" : "Service", icon: "bi-hammer" },
          { num: 3, name: lang.code === "es" ? "Fecha y Hora" : "Date & Time", icon: "bi-calendar-event" },
          { num: 4, name: lang.code === "es" ? "Pago" : "Payment", icon: "bi-credit-card" }
        ].map((s) => (
          <div key={s.num} className={`stepper-step ${step === s.num ? "active" : step > s.num ? "completed" : ""}`}>
            <div className="step-circle">
              {step > s.num ? <i className="bi bi-check-lg" /> : <i className={`bi ${s.icon}`} />}
            </div>
            <span className="step-label">{s.name}</span>
          </div>
        ))}
      </div>

      <div className="section-card" style={{ padding: "2rem", borderRadius: "var(--r-lg)", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
        
        {/* STEP 1: SELECT BUSINESS */}
        {step === 1 && (
          <div className="animate-slideIn">
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "1rem" }}>
              {lang.code === "es" ? "Paso 1: Selecciona un Negocio" : "Step 1: Select a Business"}
            </h3>
            <input 
              type="text" 
              className="input" 
              placeholder={t("searchBusinessPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ marginBottom: "1.25rem" }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "350px", overflowY: "auto", paddingRight: 4 }}>
              {filteredBusinesses.length === 0 ? (
                <p style={{ color: "var(--muted)", textAlign: "center", padding: "2rem" }}>
                  {t("noBusinessesFound")}
                </p>
              ) : filteredBusinesses.map((b) => (
                <div 
                  key={b.id} 
                  onClick={() => {
                    setForm({ ...form, businessId: b.id });
                    setStep(2);
                  }}
                  className={`business-select-card ${form.businessId === b.id ? "selected" : ""}`}
                >
                  <div className="business-card-logo">
                    <i className="bi bi-shop" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>{b.name}</h4>
                    <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--muted)" }}>{b.address}</p>
                  </div>
                  <span className="badge" style={{ textTransform: "capitalize", background: "var(--paper-3)" }}>
                    {b.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: SELECT SERVICE */}
        {step === 2 && (
          <div className="animate-slideIn">
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "1.25rem" }}>
              {lang.code === "es" ? "Paso 2: ¿Qué servicio necesitas?" : "Step 2: What service do you need?"}
            </h3>
            
            {selectedBusinessObj && (
              <div style={{ padding: "0.75rem 1rem", background: "var(--paper-2)", borderRadius: "var(--r)", display: "flex", alignItems: "center", gap: 10, marginBottom: "1.5rem" }}>
                <i className="bi bi-shop" style={{ color: "var(--primary)" }} />
                <span style={{ fontSize: 13, fontWeight: 500 }}>{selectedBusinessObj.name} — <span style={{ color: "var(--muted)", textTransform: "capitalize" }}>{selectedBusinessObj.category}</span></span>
              </div>
            )}

            <div className="page-stack">
              <div>
                <label className="kpi-card__label" style={{ fontSize: 11, marginBottom: 8 }}>
                  {lang.code === "es" ? "Selecciona un servicio:" : "Select a service:"}
                </label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "1.25rem" }}>
                  {businessServices.map((srv) => (
                    <button
                      key={srv}
                      type="button"
                      onClick={() => {
                        setSelectedOption(srv);
                        setForm({ ...form, serviceName: srv });
                      }}
                      className={`filter-pill ${selectedOption === srv ? "active" : ""}`}
                      style={{ border: "1px solid var(--border)", background: selectedOption === srv ? "var(--primary)" : "transparent" }}
                    >
                      {srv}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOption("Otro");
                      setForm({ ...form, serviceName: "" }); // Clear to let them write
                    }}
                    className={`filter-pill ${selectedOption === "Otro" ? "active" : ""}`}
                    style={{ border: "1px solid var(--border)", background: selectedOption === "Otro" ? "var(--primary)" : "transparent" }}
                  >
                    {lang.code === "es" ? "Otro" : "Other"}
                  </button>
                </div>
              </div>

              {/* Show text input ONLY if they selected "Otro" */}
              {selectedOption === "Otro" && (
                <div className="animate-fadeIn">
                  <label className="kpi-card__label" style={{ fontSize: 11, marginBottom: 6 }}>
                    {lang.code === "es" ? "Especifica el servicio *" : "Specify the service *"}
                  </label>
                  <input
                    className="input"
                    type="text"
                    placeholder={t("servicePlaceholder")}
                    value={form.serviceName}
                    onChange={(e) => setForm({ ...form, serviceName: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
              )}

              <div className="modal-actions" style={{ marginTop: "1.5rem" }}>
                <button type="button" className="secondary-btn" onClick={() => setStep(1)}>
                  {lang.code === "es" ? "Anterior" : "Previous"}
                </button>
                <button 
                  type="button" 
                  className="primary-btn" 
                  disabled={!form.serviceName.trim()} 
                  onClick={() => setStep(3)}
                >
                  {lang.code === "es" ? "Siguiente" : "Next"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: CHOOSE DATE & TIME */}
        {step === 3 && (
          <div className="animate-slideIn">
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "1.25rem" }}>
              {lang.code === "es" ? "Paso 3: Elige Fecha y Hora" : "Step 3: Choose Date & Time"}
            </h3>

            <div className="page-stack">
              <div>
                <label className="kpi-card__label" style={{ fontSize: 11, marginBottom: 6 }}>{t("dateFieldLabel")}</label>
                <input
                  className="input"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>

              {form.date && (
                <div>
                  <label className="kpi-card__label" style={{ fontSize: 11, marginBottom: 8 }}>
                    {lang.code === "es" ? "Horas disponibles para el día elegido:" : "Available slots for the selected day:"}
                  </label>
                  <div className="time-grid-picker">
                    {timeSlots.map((ts) => (
                      <button
                        key={ts}
                        type="button"
                        onClick={() => setForm({ ...form, time: ts })}
                        className={`time-slot-pill ${form.time === ts ? "selected" : ""}`}
                      >
                        {ts}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="modal-actions" style={{ marginTop: "1.5rem" }}>
                <button type="button" className="secondary-btn" onClick={() => setStep(2)}>
                  {lang.code === "es" ? "Anterior" : "Previous"}
                </button>
                <button 
                  type="button" 
                  className="primary-btn" 
                  disabled={!form.date || !form.time} 
                  onClick={() => setStep(4)}
                >
                  {lang.code === "es" ? "Siguiente" : "Next"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: STRIPE PRE-PAYMENT AND CONFIRMATION */}
        {step === 4 && (
          <div className="animate-slideIn">
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "1.25rem" }}>
              {lang.code === "es" ? "Paso 4: Confirmación y Pago Anticipado" : "Step 4: Confirmation & Prepayment"}
            </h3>

            {/* Selection Summary */}
            <div className="summary-box" style={{ background: "var(--paper-2)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "13px" }}>
                <div>
                  <span style={{ color: "var(--muted)", display: "block", fontSize: "11px" }}>NEGOCIO</span>
                  <strong style={{ color: "var(--ink)" }}>{selectedBusinessObj?.name}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--muted)", display: "block", fontSize: "11px" }}>SERVICIO</span>
                  <strong style={{ color: "var(--ink)" }}>{form.serviceName}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--muted)", display: "block", fontSize: "11px" }}>FECHA</span>
                  <strong style={{ color: "var(--ink)" }}>{form.date}</strong>
                </div>
                <div>
                  <span style={{ color: "var(--muted)", display: "block", fontSize: "11px" }}>HORA</span>
                  <strong style={{ color: "var(--ink)" }}>{form.time} hs</strong>
                </div>
              </div>
              <div style={{ borderTop: "1px dashed var(--border)", marginTop: "1rem", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", color: "var(--muted)" }}>Total a pagar (prepago):</span>
                <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--primary)" }}>35,00 €</span>
              </div>
            </div>

            {/* Simulated Stripe Checkout Form */}
            <form onSubmit={handleSubmit}>
              <div className="page-stack">
                
                {/* Credit Card Graphic mockup */}
                <div className="cc-card-graphic">
                  <div className="cc-card-header">
                    <span className="cc-card-logo">BookFlow Pay</span>
                    <i className="bi bi-wifi-2" style={{ fontSize: "20px" }} />
                  </div>
                  <div className="cc-card-chip" />
                  <div className="cc-card-number">
                    {cardNumber || "•••• •••• •••• ••••"}
                  </div>
                  <div className="cc-card-footer">
                    <div className="cc-card-field">
                      <span className="cc-card-label">CARDHOLDER</span>
                      <span className="cc-card-value">{cardName.toUpperCase() || "NOMBRE DEL TITULAR"}</span>
                    </div>
                    <div className="cc-card-field">
                      <span className="cc-card-label">EXPIRES</span>
                      <span className="cc-card-value">{cardExpiry || "MM/AA"}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)", marginBottom: 8, justifyContent: "center" }}>
                  <i className="bi bi-lock-fill" style={{ color: "var(--success-text)" }} />
                  <span>Pasarela de Pago Stripe simulada (Entorno seguro de pruebas)</span>
                </div>

                <div>
                  <label className="kpi-card__label" style={{ fontSize: 11, marginBottom: 4 }}>Titular de la tarjeta</label>
                  <input
                    className="input"
                    type="text"
                    placeholder="Ej. Juan Pérez"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="kpi-card__label" style={{ fontSize: 11, marginBottom: 4 }}>Número de tarjeta</label>
                  <div style={{ position: "relative" }}>
                    <input
                      className="input"
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                      required
                      style={{ paddingRight: "40px" }}
                    />
                    <i className="bi bi-credit-card-2-front" style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--muted)", fontSize: "18px" }} />
                  </div>
                </div>

                <div className="form-grid">
                  <div>
                    <label className="kpi-card__label" style={{ fontSize: 11, marginBottom: 4 }}>Fecha de caducidad</label>
                    <input
                      className="input"
                      type="text"
                      placeholder="MM/AA"
                      value={cardExpiry}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="kpi-card__label" style={{ fontSize: 11, marginBottom: 4 }}>Código CVC</label>
                    <input
                      className="input"
                      type="password"
                      placeholder="123"
                      value={cardCvc}
                      onChange={(e) => handleCvcChange(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {error && <p style={{ color: "#b91c1c", fontSize: 13, margin: "8px 0 0" }}>{error}</p>}

                <div className="modal-actions" style={{ marginTop: "1.5rem" }}>
                  <button type="button" className="secondary-btn" onClick={() => setStep(3)} disabled={loading}>
                    {lang.code === "es" ? "Anterior" : "Previous"}
                  </button>
                  <button type="submit" className="primary-btn" disabled={loading} style={{ background: "var(--primary)" }}>
                    {loading ? (
                      <span style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                        <span className="btn-spinner" />
                        {lang.code === "es" ? "Procesando en Stripe..." : "Processing Stripe..."}
                      </span>
                    ) : (
                      `${lang.code === "es" ? "Pagar 35,00 € y Reservar" : "Pay 35.00 € & Book"}`
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

      </div>

      <style>{`
        /* Stepper CSS System */
        .stepper-indicator {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2rem;
          position: relative;
          padding: 0 10px;
        }
        .stepper-indicator::before {
          content: "";
          position: absolute;
          top: 20px;
          left: 30px;
          right: 30px;
          height: 2px;
          background: var(--border);
          z-index: 1;
        }
        .stepper-step {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          width: 80px;
        }
        .step-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--paper-2);
          border: 2px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--muted);
          font-weight: 700;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .step-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--muted);
          text-align: center;
          white-space: nowrap;
          transition: color 0.3s;
        }
        .stepper-step.active .step-circle {
          background: var(--primary);
          border-color: var(--primary);
          color: #fff;
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
        }
        .stepper-step.active .step-label {
          color: var(--ink);
        }
        .stepper-step.completed .step-circle {
          background: #10b981;
          border-color: #10b981;
          color: #fff;
        }
        
        /* Selectable Business Card CSS */
        .business-select-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: var(--r-md);
          border: 1px solid var(--border);
          cursor: pointer;
          transition: all 0.2s ease;
          background: var(--paper);
        }
        .business-select-card:hover {
          transform: translateY(-2px);
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        }
        .business-select-card.selected {
          border-color: var(--primary);
          background: rgba(99, 102, 241, 0.04);
        }
        .business-card-logo {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: var(--paper-2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          font-size: 18px;
        }

        /* Time slots grid */
        .time-grid-picker {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(75px, 1fr));
          gap: 10px;
          margin-top: 8px;
          max-height: 220px;
          overflow-y: auto;
          padding: 4px;
        }
        .time-slot-pill {
          padding: 8px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--paper);
          color: var(--ink);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: center;
        }
        .time-slot-pill:hover {
          border-color: var(--primary);
          transform: translateY(-1px);
        }
        .time-slot-pill.selected {
          background: var(--primary);
          color: #fff;
          border-color: var(--primary);
          box-shadow: 0 4px 10px rgba(99, 102, 241, 0.2);
        }

        /* Stripe Credit Card preview card */
        .cc-card-graphic {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: #fff;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(79, 70, 229, 0.35);
          aspect-ratio: 1.586/1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          margin: 10px auto 20px;
          width: 100%;
          max-width: 320px;
        }
        .cc-card-graphic::before {
          content: "";
          position: absolute;
          width: 150px;
          height: 150px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 50%;
          top: -30px;
          right: -30px;
        }
        .cc-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .cc-card-logo {
          font-weight: 800;
          font-size: 14px;
          letter-spacing: 0.5px;
        }
        .cc-card-chip {
          width: 38px;
          height: 28px;
          background: linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%);
          border-radius: 6px;
          margin-top: 10px;
          box-shadow: inset 0 1px 1px rgba(255,255,255,0.4);
        }
        .cc-card-number {
          font-size: 18px;
          font-family: monospace;
          letter-spacing: 2px;
          margin-top: 15px;
          text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
        .cc-card-footer {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
        }
        .cc-card-field {
          display: flex;
          flex-direction: column;
        }
        .cc-card-label {
          font-size: 7.5px;
          color: rgba(255, 255, 255, 0.6);
          letter-spacing: 0.5px;
        }
        .cc-card-value {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin-top: 2px;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          max-width: 160px;
        }

        /* Animations */
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-slideIn {
          animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        /* Spinning loader inside buttons */
        .btn-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-radius: 50%;
          border-top-color: #fff;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function NuevaReservaPage() {
  return (
    <Suspense fallback={<div className="auth-loading"><div className="auth-loading__spinner" /></div>}>
      <NuevaReservaForm />
    </Suspense>
  );
}
