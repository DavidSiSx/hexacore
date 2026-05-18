"use client";

import { useReportWebVitals } from "next/web-vitals";

/**
 * Monitor de Rendimiento en Tiempo Real (RUM - Real User Monitoring)
 * Captura y formatea las métricas críticas de Core Web Vitals (LCP, INP, CLS, FCP, TTFB).
 * Imprime logs formateados en consola durante el desarrollo para auditorías instantáneas.
 */
export function PerformanceMonitor() {
  useReportWebVitals((metric: { id: string; name: string; startTime: number; value: number; label: string; rating: "good" | "needs-improvement" | "poor" }) => {
    // Solo registrar en consola en entorno de desarrollo para evitar saturar logs de usuarios en producción
    if (process.env.NODE_ENV !== "development") return;

    const { name, value, rating } = metric;
    
    // Asignar colores brutales según el estado de la métrica (bueno, necesita mejora, malo)
    let color = "background: #00FF66; color: #000; font-weight: bold; padding: 2px 6px;"; // Bueno
    if (rating === "needs-improvement") {
      color = "background: #DFE104; color: #000; font-weight: bold; padding: 2px 6px;"; // Necesita Mejora
    } else if (rating === "poor") {
      color = "background: #FF3366; color: #FFF; font-weight: bold; padding: 2px 6px;"; // Pobre / Crítico
    }

    console.log(
      `%c[CORE WEB VITALS] ${name}%c ${value.toFixed(2)} | Rating: ${rating.toUpperCase()}`,
      color,
      "color: inherit; font-weight: normal;"
    );
  });

  return null;
}
