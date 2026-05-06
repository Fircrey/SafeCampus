"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { createZoneReport } from "@/lib/flask-client";
import type { ZoneFeature } from "@/lib/zone-types";

const REPORT_TYPES = [
  "Seguridad",
  "Infraestructura",
  "Iluminacion",
  "Accesibilidad",
  "Aseo",
  "Ruido",
  "Otro",
];

const PRIORITIES = [
  { value: "media", label: "Media" },
  { value: "alta", label: "Alta" },
  { value: "baja", label: "Baja" },
] as const;

interface ZoneReportFormProps {
  zone: ZoneFeature | null;
  onReportCreated: () => void;
}

export function ZoneReportForm({ zone, onReportCreated }: ZoneReportFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!zone) return;

    const form = e.currentTarget;
    const fd = new FormData(form);
    const title = (fd.get("title") as string)?.trim();
    const description = (fd.get("description") as string)?.trim();

    if (!title || !description) {
      setStatus({ type: "error", msg: "Faltan campos obligatorios" });
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      await createZoneReport({
        zone_id: zone.properties.id,
        zone_name: zone.properties.name,
        report_type: fd.get("type") as string,
        priority: fd.get("priority") as "alta" | "media" | "baja",
        title,
        description,
      });
      form.reset();
      setStatus({ type: "success", msg: "Reporte registrado" });
      onReportCreated();
    } catch (err) {
      setStatus({
        type: "error",
        msg: err instanceof Error ? err.message : "No se pudo crear el reporte",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (!zone) {
    return (
      <p className="text-sm text-slate-400 italic">
        Selecciona una zona en el mapa para crear un reporte.
      </p>
    );
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500" htmlFor="zone-name">
          Zona
        </label>
        <input
          id="zone-name"
          className="w-full rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-tadeo-ink"
          disabled
          readOnly
          value={zone.properties.name}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500" htmlFor="report-type">
            Tipo
          </label>
          <select
            id="report-type"
            name="type"
            className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-tadeo-ink focus:border-tadeo-blue focus:outline-none"
          >
            {REPORT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500" htmlFor="report-priority">
            Prioridad
          </label>
          <select
            id="report-priority"
            name="priority"
            defaultValue="media"
            className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-tadeo-ink focus:border-tadeo-blue focus:outline-none"
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500" htmlFor="report-title">
          Asunto
        </label>
        <input
          id="report-title"
          name="title"
          maxLength={90}
          required
          className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-tadeo-ink placeholder:text-slate-400 focus:border-tadeo-blue focus:outline-none"
          placeholder="Describe brevemente el problema"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500" htmlFor="report-desc">
          Detalle
        </label>
        <textarea
          id="report-desc"
          name="description"
          maxLength={600}
          required
          rows={3}
          className="w-full resize-none rounded border border-slate-200 bg-white px-3 py-2 text-sm text-tadeo-ink placeholder:text-slate-400 focus:border-tadeo-blue focus:outline-none"
          placeholder="Explica los detalles de la situacion"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center gap-2 rounded bg-tadeo-blue px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-900 disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        {submitting ? "Enviando..." : "Crear reporte"}
      </button>

      {status && (
        <p className={`text-xs font-medium ${status.type === "success" ? "text-green-600" : "text-red-600"}`}>
          {status.msg}
        </p>
      )}
    </form>
  );
}
