"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import { useTheme } from "@/components/context/ThemeContext";
import { useLanguage, LANGUAGES } from "@/components/context/LanguageContext";
import { useAuth } from "@/components/context/AuthContext";

interface Notification {
  id: number;
  icon: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  type?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function Header() {
  const router = useRouter(); 
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const { logout, user, token } = useAuth();
  
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toast, setToast] = useState<{ title: string; desc: string } | null>(null);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unread = notifications.filter(n => !n.read).length;
  const displayName = user?.email?.split("@")[0] ?? "Usuario";
  const initial = displayName[0]?.toUpperCase() ?? "U";

  // Obtenemos de forma limpia la etiqueta de rol correcta para la interfaz
  const getRoleLabel = () => {
    if (user?.role === "customer") return "Particular";
    if (user?.role === "business") return "Negocio";
    return "Admin";
  };

  const roleLabel = getRoleLabel();

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
        setLangOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Save to localStorage when notifications change
  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`bf_notifications_${user.id}`, JSON.stringify(notifications));
  }, [notifications, user]);

  // Load from backend on mount if localStorage is empty or cleared
  useEffect(() => {
    if (!user || !token) return;
    const storageKey = `bf_notifications_${user.id}`;
    const saved = localStorage.getItem(storageKey);
    if (saved && JSON.parse(saved).length > 0) return;

    const loadInitialData = async () => {
      try {
        let url = `${API_URL}/appointments`;
        
        if (user.role === "business" && user.businessId) {
          url = `${API_URL}/appointments/business/${user.businessId}`;
        } else if (user.role === "customer" && user.customerId) {
          url = `${API_URL}/appointments/customer/${user.customerId}`;
        } else {
          return;
        }

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error("Failed to fetch appointments");
        const appts = await res.json();
        
        const initialNotifs: Notification[] = [];
        
        if (Array.isArray(appts)) {
          appts.slice(0, 4).forEach((appt: any, idx: number) => {
            const dateStr = appt.date ? new Date(appt.date).toLocaleDateString() : "";
            const isConfirmed = appt.status === "confirmed" || appt.status === "paid";
            const isCustomer = user.role === "customer";
            
            initialNotifs.push({
              id: Date.now() - idx * 60000,
              icon: isConfirmed ? "bi-calendar2-check-fill" : "bi-calendar-event-fill",
              title: isCustomer 
                ? (isConfirmed ? "Cita Confirmada" : "Cita Solicitada") 
                : (isConfirmed ? "Reserva Confirmada" : "Reserva Pendiente"),
              desc: isCustomer
                ? `Tu cita para ${appt.serviceName || "Servicio"} el ${dateStr || appt.date} a las ${appt.time} ${isConfirmed ? "está confirmada" : "está pendiente"}.`
                : `${appt.serviceName || "Servicio"} programado para el ${dateStr || appt.date} a las ${appt.time}`,
              time: `Hace ${idx * 20 + 5} min`,
              read: false
            });
          });
        }
        
        if (initialNotifs.length === 0) {
          initialNotifs.push({
            id: Date.now(),
            icon: "bi-info-circle-fill",
            title: "Sistema inicializado",
            desc: "No hay reservas recientes registradas en tu panel.",
            time: "Hace unos instantes",
            read: false
          });
        }
        
        setNotifications(initialNotifs);
      } catch (err) {
        console.error("Failed to generate initial notifications:", err);
      }
    };

    loadInitialData();
  }, [user, token]);

  // Simulate a live notification arriving after 10 seconds
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      const isBusiness = user.role === "business";
      const isCustomer = user.role === "customer";
      
      let title = "Nuevo Registro de Negocio";
      let desc = "El negocio 'Alicante Tech Center' ha completado su registro.";
      let icon = "bi-lightning-charge-fill";

      if (isBusiness) {
        title = "Nueva Cita Recibida";
        desc = "Un cliente ha solicitado una cita para 'Asesoría VIP' mañana.";
      } else if (isCustomer) {
        title = "Recordatorio de Cita";
        desc = "Recuerda que tienes una cita programada para mañana a las 10:00.";
        icon = "bi-clock-fill";
      }

      const liveNotif: Notification = {
        id: Date.now() + 99,
        icon,
        title,
        desc,
        time: "Ahora mismo",
        read: false
      };
      
      setNotifications(prev => {
        if (prev.some(n => n.title === liveNotif.title)) return prev;
        setToast({ title: liveNotif.title, desc: liveNotif.desc });
        setTimeout(() => setToast(null), 5000);
        return [liveNotif, ...prev];
      });
    }, 10000);

    return () => clearTimeout(timer);
  }, [user]);

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const markOneRead = (id: number) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const deleteOne = (id: number) =>
    setNotifications(prev => prev.filter(n => n.id !== id));

  return (
    <header className="admin-header">
      <div>
        <h2 className="admin-header__title">
          {user?.role === "customer" ? "Panel de Usuario" : "BookFlow"}
        </h2>
        <p className="admin-header__subtitle">
          {user?.role === "customer" ? "Gestiona tus citas y reserva en tus locales favoritos" : t("headerSubtitle")}
        </p>
      </div>

      <div className="admin-header__actions">
        {/* Notificaciones */}
        <div style={{ position: "relative" }} ref={notifRef}>
          <button className="bf-badge-btn" aria-label="Notificaciones" onClick={() => { setNotifOpen(!notifOpen); setOpen(false); }}>
            <i className="bi bi-bell-fill" style={{ fontSize: 16 }} />
            {unread > 0 && <div className="bf-notif-dot" />}
          </button>

          {notifOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 10px)", right: 0,
              width: 300, background: "var(--paper)", border: "1px solid var(--line)",
              borderRadius: "var(--r-lg)", boxShadow: "0 8px 30px rgba(14,14,16,.12)",
              padding: 8, zIndex: 500,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 8px 10px" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
                  Notificaciones {unread > 0 && (
                    <span style={{ marginLeft: 6, background: "var(--accent)", color: "#fff", borderRadius: 20, fontSize: 10, fontWeight: 700, padding: "1px 7px" }}>
                      {unread}
                    </span>
                  )}
                </span>
                {unread > 0 && (
                  <button onClick={markAllRead} style={{ fontSize: 11, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                    Marcar todas leídas
                  </button>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 340, overflowY: "auto" }}>
                {notifications.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 0", color: "var(--ink-3)", fontSize: 13 }}>
                    <i className="bi bi-bell-slash" style={{ fontSize: 24, display: "block", marginBottom: 8 }} />
                    Sin notificaciones
                  </div>
                ) : notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markOneRead(n.id);
                      setNotifOpen(false);
                      const isAppointmentNotif = n.type === "appointment" || n.title.toLowerCase().includes("cita") || n.title.toLowerCase().includes("reserva") || n.icon.includes("calendar");
                      if (isAppointmentNotif) {
                        if (user?.role === "business") router.push("/business-bookings");
                        else if (user?.role === "customer") router.push("/reservas");
                        else router.push("/bookings");
                      }
                    }}
                    style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                      padding: "8px 10px", borderRadius: "var(--r)", cursor: "pointer",
                      background: n.read ? "transparent" : "var(--paper-2)",
                      transition: "background .12s",
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                      background: "var(--paper-3)", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <i className={`bi ${n.icon}`} style={{ fontSize: 14, color: "var(--accent)" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{n.title}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-3)", marginTop: 2 }}>{n.desc}</div>
                      <div style={{ fontSize: 10, color: "var(--ink-4)", marginTop: 4 }}>{n.time}</div>
                    </div>
                    <button 
                      onClick={e => { e.stopPropagation(); deleteOne(n.id); }}
                      style={{ background: "transparent", border: "none", color: "var(--ink-4)", cursor: "pointer", padding: 2 }}
                    >
                      <i className="bi bi-x-lg" style={{ fontSize: 10 }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar Menu Completo */}
        <div className="avatar-menu" ref={menuRef}>
          <button className="user-pill" onClick={() => { setOpen(!open); setLangOpen(false); setNotifOpen(false); }}>
            <div className="user-pill__avatar">{initial}</div>
            <div className="user-pill__info">
              <span className="user-pill__name">{displayName}</span>
              <span className="user-pill__role">{roleLabel}</span>
            </div>
            <i className={`bi ${open ? "bi-chevron-up" : "bi-chevron-down"} user-pill__chevron`} />
          </button>

          {open && (
            <div className="avatar-menu__dropdown">
              <div className="avatar-menu__header">
                <div className="avatar-menu__header-avatar">{initial}</div>
                <div>
                  <p className="avatar-menu__header-name">{displayName}</p>
                  <p className="avatar-menu__header-email">{user?.email}</p>
                </div>
              </div>
              <div className="avatar-menu__divider" />
              
              <div className="avatar-menu__item avatar-menu__item--toggle">
                <i className="bi bi-moon-stars-fill" />
                <span>{t("darkMode")}</span>
                <button className={`toggle-switch ${theme === "dark" ? "toggle-switch--on" : ""}`} onClick={toggleTheme}>
                  <span className="toggle-switch__knob" />
                </button>
              </div>

              <div className="avatar-menu__item" onClick={() => setLangOpen(!langOpen)}>
                <span>{lang.flag} {t("changeLanguage")}</span>
                <i className={`bi ${langOpen ? "bi-chevron-up" : "bi-chevron-down"}`} />
              </div>

              {langOpen && (
                <div className="avatar-menu__submenu">
                  {LANGUAGES.map((l) => (
                    <button key={l.code} className="avatar-menu__item" onClick={() => { setLang(l); setOpen(false); }}>
                      {l.flag} {l.label}
                    </button>
                  ))}
                </div>
              )}

              <div className="avatar-menu__divider" />
              <button className="avatar-menu__item avatar-menu__item--danger" onClick={logout}>
                <i className="bi bi-box-arrow-right" /> {t("logout")}
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideIn { 
          from { transform: translateX(120%); opacity: 0; } 
          to { transform: translateX(0); opacity: 1; } 
        }
      `}</style>

      {toast && (
        <div style={{
          position: "fixed", top: "20px", right: "20px", background: "var(--paper)",
          borderLeft: "4px solid var(--primary)", padding: "12px 16px", borderRadius: "var(--r-md)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)", zIndex: 1000, display: "flex", gap: "10px",
          alignItems: "center", animation: "slideIn 0.3s ease-out"
        }}>
          <i className="bi bi-bell-fill" style={{ color: "var(--primary)", fontSize: "1.2rem" }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--ink)" }}>{toast.title}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--ink-3)", marginTop: "2px" }}>{toast.desc}</div>
          </div>
          <button onClick={() => setToast(null)} style={{ background: "transparent", border: "none", color: "var(--ink-3)", cursor: "pointer", fontSize: "1.1rem", paddingLeft: "10px" }}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
      )}
    </header>
  );
}