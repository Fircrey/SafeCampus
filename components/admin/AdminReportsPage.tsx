"use client";

import { useEffect, useState } from "react";
import { ImageIcon } from "lucide-react";
import type { Report, ReportStatus } from "@/lib/types";
import { fetchReports, updateReport, getReportPhotoUrl } from "@/lib/flask-client";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports()
      .then(setReports)
      .catch(() => setError("No se pudieron cargar los reportes. Verifica la conexión con el servidor."))
      .finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(id: number, status: ReportStatus) {
    try {
      const updated = await updateReport(id, { status });
      setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
    } catch { setError("Error al actualizar el estado. Intenta de nuevo."); }
  }

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(null), 4000);
      return () => clearTimeout(t);
    }
  }, [error]);

  const filtered = filter === "all" ? reports : reports.filter((r) => r.status === filter);

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center gap-3">
          <img
            src="/mascot-admin.png"
            alt="Cabito Admin"
            width={48}
            height={48}
            className="shrink-0 drop-shadow-md"
          />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-tadeo-blue">Admin</p>
            <h1 className="text-xl font-black text-tadeo-ink">Panel de Reportes</h1>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

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
                      Lugar: {report.location}{report.zone_name ? ` (${report.zone_name})` : ""} | Riesgo: {report.immediate_risk}{report.priority ? ` | Prioridad: ${report.priority}` : ""}
                    </p>
                    <p className="text-xs text-slate-400">
                      {report.is_anonymous ? "Anónimo" : `Usuario #${report.user_id}`} —{" "}
                      {report.created_at ? new Date(report.created_at).toLocaleString() : ""}
                    </p>
                    {report.photo_filename && (
                      <ReportPhoto reportId={report.id} />
                    )}
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
                      aria-label={`Cambiar estado del reporte ${report.id}`}
                      className="focus-ring rounded border border-slate-300 px-2 py-1 text-xs"
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

function ReportPhoto({ reportId }: { reportId: number }) {
  const [show, setShow] = useState(false);

  return (
    <div className="mt-2">
      {!show ? (
        <button
          type="button"
          onClick={() => setShow(true)}
          className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs font-medium text-tadeo-blue hover:bg-slate-200 transition"
        >
          <ImageIcon className="h-3 w-3" />
          Ver foto adjunta
        </button>
      ) : (
        <img
          src={getReportPhotoUrl(reportId)}
          alt="Foto del reporte"
          className="max-h-60 rounded border border-slate-200 cursor-pointer hover:opacity-90 transition"
          onClick={() => window.open(getReportPhotoUrl(reportId), "_blank")}
        />
      )}
    </div>
  );
}
