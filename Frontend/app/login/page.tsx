"use client";
import { useAuth } from "@/components/context/AuthContext";
import { useState } from "react";
import s from "./login.module.css";

export default function LoginPage() {
  const { login, register } = useAuth(); // Asumo que añadirás 'register' a tu contexto
  
  // Estado para alternar entre Login y Registro
  const [isRegister, setIsRegister] = useState(false);

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

  // Manejador del Registro
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validación básica de contraseñas en el cliente
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      // Enviamos los datos al backend con el rol de cliente
      if (register) {
        await register({ name, email, phone, password, role: "customer" });
      } else {
        // Si aún no se tiene el contexto listo, se puede hacer un fetch directo aquí:
        // const res = await fetch('/api/register', { ... })
        console.log("Registrando:", { name, email, phone, password });
      }
    } catch {
      setError("Hubo un error al crear la cuenta. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Limpia los errores y campos al cambiar de pestaña
  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <main className={s.root}>
      {/* LEFT PANEL (Se mantiene fijo y elegante en ambos modos) */}
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

      {/* RIGHT PANEL (Dinamizado según el estado isRegister) */}
      <section className={s.right}>
        <div className={s.formTitle}>
          {isRegister ? "Crear cuenta" : "Iniciar sesión"}
        </div>
        <div className={s.formSub}>
          {isRegister ? "Regístrate como cliente" : "Accede a tu panel"}
        </div>

        {!isRegister ? (
          /* FORMULARIO DE LOGIN */
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
              onClick={toggleMode}
            >
              Crear cuenta nueva
            </button>
          </form>
        ) : (
          /* FORMULARIO DE REGISTRO (CLIENTE PARTICULAR) */
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
                placeholder="Mínimo 6 caracteres"
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
              onClick={toggleMode}
            >
              ¿Ya tienes cuenta? Inicia sesión
            </button>
          </form>
        )}

        <div className={s.bottomText}>Acceso protegido y cifrado</div>
      </section>
    </main>
  );
}