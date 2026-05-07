"use client";

import { useState, useRef, type FormEvent } from "react";
import { Send, Camera, X, Eye, EyeOff } from "lucide-react";
import { createGeoReport } from "@/lib/flask-client";
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
  { value: "alta", label: "Alta" },
  { value: "media", label: "Media" },
  { value: "baja", label: "Baja" },
] as const;

interface ReportFormProps {
  zone: ZoneFeature;
  latitude: number | null;
  longitude: number | null;
  onSuccess: () => void;
  onChangeZone: () => void;
}

export function ReportForm({ zone, latitude, longitude, onSuccess, onChangeZone }: ReportFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handlePhotoChange(file: File | null) {
    if (!file) {
      setPhoto(null);
      setPhotoPreview(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setStatus({ type: "error", msg: "La foto no puede exceder 10 MB." });
      return;
    }
    setPhoto(file);
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  }

  function removePhoto() {
    setPhoto(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const title = (fd.get("title") as string)?.trim();
    const description = (fd.get("description") as string)?.trim();

    if (!title || !description) {
      setStatus({ type: "error", msg: "El asunto y detalle son obligatorios." });
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      await createGeoReport({
        zone_id: zone.properties.id,
        zone_name: zone.properties.name,
        report_type: fd.get("type") as string,
        priority: fd.get("priority") as "alta" | "media" | "baja",
        title,
        description,
        latitude,
        longitude,
        is_anonymous: fd.get("anonymous") === "on",
        photo,
      });
      form.reset();
      removePhoto();
      setStatus({ type: "success", msg: "Reporte creado exitosamente." });
      onSuccess();
    } catch (err) {
      setStatus({
        type: "error",
        msg: err instanceof Error ? err.message : "No se pudo crear el reporte.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {/* Zone display */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500">Zona</label>
        <div className="flex items-center gap-2">
          <span className="flex-1 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-tadeo-ink">
            {zone.properties.name}
            {zone.properties.ref && (
              <span className="ml-2 text-xs text-slate-400">({zone.properties.ref})</span>
            )}
          </span>
          <button
            type="button"
            onClick={onChangeZone}
            className="rounded border border-slate-200 px-3 py-2 text-xs font-semibold text-tadeo-blue transition hover:bg-slate-50"
          >
            Cambiar
          </button>
        </div>
      </div>

      {/* Type + Priority */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500" htmlFor="rpt-type">
            Tipo
          </label>
          <select
            id="rpt-type"
            name="type"
            className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-tadeo-ink focus:border-tadeo-blue focus:outline-none"
          >
            {REPORT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500" htmlFor="rpt-priority">
            Prioridad
          </label>
          <select
            id="rpt-priority"
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

      {/* Title */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500" htmlFor="rpt-title">
          Asunto
        </label>
        <input
          id="rpt-title"
          name="title"
          maxLength={90}
          required
          className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-tadeo-ink placeholder:text-slate-400 focus:border-tadeo-blue focus:outline-none"
          placeholder="Describe brevemente el problema"
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500" htmlFor="rpt-desc">
          Detalle
        </label>
        <textarea
          id="rpt-desc"
          name="description"
          maxLength={600}
          required
          rows={3}
          className="w-full resize-none rounded border border-slate-200 bg-white px-3 py-2 text-sm text-tadeo-ink placeholder:text-slate-400 focus:border-tadeo-blue focus:outline-none"
          placeholder="Explica los detalles de la situacion"
        />
      </div>

      {/* Photo */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500">
          Foto (opcional)
        </label>
        {photoPreview ? (
          <div className="relative inline-block">
            <img
              src={photoPreview}
              alt="Vista previa"
              className="h-32 w-auto rounded border border-slate-200 object-cover"
            />
            <button
              type="button"
              onClick={removePhoto}
              className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow transition hover:bg-red-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 transition hover:border-tadeo-blue hover:text-tadeo-blue"
          >
            <Camera className="h-4 w-4" />
            Adjuntar foto
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
          className="hidden"
          onChange={(e) => handlePhotoChange(e.target.files?.[0] ?? null)}
        />
      </div>

      {/* Anonymous */}
      <label className="inline-flex items-center gap-2 text-sm text-tadeo-ink">
        <input
          type="checkbox"
          name="anonymous"
          className="h-4 w-4 rounded border-slate-300 text-tadeo-blue focus:ring-tadeo-blue"
        />
        <span className="inline-flex items-center gap-1">
          <EyeOff className="h-3.5 w-3.5 text-slate-400" />
          Enviar de forma anonima
        </span>
      </label>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center gap-2 rounded bg-tadeo-blue px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-900 disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        {submitting ? "Enviando..." : "Crear reporte"}
      </button>

      {status && (
        <p
          className={`text-xs font-medium ${
            status.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {status.msg}
        </p>
      )}
    </form>
  );
}
