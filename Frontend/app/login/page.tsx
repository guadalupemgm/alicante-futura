"use client";
import { useAuth } from "@/components/context/AuthContext";
import { useState } from "react";
import s from "./login.module.css";

export default function LoginPage() {
  const { login, register } = useAuth();
  
  // Estado de navegación: "login" | "customer-register" | "business-register"
  const [mode, setMode] = useState<"login" | "customer-register" | "business-register">("login");
  
  // Control de la pasarela de pago para empresas
  const [showPayment, setShowPayment] = useState(false);

  // Estados comunes y de Login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados exclusivos para el Registro de Cliente Particular
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Estados exclusivos para el Registro de Empresa
  const [bizName, setBizName] = useState("");
  const [bizCategory, setBizCategory] = useState("");
  const [bizPhone, setBizPhone] = useState("");
  const [bizAddress, setBizAddress] = useState("");

  // Estados de la pasarela de pago
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  // Manejador del Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      setError("Correo o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  // Manejador del Registro de Cliente Particular
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      if (register) {
        await register({ name, email, phone, password, role: "customer" });
      } else {
        console.log("Registrando cliente:", { name, email, phone, password });
      }
    } catch {
      setError("Hubo un error al crear la cuenta. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Manejador de la primera fase de Registro de Empresa (Datos)
  const handleBusinessDataSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!bizName || !bizAddress || !email || !password) {
      setError("Por favor, rellena todos los campos obligatorios.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres.");
      return;
    }

    // Pasamos a la pasarela de pago
    setShowPayment(true);
  };

  // Manejador del Pago y Registro Final de la Empresa
  const handleBusinessPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!cardName || !cardNumber || !cardExpiry || !cardCvc) {
      setError("Por favor, rellena todos los datos de tu tarjeta de crédito.");
      return;
    }

    setLoading(true);
    try {
      // 1. Llamar al endpoint público del backend para crear el negocio y el usuario dueño
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${API_URL}/business/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: bizName,
          address: bizAddress,
          category: bizCategory || "General",
          phone: bizPhone || "",
          ownerEmail: email,
          ownerPassword: password
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error al crear la cuenta del negocio");
      }

      // Simular tiempo de carga de pasarela de pago bancario
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 2. Iniciar sesión automáticamente una vez confirmada la subscripción
      await login(email, password);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al procesar el pago. Por favor, inténtalo de nuevo.");
      setLoading(false);
    }
  };

  // Limpia los errores y campos al alternar vistas
  const switchMode = (newMode: "login" | "customer-register" | "business-register") => {
    setMode(newMode);
    setShowPayment(false);
    setError("");
    setPassword("");
    setConfirmPassword("");
    setEmail("");
    setName("");
    setPhone("");
    setBizName("");
    setBizCategory("");
    setBizPhone("");
    setBizAddress("");
    setCardName("");
    setCardNumber("");
    setCardExpiry("");
    setCardCvc("");
  };

  return (
    <main className={s.root}>
      {/* LEFT PANEL */}
      <section className={s.left}>
        <div className={s.leftCircle1} />
        <div className={s.leftCircle2} />

        <div className={s.brand}>
          <div className={s.brandMark}>B</div>
          <span className={s.brandName}>BookFlow</span>
        </div>

        <div className={s.hero}>
          <h1>
            Gestiona reservas<br />
            de forma <em>inteligente</em>
          </h1>
          <p className={s.heroDesc}>
            Plataforma moderna para administrar citas, reservas y clientes
            desde un panel elegante y rápido.
          </p>
        </div>

        <div className={s.stats}>
          <div className={s.stat}><strong>+12k</strong><span>Reservas</span></div>
          <div className={s.stat}><strong>99.9%</strong><span>Uptime</span></div>
          <div className={s.stat}><strong>247</strong><span>Negocios</span></div>
        </div>
      </section>

      {/* RIGHT PANEL */}
      <section className={s.right}>
        <div className={s.formTitle}>
          {mode === "login" 
            ? "Iniciar sesión" 
            : mode === "customer-register" 
              ? "Crear cuenta" 
              : "Registrar empresa"}
        </div>
        <div className={s.formSub}>
          {mode === "login" 
            ? "Accede a tu panel administrativo" 
            : mode === "customer-register" 
              ? "Regístrate como cliente particular" 
              : showPayment 
                ? "Introduce tus datos bancarios para activar la suscripción" 
                : "Introduce los datos de tu nuevo negocio"}
        </div>

        {/* MODO 1: INICIAR SESIÓN */}
        {mode === "login" && (
          <form onSubmit={handleLoginSubmit} className={s.form}>
            <div className={s.field}>
              <label className={s.label} htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                className={s.input}
                type="email"
                placeholder="tu@email.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={s.field}>
              <label className={s.label} htmlFor="password">Contraseña</label>
              <div className={s.inputWrap}>
                <input
                  id="password"
                  className={`${s.input} ${s.inputWithBtn}`}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={s.eyeBtn}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? "Ocultar" : "Mostrar"}
                </button>
              </div>
            </div>

            {error && <p className={s.errorMsg}>{error}</p>}

            <button type="submit" className={s.submitBtn} disabled={loading}>
              {loading ? "Entrando..." : "Entrar →"}
            </button>

            <button
              type="button"
              className={s.registerBtn}
              onClick={() => switchMode("customer-register")}
              style={{ marginTop: "10px" }}
            >
              Crear cuenta de cliente
            </button>

            <button
              type="button"
              className={s.registerBtn}
              onClick={() => switchMode("business-register")}
              style={{ marginTop: "6px", borderColor: "rgba(200,82,42,0.3)" }}
            >
              💼 Registrar mi empresa (Premium)
            </button>
          </form>
        )}

        {/* MODO 2: REGISTRO CLIENTE PARTICULAR */}
        {mode === "customer-register" && (
          <form onSubmit={handleRegisterSubmit} className={s.form}>
            <div className={s.field}>
              <label className={s.label} htmlFor="reg-name">Nombre completo</label>
              <input
                id="reg-name"
                className={s.input}
                type="text"
                placeholder="Juan Pérez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className={s.field}>
              <label className={s.label} htmlFor="reg-email">Correo electrónico</label>
              <input
                id="reg-email"
                className={s.input}
                type="email"
                placeholder="juan@email.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={s.field}>
              <label className={s.label} htmlFor="reg-phone">Teléfono móvil</label>
              <input
                id="reg-phone"
                className={s.input}
                type="tel"
                placeholder="600 000 000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className={s.field}>
              <label className={s.label} htmlFor="reg-password">Contraseña</label>
              <input
                id="reg-password"
                className={s.input}
                type="password"
                placeholder="Mínimo 4 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className={s.field}>
              <label className={s.label} htmlFor="confirm-password">Confirmar contraseña</label>
              <input
                id="confirm-password"
                className={s.input}
                type="password"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className={s.errorMsg}>{error}</p>}

            <button type="submit" className={s.submitBtn} disabled={loading}>
              {loading ? "Registrando..." : "Registrarse e iniciar sesión →"}
            </button>

            <button
              type="button"
              className={s.registerBtn}
              onClick={() => switchMode("login")}
              style={{ marginTop: "10px" }}
            >
              ¿Ya tienes cuenta? Inicia sesión
            </button>
          </form>
        )}

        {/* MODO 3: REGISTRO EMPRESA */}
        {mode === "business-register" && (
          <>
            {/* FASE A: INTRODUCIR DATOS DE LA EMPRESA */}
            {!showPayment ? (
              <form onSubmit={handleBusinessDataSubmit} className={s.form}>
                <div className={s.field}>
                  <label className={s.label} htmlFor="biz-name">Nombre de la empresa *</label>
                  <input
                    id="biz-name"
                    className={s.input}
                    type="text"
                    placeholder="Mi Negocio S.L."
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                    required
                  />
                </div>

                <div className={s.field}>
                  <label className={s.label} htmlFor="biz-address">Dirección de la empresa *</label>
                  <input
                    id="biz-address"
                    className={s.input}
                    type="text"
                    placeholder="Calle Mayor 12, Alicante"
                    value={bizAddress}
                    onChange={(e) => setBizAddress(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div className={s.field}>
                    <label className={s.label} htmlFor="biz-category">Categoría</label>
                    <input
                      id="biz-category"
                      className={s.input}
                      type="text"
                      placeholder="Peluquería"
                      value={bizCategory}
                      onChange={(e) => setBizCategory(e.target.value)}
                    />
                  </div>
                  <div className={s.field}>
                    <label className={s.label} htmlFor="biz-phone">Teléfono móvil</label>
                    <input
                      id="biz-phone"
                      className={s.input}
                      type="tel"
                      placeholder="600 000 000"
                      value={bizPhone}
                      onChange={(e) => setBizPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className={s.field}>
                  <label className={s.label} htmlFor="owner-email">Correo del propietario *</label>
                  <input
                    id="owner-email"
                    className={s.input}
                    type="email"
                    placeholder="propietario@empresa.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div className={s.field}>
                    <label className={s.label} htmlFor="owner-password">Contraseña *</label>
                    <input
                      id="owner-password"
                      className={s.input}
                      type="password"
                      placeholder="••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className={s.field}>
                    <label className={s.label} htmlFor="confirm-owner-password">Confirmar *</label>
                    <input
                      id="confirm-owner-password"
                      className={s.input}
                      type="password"
                      placeholder="••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {error && <p className={s.errorMsg}>{error}</p>}

                <button type="submit" className={s.submitBtn}>
                  Continuar al pago →
                </button>

                <button
                  type="button"
                  className={s.registerBtn}
                  onClick={() => switchMode("login")}
                  style={{ marginTop: "10px" }}
                >
                  ¿Ya tienes cuenta? Inicia sesión
                </button>
              </form>
            ) : (
              /* FASE B: PASARELA DE PAGO */
              <form onSubmit={handleBusinessPaymentSubmit} className={s.form}>
                
                {/* Visual Premium Box */}
                <div style={{
                  background: "linear-gradient(135deg, #1e1e24 0%, #0e0e10 100%)",
                  color: "#fff",
                  padding: "20px",
                  borderRadius: "14px",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  border: "1px solid rgba(200,82,42,0.2)"
                }}>
                  <div style={{
                    position: "absolute", top: "-20px", right: "-20px",
                    width: "80px", height: "80px", borderRadius: "50%",
                    background: "rgba(200, 82, 42, 0.2)", filter: "blur(10px)"
                  }} />
                  <div style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.7, fontWeight: 600 }}>
                    Suscripción Mensual Pro
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: 700, margin: "5px 0 10px", color: "#e0734a", fontFamily: "'Fraunces', serif" }}>
                    14,99 € <span style={{ fontSize: "14px", fontWeight: 400, color: "#aaa" }}>/ mes</span>
                  </div>
                  <div style={{ fontSize: "12.5px", opacity: 0.85, lineHeight: "1.5" }}>
                    ✓ Panel de administración de reservas completo<br />
                    ✓ Enlace personalizado para tus clientes<br />
                    ✓ Configuración de horarios y servicios ilimitados<br />
                    ✓ Soporte 24/7 y facturación mensual
                  </div>
                </div>

                <div className={s.field}>
                  <label className={s.label} htmlFor="card-name">Titular de la tarjeta</label>
                  <input
                    id="card-name"
                    className={s.input}
                    type="text"
                    placeholder="Nombre Completo"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required
                  />
                </div>

                <div className={s.field}>
                  <label className={s.label} htmlFor="card-number">Número de tarjeta</label>
                  <input
                    id="card-number"
                    className={s.input}
                    type="text"
                    placeholder="4000 1234 5678 9010"
                    value={cardNumber}
                    maxLength={19}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "");
                      let formatted = val.match(/.{1,4}/g)?.join(" ") || val;
                      setCardNumber(formatted);
                    }}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div className={s.field}>
                    <label className={s.label} htmlFor="card-expiry">Vencimiento</label>
                    <input
                      id="card-expiry"
                      className={s.input}
                      type="text"
                      placeholder="MM/AA"
                      value={cardExpiry}
                      maxLength={5}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "");
                        if (val.length > 2) {
                          val = val.substring(0, 2) + "/" + val.substring(2, 4);
                        }
                        setCardExpiry(val);
                      }}
                      required
                    />
                  </div>
                  <div className={s.field}>
                    <label className={s.label} htmlFor="card-cvc">CVC</label>
                    <input
                      id="card-cvc"
                      className={s.input}
                      type="password"
                      placeholder="123"
                      value={cardCvc}
                      maxLength={3}
                      onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ""))}
                      required
                    />
                  </div>
                </div>

                {error && <p className={s.errorMsg}>{error}</p>}

                <button type="submit" className={s.submitBtn} disabled={loading} style={{ background: "#c8522a" }}>
                  {loading ? "Procesando pago seguro..." : "Pagar 14,99 € y crear cuenta →"}
                </button>

                <button
                  type="button"
                  className={s.registerBtn}
                  onClick={() => setShowPayment(false)}
                  disabled={loading}
                >
                  ← Modificar datos
                </button>
              </form>
            )}
          </>
        )}

        <div className={s.bottomText}>Acceso protegido y cifrado SSL</div>
      </section>
    </main>
  );
}