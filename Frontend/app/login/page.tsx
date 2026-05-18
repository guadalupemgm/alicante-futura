"use client";
import { useAuth } from "@/components/context/AuthContext";
import { useState } from "react";
import { useRouter } from "next/navigation";
import s from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
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
    <div className={s.backgroundGlow}></div>

    <section className={s.left}>
      <div className={s.overlay}></div>

      <div className={s.content}>
        <div className={s.brand}>
          <div className={s.logo}>B</div>

          <div>
            <h2>BookFlow</h2>
            <p>Smart Booking Platform</p>
          </div>
        </div>

        <div className={s.hero}>
          <span className={s.badge}>Admin Dashboard</span>

          <h1>
            Gestiona reservas
            <br />
            de forma inteligente
          </h1>

          <p>
            Plataforma moderna para administrar citas, reservas y clientes
            desde un único panel elegante y rápido.
          </p>

          <div className={s.stats}>
            <div>
              <strong>+12k</strong>
              <span>Reservas</span>
            </div>

            <div>
              <strong>99.9%</strong>
              <span>Uptime</span>
            </div>

            <div>
              <strong>24/7</strong>
              <span>Soporte</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className={s.right}>
      <div className={s.card}>
        <div className={s.formHeader}>
          <span className={s.loginBadge}>Bienvenido</span>

          <h1>Iniciar sesión</h1>

          <p>Accede al panel de administración</p>
        </div>

        <form onSubmit={handleSubmit} className={s.form}>
          <div className={s.field}>
            <label htmlFor="email">Correo electrónico</label>

            <div className={s.inputWrap}>
              <svg
                className={s.inputIcon}
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <path d="m2 7 10 7 10-7" />
              </svg>

              <input
                id="email"
                type="email"
                placeholder="tu@email.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={s.field}>
            <label htmlFor="password">Contraseña</label>

            <div className={s.inputWrap}>
              <svg
                className={s.inputIcon}
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>

              <input
                id="password"
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

          <button
            type="submit"
            className={s.submitBtn}
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar al panel"}
          </button>
        </form>

        <div className={s.bottomText}>
          Acceso protegido y cifrado
        </div>
      </div>
    </section>
  </main>
);
  
}