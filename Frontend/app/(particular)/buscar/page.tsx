"use client";

import ParticularSearch from "@/components/dashboard/ParticularSearch";
import { useLanguage } from "@/components/context/LanguageContext";

// GM: Componente aislado exclusivo para la experiencia de usuario del cliente final
// Cambiado a 'ParticularSearchPage' para representar la página de la ruta /buscar
export default function ParticularSearchPage() {
  const { t } = useLanguage();

  return (
    <div className="page-stack">
      {/* GM: Mantenemos la cabecera interna con los estilos elásticos del equipo */}
      <section className="page-hero">
        <div>
          <h2>{t("dashboardTitle")}</h2>
          <p>{t("dashboardSubtitle")}</p>
        </div>
      </section>

      {/* GM: Contenedor seguro 'section-card' que respeta el flujo responsive del proyecto 
          y hereda los bordes redondeados (--r-lg) y fondos del ecosistema BookFlow */}
      <section className="section-card">
        <ParticularSearch />
      </section>
    </div>
  );
}