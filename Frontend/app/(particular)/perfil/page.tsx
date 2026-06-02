"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { useLanguage, TranslationKey } from "@/components/context/LanguageContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function PerfilPage() {
  const { user, token, logout } = useAuth();
  const { t } = useLanguage();

  // Estados dinámicos para los campos del formulario
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  
  // Estados para contraseñas
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  // Estados de control de la interfaz
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Función para sincronizar los estados con los datos reales del usuario
  const resetFormToUserValues = () => {
    if (user) {
      setNombre(user.email?.split("@")[0] ?? "Usuario");
      setCorreo(user.email ?? "");
      setTelefono((user as any)?.phone ?? "");
    }
  };

  // Cargar datos iniciales al arrancar o cambiar de usuario
  useEffect(() => {
    resetFormToUserValues();
  }, [user]);

  const showMessage = (text: string, type: "success" | "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  // Manejador del botón Cancelar Datos Personales
  const handleCancelEdit = () => {
    resetFormToUserValues(); // Restauramos los datos originales del usuario
    setIsEditing(false);     // Cerramos el modo edición
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // VALIDACIÓN: El nombre no puede ser solo espacios en blanco
    if (!nombre.trim()) {
      showMessage("El nombre no puede estar vacío", "error");
      return;
    }

    // VALIDACIÓN: Si escribe teléfono, comprobamos que tenga una longitud mínima lógica (ej: 9 números)
    if (telefono.trim().length > 0 && telefono.replace(/[^0-9]/g, "").length < 9) {
      showMessage("El teléfono debe contener al menos 9 dígitos numéricos", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/profile/me`, { 
        method: "PATCH", 
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: nombre, phone: telefono, email: correo }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Error del servidor (Status ${res.status})`);
      }
      
      showMessage("¡Perfil actualizado correctamente!", "success");
      setIsEditing(false);
    } catch (err: any) {
      showMessage(err.message || "Error al guardar los cambios", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showMessage("Por favor, rellena ambos campos de contraseña", "error");
      return;
    }
    if (newPassword.length < 6) {
      showMessage(t("settingsPwMinLen" as TranslationKey), "error");
      return;
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\S]{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      showMessage(t("settingsPwMinLen" as TranslationKey), "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) throw new Error("La contraseña actual no es correcta");

      showMessage("Contraseña actualizada con éxito", "success");
      setCurrentPassword("");
      setNewPassword("");
      setIsChangingPassword(false);
    } catch (err: any) {
      showMessage(err.message || "Error al cambiar la contraseña", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = confirm(
      "¿Estás completamente seguro de que quieres eliminar tu cuenta? Esta acción borrará todas tus reservas y no se puede deshacer."
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${API_URL}/users/${user?.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("No se pudo eliminar la cuenta");

      alert("Tu cuenta ha sido eliminada correctamente.");
      logout();
    } catch (err: any) {
      showMessage(err.message || "Error al intentar eliminar la cuenta", "error");
    }
  };

  const initial = nombre[0]?.toUpperCase() ?? "U";

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
      {/* Título de la página */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 700, color: "var(--ink)" }}>Mi Cuenta</h1>
        <p style={{ color: "var(--ink-3)", fontSize: "14px" }}>Gestiona tus datos personales, información de contacto y seguridad</p>
      </div>

      {/* Alertas globales de Feedback */}
      {message && (
        <div style={{
          padding: "14px 16px",
          background: message.type === "success" ? "#dcfce7" : "#fee2e2",
          color: message.type === "success" ? "#15803d" : "#b91c1c",
          borderRadius: "var(--r)", marginBottom: "24px", fontSize: "14px", fontWeight: 500,
          boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
        }}>
          <i className={`bi ${message.type === "success" ? "bi-check-circle-fill" : "bi-exclamation-circle-fill"}`} style={{ marginRight: "8px" }} />
          {message.text}
        </div>
      )}

      {/* Contenedor principal en formato Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", 
        gap: "24px",
        alignItems: "start"
      }}>
        
        {/* COLUMNA IZQUIERDA: DATOS PERSONALES */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Tarjeta de Información de Usuario */}
          <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
            <div style={{ background: "var(--paper-2)", padding: "24px", display: "flex", alignItems: "center", gap: "20px", borderBottom: "1px solid var(--line)" }}>
              <div style={{ width: "68px", height: "68px", borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", fontWeight: 700, flexShrink: 0 }}>
                {initial}
              </div>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 600, color: "var(--ink)", margin: 0 }}>{nombre}</h2>
                <span style={{ fontSize: "12px", background: "var(--paper-3)", color: "var(--ink-2)", padding: "4px 10px", borderRadius: "12px", display: "inline-block", marginTop: "6px", fontWeight: 500 }}>
                  {user?.role === "customer" ? "Cliente Particular" : "Usuario del Sistema"}
                </span>
              </div>
            </div>

            <div style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--ink)", margin: 0 }}>Datos Personales</h3>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: "14px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                    <i className="bi bi-pencil" /> Editar Datos
                  </button>
                )}
              </div>

              <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--ink-4)", fontWeight: 600, marginBottom: "6px" }}>Nombre completo</label>
                  <input 
                    type="text" 
                    value={nombre} 
                    required 
                    minLength={2}
                    maxLength={50}
                    onChange={(e) => setNombre(e.target.value)} 
                    disabled={!isEditing} 
                    style={{ width: "100%", padding: "12px", background: isEditing ? "var(--paper)" : "var(--paper-2)", border: "1px solid var(--line)", borderRadius: "var(--r)", color: "var(--ink-2)", fontSize: "14px", transition: "all 0.2s" }} 
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--ink-4)", fontWeight: 600, marginBottom: "6px" }}>Teléfono de contacto</label>
                  <input 
                    type="tel" 
                    value={telefono} 
                    placeholder="Ej: +34 600 000 000" 
                    disabled={!isEditing} 
                    maxLength={15}
                    onChange={(e) => {
                      // Elimina al vuelo cualquier carácter que no sea un número, espacio, guion o símbolo +
                      const cleanValue = e.target.value.replace(/[^0-9\s\-+]/g, "");
                      setTelefono(cleanValue);
                    }} 
                    style={{ width: "100%", padding: "12px", background: isEditing ? "var(--paper)" : "var(--paper-2)", border: "1px solid var(--line)", borderRadius: "var(--r)", color: "var(--ink-2)", fontSize: "14px", transition: "all 0.2s" }} 
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "var(--ink-4)", fontWeight: 600, marginBottom: "6px" }}>Dirección de correo electrónico</label>
                  <input 
                    type="email" 
                    value={correo} 
                    required
                    onChange={(e) => setCorreo(e.target.value)} 
                    disabled={!isEditing} 
                    style={{ width: "100%", padding: "12px", background: isEditing ? "var(--paper)" : "var(--paper-2)", border: "1px solid var(--line)", borderRadius: "var(--r)", color: "var(--ink-2)", fontSize: "14px", transition: "all 0.2s" }} 
                  />
                </div>

                {isEditing && (
                  <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
                    <button type="button" onClick={handleCancelEdit} style={{ background: "var(--paper-3)", border: "none", padding: "10px 16px", borderRadius: "var(--r)", fontSize: "14px", cursor: "pointer", color: "var(--ink-2)" }}>Cancelar</button>
                    <button type="submit" disabled={loading} style={{ background: "var(--accent)", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "var(--r)", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                      {loading ? "Guardando..." : "Guardar Cambios"}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Tarjeta de Zona Peligrosa */}
          <div style={{ border: "1px solid #fee2e2", borderRadius: "var(--r-lg)", padding: "24px", background: "rgba(239, 68, 68, 0.01)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#dc2626", margin: "0 0 6px 0" }}>Zona de Peligro</h3>
            <p style={{ color: "var(--ink-3)", fontSize: "14px", margin: "0 0 16px 0", lineHeight: "1.4" }}>
              Al eliminar tu cuenta se borrarán permanentemente todos tus datos de perfil e historial de reservas sin posibilidad de recuperarlos.
            </p>
            <button 
              onClick={handleDeleteAccount}
              style={{ background: "#fff", border: "1px solid #f87171", color: "#dc2626", padding: "10px 18px", borderRadius: "var(--r)", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; }}
            >
              Eliminar cuenta definitivamente
            </button>
          </div>
        </div>

        {/* COLUMNA DERECHA: SEGURIDAD / CONTRASEÑA */}
        <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "var(--r-lg)", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--ink)", margin: 0 }}>{t("accountSecurity" as TranslationKey)}</h3>
            {!isChangingPassword && (
              <button onClick={() => setIsChangingPassword(true)} style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}>
                {t("settingsPassword" as TranslationKey)}
              </button>
            )}
          </div>

          {isChangingPassword ? (
            <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--ink-4)", fontWeight: 600, marginBottom: "6px" }}>{t("settingsCurrentPw" as TranslationKey)}</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder={t("introduceCurrentPw" as TranslationKey)} style={{ width: "100%", padding: "12px", background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "var(--r)", fontSize: "14px" }} />
              </div>
              
              <div>
                <label style={{ display: "block", fontSize: "12px", color: "var(--ink-4)", fontWeight: 600, marginBottom: "6px" }}>{t("settingsNewPw" as TranslationKey)}</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder={t("quickOwnerPassPlaceholder" as TranslationKey)} style={{ width: "100%", padding: "12px", background: "var(--paper)", border: "1px solid var(--line)", borderRadius: "var(--r)", fontSize: "14px" }} />
                <span style={{ display: "block", fontSize: "11px", color: "var(--muted)", marginTop: "4px" }}>{t("pwFormatHint" as TranslationKey)}</span>
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
                <button type="button" onClick={() => { setIsChangingPassword(false); setCurrentPassword(""); setNewPassword(""); }} style={{ background: "var(--paper-3)", border: "none", padding: "10px 16px", borderRadius: "var(--r)", fontSize: "14px", cursor: "pointer", color: "var(--ink-2)" }}>{t("cancel" as TranslationKey)}</button>
                <button type="submit" disabled={loading} style={{ background: "var(--accent)", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "var(--r)", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                  {t("settingsUpdatePw" as TranslationKey)}
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", background: "var(--paper-2)", padding: "16px", borderRadius: "var(--r)", border: "1px solid var(--line)" }}>
              <i className="bi bi-shield-lock-fill" style={{ fontSize: "20px", color: "var(--accent)" }} />
              <div style={{ fontSize: "13px", color: "var(--ink-3)", lineHeight: "1.5" }}>
                <span style={{ fontWeight: 600, color: "var(--ink)", display: "block", marginBottom: "2px" }}>{t("profileSecTitle" as TranslationKey)}</span>
                {t("profileSecDesc" as TranslationKey)}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}