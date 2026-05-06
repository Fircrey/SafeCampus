"use client";

import { useEffect, useState } from "react";
import { fetchReports } from "@/lib/flask-client";
import type { Report } from "@/lib/types";

const PRIORITY_COLORS: Record<string, string> = {
  alta: "bg-red-100 text-red-700",
  media: "bg-yellow-100 text-yellow-700",
  baja: "bg-green-100 text-green-700",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Abierto",
  reviewing: "En revision",
  resolved: "Resuelto",
  false_positive: "Falso positivo",
};

interface ZoneReportHistoryProps {
  zoneId: string | null;
  refreshKey: number;
}

export function ZoneReportHistory({ zoneId, refreshKey }: ZoneReportHistoryProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!zoneId) {
      setReports([]);
      return;
    }

    setLoading(true);
    fetchReports()
      .then((all) => {
        const zoneReports = all.filter((r) => r.zone_id === zoneId);
        setReports(zoneReports);
      })
      .catch(() => setReports([]))
      .finally(() => setLoading(false));
  }, [zoneId, refreshKey]);

  if (!zoneId) {
    return <p className="text-sm text-slate-400 italic">Selecciona una zona para ver su historial.</p>;
  }

  if (loading) {
    return <p className="text-sm text-slate-400">Cargando historial...</p>;
  }

  if (reports.length === 0) {
    return <p className="text-sm text-slate-400 italic">Sin reportes en esta zona.</p>;
  }

  return (
    <div className="space-y-2">
      {reports.map((r) => (
        <article key={r.id} className="rounded border border-slate-200 bg-white p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-semibold text-tadeo-ink">{r.type_description}</p>
            <div className="flex shrink-0 gap-1">
              {r.priority && (
                <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${PRIORITY_COLORS[r.priority] ?? "bg-slate-100 text-slate-600"}`}>
                  {r.priority}
                </span>
              )}
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                {STATUS_LABELS[r.status] ?? r.status}
              </span>
            </div>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {r.created_at ? new Date(r.created_at).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" }) : ""}
          </p>
        </article>
      ))}
    </div>
  );
}
