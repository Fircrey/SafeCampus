"use client";

import { useEffect, useState } from "react";
import { Zap } from "lucide-react";
import { getStats } from "@/lib/flask-client";
import type { DetectorStats } from "@/lib/types";

const metrics: { key: keyof DetectorStats; label: string; format?: (v: number) => string }[] = [
  { key: "total_detections", label: "Detecciones" },
  { key: "guns", label: "Armas de fuego" },
  { key: "knives", label: "Armas blancas" },
  { key: "explosives", label: "Explosivos" },
  { key: "average_confidence", label: "Confianza prom.", format: (v) => `${Math.round(v * 100)}%` },
];

export function HeroCard({ className = "", showStats = false }: { className?: string; showStats?: boolean }) {
  const [stats, setStats] = useState<DetectorStats | null>(null);

  useEffect(() => {
    if (!showStats) return;
    let cancelled = false;
    getStats()
      .then((data) => { if (!cancelled) setStats(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [showStats]);

  return (
    <div className={`overflow-hidden rounded-2xl bg-gradient-to-br from-tadeo-blue to-tadeo-blueDark p-6 text-white shadow-card-elevated ${className}`}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        {/* Left: mascot + text */}
        <div className="flex items-center gap-4 sm:flex-1">
          <img
            src="/mascot-dashboard.png"
            alt="Cabito"
            width={80}
            height={80}
            className="hidden shrink-0 drop-shadow-lg sm:block"
          />
          <div>
            <span className="inline-flex items-center gap-1.5 rounded bg-tadeo-cyan px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">
              <Zap className="h-3 w-3" />
              Centro de monitoreo
            </span>
            <h1 className="mt-2 text-2xl font-black leading-tight sm:text-3xl lg:text-4xl">
              Seguridad, convivencia y<br className="hidden lg:block" /> bienestar con IA responsable.
            </h1>
          </div>
        </div>

        {/* Right: 2x2 metrics (admin only) */}
        {showStats && (
          <div className="grid grid-cols-2 gap-3">
            {metrics.map((m) => {
              const raw = stats ? stats[m.key] : null;
              const display = raw != null
                ? (m.format ? m.format(raw) : String(raw))
                : "---";
              return (
                <div key={m.key} className="rounded-lg border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">
                    {m.label}
                  </p>
                  <p className="mt-1 text-2xl font-black">{display}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
