"use client";
import { useAuth } from "@/components/context/AuthContext";
import { useState } from "react";
import s from "./login.module.css";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
        <div className={s.formTitle}>Iniciar sesión</div>
        <div className={s.formSub}>Accede a tu panel</div>

        <form onSubmit={handleSubmit} className={s.form}>
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
            onClick={() => {/* TODO: implementar registro */}}
          >
            Crear cuenta nueva
          </button>
        </form>

        <div className={s.bottomText}>Acceso protegido y cifrado</div>
      </section>
    </main>
  );
}