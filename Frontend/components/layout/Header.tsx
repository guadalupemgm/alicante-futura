"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/context/ThemeContext";
import { useLanguage, LANGUAGES, TranslationKey } from "@/components/context/LanguageContext";
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

interface Appointment {
  id: number;
  date: string;
  time: string;
  status: string;
  serviceName?: string;
}

interface Payment {
  id: number;
  amount: number;
  method: string;
  status: string;
  appointmentId?: number;
  appointment?: Appointment;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function Header({ role = "particular" }: { role?: "admin" | "particular" | "business" }) {
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const { logout, user, token } = useAuth();

  const activeRole = user ? (((user.role as string) === "customer" || (user.role as string) === "particular") ? "particular" : ((user.role as string) === "business" ? "business" : "admin")) : role;

  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toast, setToast] = useState<{ title: string; desc: string } | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const unread = notifications.filter(n => !n.read).length;
  const displayName = user?.email?.split("@")[0] ?? "Usuario";
  const initial = displayName[0]?.toUpperCase() ?? "U";

  const getRoleLabel = () => {
  if (user?.role === "business") return "Negocio";
  if (user?.role === "customer") return "Cliente";
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

  useEffect(() => {
    if (!user) return;
    localStorage.setItem(`bf_notifications_${user.id}`, JSON.stringify(notifications));
  }, [notifications, user]);

  useEffect(() => {
    if (!user || !token) return;

    // ✅ Guardia: no hacer fetch si faltan los IDs necesarios
    if (user.role === "business" && !user.businessId) return;
    if (user.role === "customer" && !user.customerId) return;

    const loadInitialData = async () => {
      try {
        // 1. Obtener citas (appointments)
        let urlAppts = `${API_URL}/appointments`;
        if (user.role === "business" && user.businessId) {
          urlAppts = `${API_URL}/appointments/business/${user.businessId}`;
        } else if (user.role === "customer" && user.customerId) {
          urlAppts = `${API_URL}/appointments/customer/${user.customerId}`;
        }

        const apptsRes = await fetch(urlAppts, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!apptsRes.ok) throw new Error("Failed to fetch appointments");
        const appts = await apptsRes.json();

        // 2. Obtener pagos (payments) - Solo para Admin y Business
        let payments: Payment[] = [];
        if (user.role === "business" && user.businessId) {
          const payRes = await fetch(`${API_URL}/payments/business/${user.businessId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (payRes.ok) payments = await payRes.json();
        } else if (user.role === "admin") {
          const payRes = await fetch(`${API_URL}/payments`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (payRes.ok) payments = await payRes.json();
        }

        const serverNotifs: Notification[] = [];

        // Mapear reservas reales a notificaciones
        if (Array.isArray(appts)) {
          appts.forEach((appt: Appointment) => {
            const dateStr = appt.date ? new Date(appt.date).toLocaleDateString() : "";
            const isCustomer = user.role === "customer";
            
            let title = "";
            let desc = "";
            let icon = "";

            if (appt.status === "paid") {
              title = isCustomer ? "Cita Pagada" : "Reserva Pagada";
              desc = isCustomer
                ? `Tu cita para ${appt.serviceName || "Servicio"} el ${dateStr} a las ${appt.time} ha sido pagada.`
                : `Reserva para ${appt.serviceName || "Servicio"} el ${dateStr} a las ${appt.time} ha sido pagada.`;
              icon = "bi-credit-card-fill";
            } else if (appt.status === "confirmed") {
              title = isCustomer ? "Cita Confirmada" : "Reserva Confirmada";
              desc = isCustomer
                ? `Tu cita para ${appt.serviceName || "Servicio"} el ${dateStr} a las ${appt.time} está confirmada.`
                : `Reserva para ${appt.serviceName || "Servicio"} el ${dateStr} a las ${appt.time} está confirmada.`;
              icon = "bi-calendar2-check-fill";
            } else if (appt.status === "cancelled") {
              title = isCustomer ? "Cita Cancelada" : "Reserva Cancelada";
              desc = isCustomer
                ? `Tu cita para ${appt.serviceName || "Servicio"} el ${dateStr} a las ${appt.time} ha sido cancelada.`
                : `Reserva para ${appt.serviceName || "Servicio"} el ${dateStr} a las ${appt.time} ha sido cancelada.`;
              icon = "bi-calendar-x-fill";
            } else {
              title = isCustomer ? "Cita Solicitada" : "Reserva Pendiente";
              desc = isCustomer
                ? `Tu cita para ${appt.serviceName || "Servicio"} el ${dateStr} a las ${appt.time} está pendiente.`
                : `Reserva para ${appt.serviceName || "Servicio"} el ${dateStr} a las ${appt.time} está pendiente.`;
              icon = "bi-calendar-event-fill";
            }

            serverNotifs.push({
              id: appt.id * 1000 + 1, // namespace para citas
              icon,
              title,
              desc,
              time: "Reciente",
              read: false,
              type: "appointment"
            });
          });
        }

        // Mapear pagos reales a notificaciones (solo si corresponde)
        if (Array.isArray(payments)) {
          payments.forEach((pay: Payment) => {
            const payMethodStr = pay.method === "card" ? "tarjeta" : pay.method === "transfer" ? "transferencia" : "efectivo";
            let desc = `Recibido pago de ${pay.amount}€ por ${payMethodStr}.`;
            if (pay.appointment) {
              const dateStr = pay.appointment.date ? new Date(pay.appointment.date).toLocaleDateString() : "";
              desc = `Pago de ${pay.amount}€ recibido por ${pay.appointment.serviceName || "Servicio"} el ${dateStr} vía ${payMethodStr}.`;
            }

            serverNotifs.push({
              id: pay.id * 1000 + 2, // namespace para pagos
              icon: "bi-cash-coin",
              title: "Pago Confirmado",
              desc,
              time: "Reciente",
              read: false,
              type: "payment"
            });
          });
        }

        // Ordenar notificaciones por ID descendente (los más recientes primero)
        serverNotifs.sort((a, b) => b.id - a.id);

        // Reconciliar con local storage para conservar el estado leído/no leído
        const storageKey = `bf_notifications_${user.id}`;
        const savedStr = localStorage.getItem(storageKey);
        const savedNotifs: Notification[] = savedStr ? JSON.parse(savedStr) : [];

        const mergedNotifs: Notification[] = serverNotifs.map(sn => {
          const match = savedNotifs.find(s => s.id === sn.id);
          if (match) {
            return { ...sn, read: match.read, time: match.time };
          }
          return sn;
        });

        // Mostrar Toast si hay notificaciones nuevas sin leer (que no estuvieran en local storage)
        if (savedNotifs.length > 0) {
          const newUnread = mergedNotifs.filter(mn => !mn.read && !savedNotifs.some(s => s.id === mn.id));
          if (newUnread.length > 0) {
            setToast({ title: newUnread[0].title, desc: newUnread[0].desc });
            setTimeout(() => setToast(null), 5000);
          }
        }

        setNotifications(mergedNotifs.slice(0, 10)); // Mostrar un máximo de 10

      } catch (err) {
        console.warn("No se pudieron cargar las notificaciones reales:", err);
      }
    };

    loadInitialData();
  }, [user, token]);

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const markOneRead = (id: number) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const deleteOne = (id: number) =>
    setNotifications(prev => prev.filter(n => n.id !== id));

  const handleNotificationClick = (n: Notification) => {
    markOneRead(n.id);
    setNotifOpen(false);

    const isAppointmentNotif =
      n.type === "appointment" ||
      n.title.toLowerCase().includes("cita") ||
      n.title.toLowerCase().includes("reserva") ||
      n.title.toLowerCase().includes("appointment") ||
      n.title.toLowerCase().includes("booking") ||
      n.icon.includes("calendar") ||
      n.icon.includes("clock");

    if (isAppointmentNotif) {
      if (user?.role === "business") {
        router.push("/business-bookings");
      } else if (user?.role === "customer") {
        router.push("/reservas");
      } else {
        router.push("/bookings");
      }
    }
  };

  return (
    <header className="admin-header">
      <div>
        <h2 className="admin-header__title">
          {activeRole === "particular" ? t("userPanelTitle" as TranslationKey) : "BookFlow"}
        </h2>
        <p className="admin-header__subtitle">
          {activeRole === "particular" ? t("userPanelSubtitle" as TranslationKey) : t("headerSubtitle")}
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
                    onClick={() => handleNotificationClick(n)}
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
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", marginBottom: 2 }}>{n.title}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-3)", lineHeight: 1.4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{n.desc}</div>
                      <div style={{ fontSize: 10, color: "var(--ink-3)", marginTop: 3 }}>{n.time}</div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); deleteOne(n.id); }}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-3)", padding: "2px 4px", flexShrink: 0 }}
                    >
                      <i className="bi bi-x-lg" style={{ fontSize: 11 }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar Menu */}
        <div className="avatar-menu" ref={menuRef}>
          <button className="user-pill" onClick={() => { setOpen(!open); setLangOpen(false); setNotifOpen(false); }}>
            <div className="user-pill__avatar">{initial}</div>
            <div className="user-pill__info">
              <span className="user-pill__name">{displayName}</span>
              <span className="user-pill__role">{activeRole === "particular" ? "Particular" : roleLabel}</span>
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
          position: "fixed",
          top: "20px",
          right: "20px",
          background: "var(--paper)",
          borderLeft: "4px solid var(--primary)",
          padding: "12px 16px",
          borderRadius: "var(--r-md)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          zIndex: 1000,
          display: "flex",
          gap: "10px",
          alignItems: "center",
          animation: "slideIn 0.3s ease-out"
        }}>
          <i className="bi bi-bell-fill" style={{ color: "var(--primary)", fontSize: "1.2rem" }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--ink)" }}>{toast.title}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--ink-3)", marginTop: "2px" }}>{toast.desc}</div>
          </div>
          <button
            onClick={() => setToast(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--ink-3)",
              cursor: "pointer",
              fontSize: "1.1rem",
              paddingLeft: "10px"
            }}
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>
      )}
    </header>
  );
}