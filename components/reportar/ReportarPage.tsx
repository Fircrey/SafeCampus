"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, CheckCircle2 } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { detectZone, isNearCampus } from "@/lib/geo-utils";
import type { ZoneDetectionResult } from "@/lib/geo-utils";
import type { ZoneFeature } from "@/lib/zone-types";
import { ZoneDetection } from "./ZoneDetection";
import { ZoneSelector } from "./ZoneSelector";
import { ReportForm } from "./ReportForm";

export function ReportarPage() {
  const geo = useGeolocation();

  const [manualMode, setManualMode] = useState(false);
  const [selectedZone, setSelectedZone] = useState<ZoneFeature | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Auto-detect zone when geolocation is granted
  const detection: ZoneDetectionResult | null = useMemo(() => {
    if (geo.status !== "granted" || geo.longitude === null || geo.latitude === null) return null;
    return detectZone(geo.longitude, geo.latitude);
  }, [geo.status, geo.latitude, geo.longitude]);

  const nearCampus = useMemo(() => {
    if (geo.longitude === null || geo.latitude === null) return true;
    return isNearCampus(geo.longitude, geo.latitude);
  }, [geo.latitude, geo.longitude]);

  // Set selected zone from detection
  useEffect(() => {
    if (detection && !manualMode && !selectedZone) {
      setSelectedZone(detection.zone);
    }
  }, [detection, manualMode, selectedZone]);

  // If geo is denied/unavailable, switch to manual mode automatically
  useEffect(() => {
    if (geo.status === "denied" || geo.status === "unavailable") {
      setManualMode(true);
    }
  }, [geo.status]);

  function handleChangeZone() {
    setManualMode(true);
  }

  function handleSelectZone(zone: ZoneFeature) {
    setSelectedZone(zone);
    setManualMode(false);
  }

  function handleSuccess() {
    setSubmitted(true);
  }

  function handleNewReport() {
    setSubmitted(false);
  }

  // Show zone selector if manual mode and no zone selected, or user explicitly wants to change
  const showSelector = manualMode && (!selectedZone || manualMode);
  const zoneReady = selectedZone !== null;

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-4">
          <img
            src="/mascot-dashboard.png"
            alt="Cabito"
            width={44}
            height={44}
            className="shrink-0 drop-shadow-md"
          />
          <div className="flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-tadeo-blue">
              Universidad Jorge Tadeo Lozano
            </p>
            <h1 className="text-xl font-black text-tadeo-ink">Crear Reporte</h1>
          </div>
          <FileText className="h-6 w-6 text-slate-400" />
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-6">
        {submitted ? (
          <div className="flex flex-col items-center gap-4 rounded-lg border border-green-200 bg-green-50 p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <div>
              <h2 className="text-lg font-bold text-tadeo-ink">Reporte enviado</h2>
              <p className="mt-1 text-sm text-slate-600">
                Tu reporte ha sido registrado. El equipo de seguridad lo revisara pronto.
              </p>
            </div>
            <button
              type="button"
              onClick={handleNewReport}
              className="rounded bg-tadeo-blue px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-900"
            >
              Crear otro reporte
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Geolocation status */}
            <ZoneDetection
              geoStatus={geo.status}
              error={geo.error}
              accuracy={geo.accuracy}
              detection={detection}
              isNear={nearCampus}
              onRetry={geo.retry}
              onChangeZone={handleChangeZone}
            />

            {/* Manual zone selector */}
            {showSelector && (
              <ZoneSelector selectedZone={selectedZone} onSelect={handleSelectZone} />
            )}

            {/* Report form */}
            {zoneReady && (
              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <ReportForm
                  zone={selectedZone!}
                  latitude={geo.latitude}
                  longitude={geo.longitude}
                  onSuccess={handleSuccess}
                  onChangeZone={handleChangeZone}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
