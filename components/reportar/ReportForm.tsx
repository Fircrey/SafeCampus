"use client";

import { useState, type FormEvent } from "react";
import {
  Send,
  MapPin,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Navigation,
  Phone,
  ShieldAlert,
} from "lucide-react";
import { createGeoReport } from "@/lib/flask-client";
import type { Report } from "@/lib/types";
import type { ZoneFeature } from "@/lib/zone-types";
import type { GeoStatus } from "@/hooks/useGeolocation";
import type { ZoneDetectionResult } from "@/lib/geo-utils";
import { ZoneSelector } from "./ZoneSelector";

const REPORT_TYPES = [
  "Seguridad",
  "Infraestructura",
  "Iluminacion",
  "Accesibilidad",
  "Aseo",
  "Ruido",
  "Otro",
];

interface ReportFormProps {
  zone: ZoneFeature | null;
  geoStatus: GeoStatus;
  detection: ZoneDetectionResult | null;
  accuracy: number | null;
  isNearCampus: boolean;
  latitude: number | null;
  longitude: number | null;
  showManualSelector: boolean;
  onChangeZone: () => void;
  onSelectZone: (zone: ZoneFeature) => void;
  onRetryGeo: () => void;
  onSuccess: (report: Report) => void;
}

export function ReportForm({
  zone,
  geoStatus,
  detection,
  accuracy,
  isNearCampus: nearCampus,
  latitude,
  longitude,
  showManualSelector,
  onChangeZone,
  onSelectZone,
  onRetryGeo,
  onSuccess,
}: ReportFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [immediateRisk, setImmediateRisk] = useState<boolean | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const description = (fd.get("description") as string)?.trim();
    const reportType = fd.get("type") as string;

    if (!description) {
      setStatus({ type: "error", msg: "La descripcion es obligatoria." });
      return;
    }

    if (!zone) {
      setStatus({ type: "error", msg: "Selecciona una zona antes de enviar." });
      return;
    }

    if (immediateRisk === null) {
      setStatus({ type: "error", msg: "Indica si hay riesgo inmediato." });
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      const report = await createGeoReport({
        zone_id: zone.properties.id,
        zone_name: zone.properties.name,
        report_type: reportType,
        priority: "media",
        title: `${reportType} - ${zone.properties.name}`,
        description,
        latitude,
        longitude,
        is_anonymous: false,
        photo: null,
        contact_preference: "app",
        immediate_risk: immediateRisk,
      });
      onSuccess(report);
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
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      {/* 1. Description */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500" htmlFor="rpt-desc">
          ¿Que ocurrio? *
        </label>
        <textarea
          id="rpt-desc"
          name="description"
          maxLength={600}
          required
          rows={3}
          className="w-full resize-none rounded border border-slate-200 bg-white px-3 py-2 text-sm text-tadeo-ink placeholder:text-slate-400 focus:border-tadeo-blue focus:outline-none"
          placeholder="Describe brevemente la situacion"
        />
      </div>

      {/* 2. Location (chip or inline selector) */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500">
          Ubicacion *
        </label>

        {zone && !showManualSelector ? (
          <div className="flex items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-2">
              <MapPin className="h-4 w-4 shrink-0 text-tadeo-blue" />
              <span className="text-sm font-medium text-tadeo-ink">
                {zone.properties.name}
              </span>
              {zone.properties.ref && (
                <span className="rounded bg-tadeo-blue/10 px-1.5 py-0.5 text-xs font-bold text-tadeo-blue">
                  {zone.properties.ref}
                </span>
              )}
              {detection && (
                <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700">
                  {detection.method === "exact"
                    ? "Exacta"
                    : `~${Math.round(detection.distanceMeters ?? 0)}m`}
                </span>
              )}
              {accuracy && (
                <span className="hidden rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500 sm:inline">
                  ±{Math.round(accuracy)}m
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onChangeZone}
              className="rounded border border-slate-200 px-3 py-2 text-xs font-semibold text-tadeo-blue transition hover:bg-slate-50"
            >
              Cambiar
            </button>
          </div>
        ) : !zone && (geoStatus === "idle" || geoStatus === "requesting") ? (
          <div className="flex items-center gap-3 rounded border border-blue-200 bg-blue-50 px-3 py-3">
            <Loader2 className="h-4 w-4 animate-spin text-tadeo-blue" />
            <span className="text-sm text-slate-600">Detectando ubicacion...</span>
          </div>
        ) : null}

        {zone && !nearCampus && !showManualSelector && (
          <p className="mt-1 text-xs font-medium text-amber-600">
            Pareces estar lejos del campus. Verifica que la zona sea correcta.
          </p>
        )}

        {!zone && (geoStatus === "denied" || geoStatus === "unavailable" || geoStatus === "timeout") && !showManualSelector && (
          <div className="flex items-center gap-3 rounded border border-amber-200 bg-amber-50 px-3 py-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
            <span className="flex-1 text-sm text-slate-600">Ubicacion no disponible</span>
            {geoStatus === "timeout" && (
              <button
                type="button"
                onClick={onRetryGeo}
                className="inline-flex items-center gap-1 rounded bg-amber-600 px-2 py-1 text-xs font-semibold text-white hover:bg-amber-700"
              >
                <RefreshCw className="h-3 w-3" />
                Reintentar
              </button>
            )}
          </div>
        )}

        {showManualSelector && (
          <div className="mt-2">
            <ZoneSelector selectedZone={zone} onSelect={onSelectZone} />
          </div>
        )}

        {!zone && !showManualSelector && (geoStatus === "denied" || geoStatus === "unavailable") && (
          <button
            type="button"
            onClick={onChangeZone}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-tadeo-blue hover:underline"
          >
            <Navigation className="h-3.5 w-3.5" />
            Seleccionar zona manualmente
          </button>
        )}
      </div>

      {/* 3. Type */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500" htmlFor="rpt-type">
          Tipo *
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

      {/* 4. Immediate risk */}
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500">
          ¿Hay riesgo inmediato? *
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setImmediateRisk(true)}
            className={`flex-1 rounded border px-4 py-2 text-sm font-semibold transition ${
              immediateRisk === true
                ? "border-red-400 bg-red-50 text-red-700"
                : "border-slate-200 bg-white text-tadeo-ink hover:bg-slate-50"
            }`}
          >
            Si
          </button>
          <button
            type="button"
            onClick={() => setImmediateRisk(false)}
            className={`flex-1 rounded border px-4 py-2 text-sm font-semibold transition ${
              immediateRisk === false
                ? "border-green-400 bg-green-50 text-green-700"
                : "border-slate-200 bg-white text-tadeo-ink hover:bg-slate-50"
            }`}
          >
            No
          </button>
        </div>
      </div>

      {/* Emergency banner */}
      {immediateRisk === true && (
        <div className="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 p-4">
          <img
            src="/mascot-ayuda.png"
            alt="Cabito"
            width={40}
            height={40}
            className="shrink-0 drop-shadow-sm"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-600" />
              <p className="text-sm font-bold text-red-800">Emergencia</p>
            </div>
            <p className="mt-1 text-sm text-red-700">
              Si estas en peligro inmediato, contacta a las autoridades:
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <a
                href="tel:123"
                className="inline-flex items-center gap-1.5 rounded bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700"
              >
                <Phone className="h-3.5 w-3.5" />
                Linea 123
              </a>
              <a
                href="tel:+5713242548"
                className="inline-flex items-center gap-1.5 rounded bg-tadeo-blue px-3 py-1.5 text-xs font-bold text-white transition hover:bg-blue-900"
              >
                <Phone className="h-3.5 w-3.5" />
                Seguridad UTADEO
              </a>
            </div>
            <p className="mt-2 text-xs text-red-600">
              Mantente en calma. Tu reporte tambien sera enviado al equipo de seguridad.
            </p>
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting || !zone}
        className="inline-flex items-center justify-center gap-2 rounded bg-tadeo-blue px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-900 disabled:opacity-50"
      >
        <Send className="h-4 w-4" />
        {submitting ? "Enviando..." : "Enviar Reporte"}
      </button>

      {!zone && (
        <p className="text-xs text-slate-400">
          Selecciona una zona para poder enviar el reporte.
        </p>
      )}

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
