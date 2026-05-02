"use client";

import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import type { Report, ReportStatus } from "@/lib/types";
import { fetchReports, updateReport } from "@/lib/flask-client";

const STATUS_LABELS: Record<ReportStatus, string> = {
  open: "Abierto",
  reviewing: "En revisión",
  resolved: "Resuelto",
  false_positive: "Falso positivo",
};

const STATUS_COLORS: Record<ReportStatus, string> = {
  open: "bg-red-100 text-red-700",
  reviewing: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
  false_positive: "bg-slate-100 text-slate-600",
};

export function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ReportStatus | "all">("all");

  useEffect(() => {
    fetchReports()
      .then(setReports)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(id: number, status: ReportStatus) {
    try {
      const updated = await updateReport(id, { status });
      setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch { /* ignore */ }
  }

  const filtered = filter === "all" ? reports : reports.filter((r) => r.status === filter);

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-tadeo-blue text-white">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-tadeo-blue">Admin</p>
            <h1 className="text-xl font-black text-tadeo-ink">Panel de Reportes</h1>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-2">
          {(["all", "open", "reviewing", "resolved", "false_positive"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded px-3 py-1.5 text-xs font-semibold transition ${
                filter === s ? "bg-tadeo-blue text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {s === "all" ? "Todos" : STATUS_LABELS[s]}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Cargando reportes...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-slate-500">No hay reportes.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((report) => (
              <div key={report.id} className="rounded border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-tadeo-ink">{report.type_description}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Lugar: {report.location} | Riesgo: {report.immediate_risk}
                    </p>
                    <p className="text-xs text-slate-400">
                      {report.is_anonymous ? "Anónimo" : `Usuario #${report.user_id}`} —{" "}
                      {report.created_at ? new Date(report.created_at).toLocaleString() : ""}
                    </p>
                    {report.notes && (
                      <p className="mt-2 text-xs text-slate-600 italic">Notas: {report.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-2 py-1 text-xs font-semibold ${STATUS_COLORS[report.status]}`}>
                      {STATUS_LABELS[report.status]}
                    </span>
                    <select
                      value={report.status}
                      onChange={(e) => handleStatusChange(report.id, e.target.value as ReportStatus)}
                      className="rounded border border-slate-300 px-2 py-1 text-xs"
                    >
                      {Object.entries(STATUS_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
