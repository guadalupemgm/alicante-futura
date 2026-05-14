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
      <div className={s.left}>
        <div className={s.brand}>
          <div className={s.brandIcon}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="2" width="9" height="12" rx="1.5" fill="rgba(255,255,255,0.9)" />
              <rect x="8" y="6" width="9" height="12" rx="1.5" fill="rgba(255,255,255,0.4)" />
            </svg>
          </div>
          <span className={s.brandName}>BookFlow</span>
        </div>

        <div className={s.geoArt}>
          <svg width="200" height="200" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(29,158,117,0.2)" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="50" fill="none" stroke="rgba(29,158,117,0.15)" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="30" fill="none" stroke="rgba(29,158,117,0.12)" strokeWidth="0.5" />
            <circle cx="100" cy="30"  r="4" fill="#1D9E75" opacity="0.9" />
            <circle cx="170" cy="100" r="4" fill="#1D9E75" opacity="0.7" />
            <circle cx="100" cy="170" r="4" fill="#1D9E75" opacity="0.5" />
            <circle cx="30"  cy="100" r="4" fill="#1D9E75" opacity="0.7" />
            <circle cx="148" cy="52"  r="3" fill="#1D9E75" opacity="0.5" />
            <circle cx="52"  cy="148" r="3" fill="#1D9E75" opacity="0.4" />
            <line x1="100" y1="30"  x2="170" y2="100" stroke="rgba(29,158,117,0.25)" strokeWidth="0.5" />
            <line x1="170" y1="100" x2="100" y2="170" stroke="rgba(29,158,117,0.2)"  strokeWidth="0.5" />
            <line x1="100" y1="30"  x2="30"  y2="100" stroke="rgba(29,158,117,0.25)" strokeWidth="0.5" />
            <line x1="30"  y1="100" x2="100" y2="170" stroke="rgba(29,158,117,0.2)"  strokeWidth="0.5" />
            <line x1="100" y1="30"  x2="148" y2="52"  stroke="rgba(29,158,117,0.15)" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="14" fill="rgba(29,158,117,0.15)" stroke="#1D9E75" strokeWidth="1" />
            <circle cx="100" cy="100" r="5"  fill="#1D9E75" />
          </svg>
        </div>

        <div className={s.tagline}>
          <h2>
            Gestiona reservas<br />
            <em>sin fricciones</em>
          </h2>
          <p>Panel exclusivo para administradores · Alicante Futura</p>
        </div>
      </div>

      <div className={s.right}>
        <div className={s.formHeader}>
          <h1>Iniciar sesión</h1>
          <p>Accede a tu panel de administración</p>
        </div>

        <form onSubmit={handleSubmit} className={s.form}>
          <div className={s.field}>
            <label htmlFor="email">Correo electrónico</label>
            <div className={s.inputWrap}>
              <svg className={s.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="4" width="20" height="16" rx="2" />
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
              <svg className={s.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
                aria-label="Mostrar contraseña"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && <p className={s.errorMsg}>{error}</p>}

          <button type="submit" className={s.submitBtn} disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
            {!loading && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </form>

        <div className={s.secureBadge}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1D9E75" strokeWidth="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          Acceso seguro
        </div>
      </div>
    </main>
  );
  
}