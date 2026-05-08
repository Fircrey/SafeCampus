"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  MapPin,
  AlertTriangle as TriangleIcon,
  Clock,
  ChevronDown,
  ChevronUp,
  Camera,
  X,
  EyeOff,
  Phone,
  ShieldAlert,
  Loader2,
  Plus,
  Home,
} from "lucide-react";
import { enrichReport } from "@/lib/flask-client";
import type { Report } from "@/lib/types";

const PRIORITIES = [
  { value: "alta", label: "Alta" },
  { value: "media", label: "Media" },
  { value: "baja", label: "Baja" },
] as const;

interface ReportConfirmationProps {
  report: Report;
  onNewReport: () => void;
}

export function ReportConfirmation({ report, onNewReport }: ReportConfirmationProps) {
  const [showEnrich, setShowEnrich] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [priority, setPriority] = useState<"alta" | "media" | "baja">(
    (report.priority as "alta" | "media" | "baja") || "media"
  );
  const [isAnonymous, setIsAnonymous] = useState(report.is_anonymous);
  const [contact, setContact] = useState(report.contact_preference || "");
  const [enrichStatus, setEnrichStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [enriching, setEnriching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isRisk = report.immediate_risk?.toLowerCase() === "si";

  function handlePhotoChange(file: File | null) {
    if (!file) {
      setPhoto(null);
      setPhotoPreview(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setEnrichStatus({ type: "error", msg: "La foto no puede exceder 10 MB." });
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

  async function handleEnrich() {
    setEnriching(true);
    setEnrichStatus(null);
    try {
      await enrichReport(report.id, {
        priority,
        is_anonymous: isAnonymous,
        contact_preference: isAnonymous ? "" : contact,
        photo,
      });
      setEnrichStatus({ type: "success", msg: "Reporte actualizado correctamente." });
      removePhoto();
    } catch (err) {
      setEnrichStatus({
        type: "error",
        msg: err instanceof Error ? err.message : "No se pudo actualizar el reporte.",
      });
    } finally {
      setEnriching(false);
    }
  }

  // Extract report type from type_description (format: "[Type] Title")
  const typeMatch = report.type_description.match(/^\[(.+?)\]/);
  const reportType = typeMatch ? typeMatch[1] : report.type_description;

  const createdDate = report.created_at
    ? new Date(report.created_at).toLocaleString("es-CO", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4">
        <img
          src="/mascot-dashboard.png"
          alt="Cabito"
          width={44}
          height={44}
          className="shrink-0 drop-shadow-sm"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <h2 className="text-lg font-bold text-tadeo-ink">
              Reporte #{report.id} registrado
            </h2>
          </div>
          <p className="mt-0.5 text-sm text-slate-600">
            El equipo de seguridad lo revisara pronto.
          </p>
        </div>
      </div>

      {/* Summary card */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
          Resumen del reporte
        </h3>
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-sm">
            <TriangleIcon className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="font-medium text-slate-500">Tipo:</span>
            <span className="text-tadeo-ink">{reportType}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="font-medium text-slate-500">Zona:</span>
            <span className="text-tadeo-ink">{report.zone_name || report.location}</span>
          </div>
          <div className="flex items-start gap-2 text-sm">
            <span className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="font-medium text-slate-500">Descripcion:</span>
            <span className="text-tadeo-ink">{report.type_description}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ShieldAlert className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="font-medium text-slate-500">Riesgo inmediato:</span>
            <span className={isRisk ? "font-semibold text-red-600" : "text-green-700"}>
              {isRisk ? "Si" : "No"}
            </span>
          </div>
          {createdDate && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="font-medium text-slate-500">Fecha:</span>
              <span className="text-tadeo-ink">{createdDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Emergency banner */}
      {isRisk && (
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
              Mantente en calma. Tu reporte ya fue enviado al equipo de seguridad.
            </p>
          </div>
        </div>
      )}

      {/* Enrich section */}
      <button
        type="button"
        onClick={() => setShowEnrich(!showEnrich)}
        className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-tadeo-blue transition hover:underline"
      >
        {showEnrich ? (
          <>
            <ChevronUp className="h-4 w-4" />
            Ocultar opciones
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4" />
            Complementar reporte
          </>
        )}
      </button>

      <div
        className={`flex flex-col gap-4 overflow-hidden transition-all duration-300 ease-in-out ${
          showEnrich ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="mb-4 text-xs text-slate-500">
            Agrega informacion adicional para ayudar al equipo de seguridad.
          </p>

          {/* Photo */}
          <div className="mb-4">
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

          {/* Priority */}
          <div className="mb-4">
            <label className="mb-1 block text-xs font-semibold text-slate-500" htmlFor="enrich-priority">
              Prioridad
            </label>
            <select
              id="enrich-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as "alta" | "media" | "baja")}
              className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-tadeo-ink focus:border-tadeo-blue focus:outline-none"
            >
              {PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Anonymous */}
          <label className="mb-4 inline-flex items-center gap-2 text-sm text-tadeo-ink">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-tadeo-blue focus:ring-tadeo-blue"
            />
            <span className="inline-flex items-center gap-1">
              <EyeOff className="h-3.5 w-3.5 text-slate-400" />
              Enviar de forma anonima
            </span>
          </label>

          {/* Contact */}
          {!isAnonymous && (
            <div className="mb-4">
              <label className="mb-1 block text-xs font-semibold text-slate-500" htmlFor="enrich-contact">
                Contacto para seguimiento (opcional)
              </label>
              <input
                id="enrich-contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                maxLength={120}
                className="w-full rounded border border-slate-200 bg-white px-3 py-2 text-sm text-tadeo-ink placeholder:text-slate-400 focus:border-tadeo-blue focus:outline-none"
                placeholder="Telefono o correo electronico"
              />
            </div>
          )}

          {/* Update button */}
          <button
            type="button"
            onClick={handleEnrich}
            disabled={enriching}
            className="inline-flex items-center justify-center gap-2 rounded bg-tadeo-blue px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-900 disabled:opacity-50"
          >
            {enriching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Actualizando...
              </>
            ) : (
              "Actualizar Reporte"
            )}
          </button>

          {enrichStatus && (
            <p
              className={`mt-3 text-xs font-medium ${
                enrichStatus.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {enrichStatus.msg}
            </p>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onNewReport}
          className="inline-flex items-center justify-center gap-2 rounded bg-tadeo-blue px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-900"
        >
          <Plus className="h-4 w-4" />
          Crear otro reporte
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded border border-slate-200 px-4 py-2.5 text-sm font-semibold text-tadeo-ink transition hover:bg-slate-50"
        >
          <Home className="h-4 w-4" />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
