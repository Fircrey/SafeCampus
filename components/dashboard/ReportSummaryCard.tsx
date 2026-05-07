"use client";

import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { BentoCard } from "./BentoCard";
import { fetchReports } from "@/lib/flask-client";
import type { Report } from "@/lib/types";

const STATUS_PILLS: { key: "open" | "reviewing" | "resolved"; label: string; bg: string; text: string }[] = [
  { key: "open", label: "Abiertos", bg: "bg-red-100", text: "text-red-700" },
  { key: "reviewing", label: "En revisión", bg: "bg-amber-100", text: "text-amber-700" },
  { key: "resolved", label: "Resueltos", bg: "bg-emerald-100", text: "text-emerald-700" },
];

const PRIORITY_BARS: { key: string; label: string; color: string }[] = [
  { key: "alta", label: "Alta", color: "bg-red-500" },
  { key: "media", label: "Media", color: "bg-amber-400" },
  { key: "baja", label: "Baja", color: "bg-emerald-500" },
];

export function ReportSummaryCard({ className = "" }: { className?: string }) {
  const [reports, setReports] = useState<Report[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchReports()
      .then((data) => { if (!cancelled) setReports(data); })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, []);

  const statusCounts = reports
    ? {
        open: reports.filter((r) => r.status === "open").length,
        reviewing: reports.filter((r) => r.status === "reviewing").length,
        resolved: reports.filter((r) => r.status === "resolved").length,
      }
    : null;

  const priorityCounts = reports
    ? {
        alta: reports.filter((r) => r.priority === "alta").length,
        media: reports.filter((r) => r.priority === "media").length,
        baja: reports.filter((r) => r.priority === "baja").length,
      }
    : null;

  const maxPriority = priorityCounts
    ? Math.max(priorityCounts.alta, priorityCounts.media, priorityCounts.baja, 1)
    : 1;

  return (
    <BentoCard title="Resumen de reportes" icon={ClipboardList} className={className}>
      {error ? (
        <p className="py-4 text-center text-sm text-slate-400">No se pudo cargar los reportes</p>
      ) : !reports ? (
        <div className="flex items-center justify-center py-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-tadeo-blue" />
        </div>
      ) : reports.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-400">Sin reportes registrados</p>
      ) : (
        <>
          {/* Status pills */}
          <div className="mb-5 flex flex-wrap gap-2">
            {STATUS_PILLS.map((s) => (
              <span
                key={s.key}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${s.bg} ${s.text}`}
              >
                {statusCounts![s.key]}
                <span className="font-medium">{s.label}</span>
              </span>
            ))}
          </div>

          {/* Priority bars */}
          <div className="space-y-3">
            {PRIORITY_BARS.map((p) => {
              const count = priorityCounts![p.key as keyof typeof priorityCounts] ?? 0;
              const pct = (count / maxPriority) * 100;
              return (
                <div key={p.key}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">{p.label}</span>
                    <span className="font-bold text-slate-500">{count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all ${p.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </BentoCard>
  );
}
