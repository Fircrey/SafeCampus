"use client";

import { MapPin, Loader2, AlertTriangle, RefreshCw, Navigation } from "lucide-react";
import type { GeoStatus } from "@/hooks/useGeolocation";
import type { ZoneDetectionResult } from "@/lib/geo-utils";

interface ZoneDetectionProps {
  geoStatus: GeoStatus;
  error: string | null;
  accuracy: number | null;
  detection: ZoneDetectionResult | null;
  isNear: boolean;
  onRetry: () => void;
  onChangeZone: () => void;
}

export function ZoneDetection({
  geoStatus,
  error,
  accuracy,
  detection,
  isNear,
  onRetry,
  onChangeZone,
}: ZoneDetectionProps) {
  if (geoStatus === "idle" || geoStatus === "requesting") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <Loader2 className="h-5 w-5 animate-spin text-tadeo-blue" />
        <div>
          <p className="text-sm font-semibold text-tadeo-ink">Obteniendo ubicacion...</p>
          <p className="text-xs text-slate-500">
            Acepta el permiso de ubicacion para detectar tu zona automaticamente.
          </p>
        </div>
      </div>
    );
  }

  if (geoStatus === "denied" || geoStatus === "unavailable" || geoStatus === "timeout") {
    return (
      <div className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-tadeo-ink">Ubicacion no disponible</p>
            <p className="text-xs text-slate-600">{error}</p>
          </div>
        </div>
        {geoStatus === "timeout" && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 self-start rounded bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-700"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reintentar
          </button>
        )}
      </div>
    );
  }

  // granted
  if (!detection) return null;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-green-200 bg-green-50 p-4">
      <div className="flex items-start gap-3">
        <Navigation className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-tadeo-ink">
            Zona detectada: {detection.zone.properties.name}
          </p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {detection.zone.properties.ref && (
              <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                {detection.zone.properties.ref}
              </span>
            )}
            <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
              {detection.method === "exact" ? "Ubicacion exacta" : `Zona mas cercana (~${Math.round(detection.distanceMeters ?? 0)}m)`}
            </span>
            {accuracy && (
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                Precision: {Math.round(accuracy)}m
              </span>
            )}
          </div>
          {!isNear && (
            <p className="mt-2 text-xs font-medium text-amber-600">
              Pareces estar lejos del campus. Verifica que la zona sea correcta.
            </p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onChangeZone}
        className="inline-flex items-center gap-1.5 self-start rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-tadeo-ink transition hover:bg-slate-50"
      >
        <MapPin className="h-3.5 w-3.5" />
        Cambiar zona
      </button>
    </div>
  );
}
