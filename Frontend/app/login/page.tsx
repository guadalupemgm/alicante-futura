"use client";
import { useAuth } from "@/components/context/AuthContext";
import { useState } from "react";
import s from "./login.module.css";
import { useLanguage, LANGUAGES, TranslationKey } from "@/components/context/LanguageContext";

export default function LoginPage() {
  const { login, register } = useAuth();
  const { t, lang, setLang } = useLanguage();
  
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
      setError(t("loginErrorIncorrect" as TranslationKey));
    } finally {
      setLoading(false);
    }
  };

  // Manejador del Registro de Cliente Particular
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !phone || !password) {
      setError(t("fillAllFields" as TranslationKey));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t("invalidEmail" as TranslationKey));
      return;
    }

    if (phone.length < 9) {
      setError(t("phoneMinLength" as TranslationKey));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwordsMismatch" as TranslationKey));
      return;
    }

    if (password.length < 6) {
      setError(t("passwordMinLength" as TranslationKey));
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\S]{6,}$/;
    if (!passwordRegex.test(password)) {
      setError(t("passwordFormat" as TranslationKey));
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
      setError(t("registrationError" as TranslationKey));
    } finally {
      setLoading(false);
    }
  };

  // Manejador de la primera fase de Registro de Empresa (Datos)
  const handleBusinessDataSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!bizName || !bizAddress || !email || !password) {
      setError(t("fillAllRequired" as TranslationKey));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t("invalidEmail" as TranslationKey));
      return;
    }

    if (bizPhone && bizPhone.length < 9) {
      setError(t("phoneMinLength" as TranslationKey));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("passwordsMismatch" as TranslationKey));
      return;
    }

    if (password.length < 6) {
      setError(t("passwordMinLength" as TranslationKey));
      return;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\S]{6,}$/;
    if (!passwordRegex.test(password)) {
      setError(t("passwordFormat" as TranslationKey));
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
      setError(t("cardNameRequired" as TranslationKey));
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
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || t("registrationError" as TranslationKey));
      }

      // Simular tiempo de carga de pasarela de pago bancario
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 2. Iniciar sesión automáticamente una vez confirmada la subscripción
      await login(email, password);
    } catch (err: any) {
      console.error(err);
      setError(err.message || t("registrationError" as TranslationKey));
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

  const renderHeroTitle = () => {
    if (lang.code === "en") {
      return <>Manage bookings<br /><em>smartly</em></>;
    } else if (lang.code === "fr") {
      return <>Gerez vos reservations<br />de maniere <em>intelligente</em></>;
    } else {
      return <>Gestiona reservas<br />de forma <em>inteligente</em></>;
    }
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
          <h1>{renderHeroTitle()}</h1>
          <p className={s.heroDesc}>{t("loginHeroDesc" as TranslationKey)}</p>
        </div>

        <div className={s.stats}>
          <div className={s.stat}><strong>+12k</strong><span>{t("loginStatBookings" as TranslationKey)}</span></div>
          <div className={s.stat}><strong>99.9%</strong><span>Uptime</span></div>
          <div className={s.stat}><strong>247</strong><span>{t("loginStatBusinesses" as TranslationKey)}</span></div>
        </div>
      </section>

      {/* RIGHT PANEL */}
      <section className={s.right}>
        {/* Language Switcher */}
        <div className={s.langSelector}>
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              type="button"
              className={`${s.langBtn} ${lang.code === l.code ? s.langBtnActive : ""}`}
              onClick={() => setLang(l)}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>

        <div className={s.formTitle}>
          {mode === "login" 
            ? t("loginTitle" as TranslationKey) 
            : mode === "customer-register" 
              ? t("customerRegisterTitle" as TranslationKey) 
              : t("businessRegisterTitle" as TranslationKey)}
        </div>
        <div className={s.formSub}>
          {mode === "login" 
            ? t("loginFormSubDefault" as TranslationKey) 
            : mode === "customer-register" 
              ? t("customerRegisterSub" as TranslationKey) 
              : showPayment 
                ? t("loginFormSubBizPayment" as TranslationKey) 
                : t("loginFormSubBizData" as TranslationKey)}
        </div>

        {/* MODO 1: INICIAR SESIÓN */}
        {mode === "login" && (
          <form onSubmit={handleLoginSubmit} className={s.form}>
            <div className={s.field}>
              <label className={s.label} htmlFor="email">{t("emailLabel" as TranslationKey)}</label>
              <input
                id="email"
                className={s.input}
                type="email"
                placeholder={t("emailPlaceholder" as TranslationKey)}
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={s.field}>
              <label className={s.label} htmlFor="password">{t("passwordLabel" as TranslationKey)}</label>
              <div className={s.inputWrap}>
                <input
                  id="password"
                  className={`${s.input} ${s.inputWithBtn}`}
                  type={showPassword ? "text" : "password"}
                  placeholder={t("password" as TranslationKey)}
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
                  {showPassword ? t("hidePasswordLabel" as TranslationKey) : t("showPasswordLabel" as TranslationKey)}
                </button>
              </div>
            </div>

            {error && <p className={s.errorMsg}>{error}</p>}

            <button type="submit" className={s.submitBtn} disabled={loading}>
              {loading ? t("loggingIn" as TranslationKey) : t("loginBtn" as TranslationKey)}
            </button>

            <button
              type="button"
              className={s.registerBtn}
              onClick={() => switchMode("customer-register")}
              style={{ marginTop: "10px" }}
            >
              {t("createCustomerBtn" as TranslationKey)}
            </button>

            <button
              type="button"
              className={s.registerBtn}
              onClick={() => switchMode("business-register")}
              style={{ marginTop: "6px", borderColor: "rgba(200,82,42,0.3)" }}
            >
              {t("registerBusinessPremium" as TranslationKey)}
            </button>
          </form>
        )}

        {/* MODO 2: REGISTRO CLIENTE PARTICULAR */}
        {mode === "customer-register" && (
          <form onSubmit={handleRegisterSubmit} className={s.form}>
            <div className={s.field}>
              <label className={s.label} htmlFor="reg-name">{t("fullNameLabel" as TranslationKey)}</label>
              <input
                id="reg-name"
                className={s.input}
                type="text"
                placeholder={t("fullNamePlaceholder" as TranslationKey)}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className={s.field}>
              <label className={s.label} htmlFor="reg-email">{t("emailLabel" as TranslationKey)}</label>
              <input
                id="reg-email"
                className={s.input}
                type="email"
                placeholder={t("emailPlaceholder" as TranslationKey)}
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={s.field}>
              <label className={s.label} htmlFor="reg-phone">{t("mobilePhoneLabel" as TranslationKey)}</label>
              <input
                id="reg-phone"
                className={s.input}
                type="tel"
                placeholder="600000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                required
              />
            </div>

            <div className={s.field}>
              <label className={s.label} htmlFor="reg-password">{t("passwordLabel" as TranslationKey)}</label>
              <input
                id="reg-password"
                className={s.input}
                type="password"
                placeholder={t("ownerPasswordPlaceholder" as TranslationKey)}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className={s.fieldHint}>{t("pwFormatHint" as TranslationKey)}</span>
            </div>

            <div className={s.field}>
              <label className={s.label} htmlFor="confirm-password">{t("confirmPasswordLabel" as TranslationKey)}</label>
              <input
                id="confirm-password"
                className={s.input}
                type="password"
                placeholder={t("repeatPasswordPlaceholder" as TranslationKey)}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className={s.errorMsg}>{error}</p>}

            <button type="submit" className={s.submitBtn} disabled={loading}>
              {loading ? t("registeringText" as TranslationKey) : t("registerCustomerBtn" as TranslationKey)}
            </button>

            <button
              type="button"
              className={s.registerBtn}
              onClick={() => switchMode("login")}
              style={{ marginTop: "10px" }}
            >
              {t("alreadyHaveAccount" as TranslationKey)}
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
                  <label className={s.label} htmlFor="biz-name">{t("bizNameLabel" as TranslationKey)}</label>
                  <input
                    id="biz-name"
                    className={s.input}
                    type="text"
                    placeholder={t("bizNamePlaceholder" as TranslationKey)}
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                    required
                  />
                </div>

                <div className={s.field}>
                  <label className={s.label} htmlFor="biz-address">{t("bizAddressLabel" as TranslationKey)}</label>
                  <input
                    id="biz-address"
                    className={s.input}
                    type="text"
                    placeholder={t("bizAddressPlaceholder" as TranslationKey)}
                    value={bizAddress}
                    onChange={(e) => setBizAddress(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div className={s.field}>
                    <label className={s.label} htmlFor="biz-category">{t("bizCategoryLabel" as TranslationKey)}</label>
                    <input
                      id="biz-category"
                      className={s.input}
                      type="text"
                      placeholder={t("bizCategoryPlaceholder" as TranslationKey)}
                      value={bizCategory}
                      onChange={(e) => setBizCategory(e.target.value)}
                    />
                  </div>
                  <div className={s.field}>
                    <label className={s.label} htmlFor="biz-phone">{t("bizPhoneLabel" as TranslationKey)}</label>
                    <input
                      id="biz-phone"
                      className={s.input}
                      type="tel"
                      placeholder="600000000"
                      value={bizPhone}
                      onChange={(e) => setBizPhone(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                </div>

                <div className={s.field}>
                  <label className={s.label} htmlFor="owner-email">{t("ownerEmailLabel" as TranslationKey)}</label>
                  <input
                    id="owner-email"
                    className={s.input}
                    type="email"
                    placeholder={t("ownerEmailPlaceholder" as TranslationKey)}
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div className={s.field}>
                    <label className={s.label} htmlFor="owner-password">{t("ownerPasswordLabel" as TranslationKey)}</label>
                    <input
                      id="owner-password"
                      className={s.input}
                      type="password"
                      placeholder={t("ownerPasswordPlaceholder" as TranslationKey)}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <span className={s.fieldHint}>{t("pwFormatHint" as TranslationKey)}</span>
                  </div>
                  <div className={s.field}>
                    <label className={s.label} htmlFor="confirm-owner-password">{t("confirmOwnerPasswordLabel" as TranslationKey)}</label>
                    <input
                      id="confirm-owner-password"
                      className={s.input}
                      type="password"
                      placeholder={t("ownerPasswordPlaceholder" as TranslationKey)}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {error && <p className={s.errorMsg}>{error}</p>}

                <button type="submit" className={s.submitBtn}>
                  {t("continueToPayment" as TranslationKey)}
                </button>

                <button
                  type="button"
                  className={s.registerBtn}
                  onClick={() => switchMode("login")}
                  style={{ marginTop: "10px" }}
                >
                  {t("alreadyHaveAccount" as TranslationKey)}
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
                    {t("monthlySubPro" as TranslationKey)}
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: 700, margin: "5px 0 10px", color: "#e0734a", fontFamily: "'Fraunces', serif" }}>
                    {t("subPriceMonth" as TranslationKey).split("/")[0]} <span style={{ fontSize: "14px", fontWeight: 400, color: "#aaa" }}>/ {t("subPriceMonth" as TranslationKey).split("/")[1]}</span>
                  </div>
                  <div style={{ fontSize: "12.5px", opacity: 0.85, lineHeight: "1.5", whiteSpace: "pre-line" }}>
                    {t("subFeatures" as TranslationKey)}
                  </div>
                </div>

                <div className={s.field}>
                  <label className={s.label} htmlFor="card-name">{t("cardHolderLabel" as TranslationKey)}</label>
                  <input
                    id="card-name"
                    className={s.input}
                    type="text"
                    placeholder={t("cardHolderPlaceholder" as TranslationKey)}
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required
                  />
                </div>

                <div className={s.field}>
                  <label className={s.label} htmlFor="card-number">{t("cardNumberLabel" as TranslationKey)}</label>
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
                    <label className={s.label} htmlFor="card-expiry">{t("cardExpiryLabel" as TranslationKey)}</label>
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
                  {loading ? t("processingSecurePayment" as TranslationKey) : t("payAndCreateAccount" as TranslationKey)}
                </button>

                <button
                  type="button"
                  className={s.registerBtn}
                  onClick={(e) => {
                    e.preventDefault();
                    setError("");
                    setShowPayment(false);
                  }}
                  disabled={loading}
                >
                  {t("modifyingDataBtn" as TranslationKey)}
                </button>
              </form>
            )}
          </>
        )}

        <div className={s.bottomText}>{t("secureAccessSSL" as TranslationKey)}</div>
      </section>
    </main>
  );
}