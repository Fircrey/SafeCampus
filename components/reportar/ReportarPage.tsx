"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { useGeolocation } from "@/hooks/useGeolocation";
import { detectZone, isNearCampus, getAllZones } from "@/lib/geo-utils";
import type { ZoneDetectionResult } from "@/lib/geo-utils";
import type { ZoneFeature } from "@/lib/zone-types";
import type { Report } from "@/lib/types";
import { ReportForm } from "./ReportForm";
import { ReportConfirmation } from "./ReportConfirmation";

interface ReportarPageProps {
  initialZoneId?: string | null;
}

export function ReportarPage({ initialZoneId }: ReportarPageProps) {
  const geo = useGeolocation();

  const [selectedZone, setSelectedZone] = useState<ZoneFeature | null>(null);
  const [showManualSelector, setShowManualSelector] = useState(false);
  const [createdReport, setCreatedReport] = useState<Report | null>(null);

  const detection: ZoneDetectionResult | null = useMemo(() => {
    if (geo.status !== "granted" || geo.longitude === null || geo.latitude === null) return null;
    return detectZone(geo.longitude, geo.latitude);
  }, [geo.status, geo.latitude, geo.longitude]);

  const nearCampus = useMemo(() => {
    if (geo.longitude === null || geo.latitude === null) return true;
    return isNearCampus(geo.longitude, geo.latitude);
  }, [geo.latitude, geo.longitude]);

  useEffect(() => {
    if (initialZoneId && !selectedZone) {
      const allZones = getAllZones();
      const match = allZones.find((z) => z.properties.id === initialZoneId);
      if (match) {
        setSelectedZone(match);
      }
    }
  }, [initialZoneId, selectedZone]);

  useEffect(() => {
    if (detection && !selectedZone) {
      setSelectedZone(detection.zone);
    }
  }, [detection, selectedZone]);

  useEffect(() => {
    if (
      (geo.status === "denied" || geo.status === "unavailable") &&
      !selectedZone
    ) {
      setShowManualSelector(true);
    }
  }, [geo.status, selectedZone]);

  function handleChangeZone() {
    setShowManualSelector(true);
  }

  function handleSelectZone(zone: ZoneFeature) {
    setSelectedZone(zone);
    setShowManualSelector(false);
  }

  function handleSuccess(report: Report) {
    setCreatedReport(report);
  }

  function handleNewReport() {
    setCreatedReport(null);
    setSelectedZone(null);
    setShowManualSelector(false);
  }

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
        {createdReport ? (
          <ReportConfirmation
            report={createdReport}
            onNewReport={handleNewReport}
          />
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
              <img
                src="/mascot-ayuda.png"
                alt="Cabito"
                width={36}
                height={36}
                className="shrink-0 drop-shadow-sm"
              />
              <p className="text-sm text-slate-600">
                Completa los campos esenciales y envia tu reporte. Despues podras complementarlo con foto, prioridad y mas.
              </p>
            </div>

            <ReportForm
              zone={selectedZone}
              geoStatus={geo.status}
              detection={detection}
              accuracy={geo.accuracy}
              isNearCampus={nearCampus}
              latitude={geo.latitude}
              longitude={geo.longitude}
              showManualSelector={showManualSelector}
              onChangeZone={handleChangeZone}
              onSelectZone={handleSelectZone}
              onRetryGeo={geo.retry}
              onSuccess={handleSuccess}
            />
          </div>
        )}
      </div>
    </main>
  );
}
