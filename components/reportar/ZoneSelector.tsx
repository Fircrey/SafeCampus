"use client";

import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { getAllZones } from "@/lib/geo-utils";
import type { ZoneFeature } from "@/lib/zone-types";

interface ZoneSelectorProps {
  selectedZone: ZoneFeature | null;
  onSelect: (zone: ZoneFeature) => void;
}

export function ZoneSelector({ selectedZone, onSelect }: ZoneSelectorProps) {
  const [search, setSearch] = useState("");
  const zones = getAllZones();

  const filtered = search.trim()
    ? zones.filter(
        (z) =>
          z.properties.name.toLowerCase().includes(search.toLowerCase()) ||
          (z.properties.ref?.toLowerCase().includes(search.toLowerCase()) ?? false)
      )
    : zones;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-tadeo-blue" />
        <h3 className="text-sm font-bold text-tadeo-ink">Selecciona una zona</h3>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar zona..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-tadeo-ink placeholder:text-slate-400 focus:border-tadeo-blue focus:outline-none"
        />
      </div>

      <div className="max-h-56 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="py-2 text-center text-xs text-slate-400">Sin resultados</p>
        ) : (
          <div className="space-y-1">
            {filtered.map((zone) => {
              const isSelected = selectedZone?.properties.id === zone.properties.id;
              return (
                <button
                  key={zone.properties.id}
                  type="button"
                  onClick={() => onSelect(zone)}
                  className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm transition ${
                    isSelected
                      ? "bg-tadeo-blue/10 font-semibold text-tadeo-blue"
                      : "text-tadeo-ink hover:bg-slate-50"
                  }`}
                >
                  <span className="flex-1">{zone.properties.name}</span>
                  {zone.properties.ref && (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                      {zone.properties.ref}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
