"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  ClipboardList,
  FileText,
  MapPin,
  Target,
  AlertTriangle,
} from "lucide-react";
import zonesGeoJson from "@/lib/data/utadeo-zones.json";
import type { ZoneCollection, ZoneFeature } from "@/lib/zone-types";
import { useZoneReports } from "@/hooks/useZoneReports";
import { MapSVG } from "./MapSVG";
import { ZoneList } from "./ZoneList";
import { ZoneReportForm } from "./ZoneReportForm";
import { ZoneReportHistory } from "./ZoneReportHistory";

const zones = zonesGeoJson as unknown as ZoneCollection;

export function CampusMapPage() {
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { zoneCounts, loading, refresh } = useZoneReports();

  const selectedZone: ZoneFeature | null = useMemo(
    () => zones.features.find((f) => f.properties.id === selectedZoneId) ?? null,
    [selectedZoneId]
  );

  const countMap = useMemo(() => {
    const m = new Map<string, number>();
    zoneCounts.forEach((v, k) => m.set(k, v.count));
    return m;
  }, [zoneCounts]);

  const totalReports = useMemo(() => {
    let sum = 0;
    zoneCounts.forEach((v) => { sum += v.count; });
    return sum;
  }, [zoneCounts]);

  function handleSelectZone(zoneId: string) {
    setSelectedZoneId(zoneId);
  }

  function handleReportCreated() {
    refresh();
    setRefreshKey((k) => k + 1);
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center gap-4">
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
            <h1 className="text-xl font-black text-tadeo-ink">
              Mapa de Reportes por Zona
            </h1>
          </div>
          <div className="hidden items-center gap-4 sm:flex">
            <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
              <Building2 className="h-4 w-4" />
              {zones.features.length} zonas
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
              <ClipboardList className="h-4 w-4" />
              {loading ? "..." : totalReports} reportes activos
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Left: Map */}
          <div className="flex flex-col gap-4">
            {/* Selected zone chip */}
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-tadeo-blue" />
              <span className="text-sm font-semibold text-tadeo-ink">
                {selectedZone ? selectedZone.properties.name : "Selecciona una zona"}
              </span>
              {selectedZone?.properties.ref && (
                <span className="rounded bg-tadeo-blue/10 px-2 py-0.5 text-xs font-bold text-tadeo-blue">
                  {selectedZone.properties.ref}
                </span>
              )}
              {selectedZone && (
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                  {selectedZone.properties.category}
                </span>
              )}
            </div>

            {/* SVG Map */}
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-panel">
              <MapSVG
                features={zones.features}
                selectedZoneId={selectedZoneId}
                reportCounts={countMap}
                onSelectZone={handleSelectZone}
              />
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-sm border border-slate-300 bg-slate-200" />
                Zona
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-sm border border-yellow-400 bg-yellow-400" />
                Con reportes
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-sm border border-tadeo-blue bg-tadeo-blue" />
                Seleccionada
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-3 w-3 rounded-full border border-red-400 bg-red-500" />
                Cantidad de reportes
              </span>
            </div>
          </div>

          {/* Right: Sidebar panels */}
          <aside className="flex flex-col gap-4">
            {/* Zone detail */}
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-black text-tadeo-ink">Zona activa</h2>
                <Target className="h-4 w-4 text-slate-400" />
              </div>
              {selectedZone ? (
                <div>
                  <h3 className="text-base font-bold text-tadeo-blue">
                    {selectedZone.properties.name}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedZone.properties.ref && (
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                        {selectedZone.properties.ref}
                      </span>
                    )}
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                      {selectedZone.properties.category}
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                      {countMap.get(selectedZoneId!) ?? 0} reportes
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">Sin zona activa.</p>
              )}
            </section>

            {/* Report form */}
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-black text-tadeo-ink">Nuevo Reporte</h2>
                <FileText className="h-4 w-4 text-slate-400" />
              </div>
              <ZoneReportForm zone={selectedZone} onReportCreated={handleReportCreated} />
            </section>

            {/* Zone list */}
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-black text-tadeo-ink">Zonas</h2>
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                  {zones.features.length}
                </span>
              </div>
              <ZoneList
                features={zones.features}
                selectedZoneId={selectedZoneId}
                reportCounts={countMap}
                onSelectZone={handleSelectZone}
              />
            </section>

            {/* Report history */}
            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-black text-tadeo-ink">Historial de zona</h2>
                <AlertTriangle className="h-4 w-4 text-slate-400" />
              </div>
              <ZoneReportHistory zoneId={selectedZoneId} refreshKey={refreshKey} />
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
