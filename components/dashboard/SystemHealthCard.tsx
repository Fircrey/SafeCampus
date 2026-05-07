"use client";

import { Activity } from "lucide-react";
import { BentoCard } from "./BentoCard";
import { useSystemHealth } from "./useSystemHealth";

const STATUS_CONFIG = {
  ok: { label: "Operativo", bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  degraded: { label: "Degradado", bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  offline: { label: "Sin conexión", bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
} as const;

const CHECK_LABELS: { key: "database" | "model_loaded" | "detector_running"; label: string }[] = [
  { key: "database", label: "Base de datos" },
  { key: "model_loaded", label: "Modelo YOLO" },
  { key: "detector_running", label: "Detector activo" },
];

export function SystemHealthCard({ className = "" }: { className?: string }) {
  const { status, checks, loading } = useSystemHealth();
  const cfg = STATUS_CONFIG[status];

  return (
    <BentoCard title="Estado del sistema" icon={Activity} className={className}>
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-tadeo-blue" />
        </div>
      ) : (
        <>
          {/* Overall badge */}
          <div className={`mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${cfg.bg} ${cfg.text}`}>
            <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </div>

          {/* Individual checks */}
          <ul className="space-y-3">
            {CHECK_LABELS.map((c) => {
              const ok = checks[c.key];
              return (
                <li key={c.key} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{c.label}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      ok
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {ok ? "OK" : "Error"}
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </BentoCard>
  );
}
