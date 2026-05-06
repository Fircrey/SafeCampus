"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { ZoneFeature } from "@/lib/zone-types";

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

interface ZoneListProps {
  features: ZoneFeature[];
  selectedZoneId: string | null;
  reportCounts: Map<string, number>;
  onSelectZone: (zoneId: string) => void;
}

export function ZoneList({ features, selectedZoneId, reportCounts, onSelectZone }: ZoneListProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = normalize(search.trim());
    if (!q) return features;
    return features.filter((f) => {
      const searchable = normalize(
        [f.properties.name, f.properties.ref ?? "", f.properties.category].join(" ")
      );
      return searchable.includes(q);
    });
  }, [search, features]);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          aria-label="Buscar zona"
          placeholder="Buscar zona..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm text-tadeo-ink placeholder:text-slate-400 focus:border-tadeo-blue focus:outline-none focus:ring-1 focus:ring-tadeo-blue"
        />
      </div>
      <div className="max-h-64 space-y-1 overflow-y-auto">
        {filtered.map((f) => {
          const count = reportCounts.get(f.properties.id) ?? 0;
          const isSelected = selectedZoneId === f.properties.id;

          return (
            <button
              key={f.properties.id}
              type="button"
              onClick={() => onSelectZone(f.properties.id)}
              className={`flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm transition ${
                isSelected
                  ? "bg-tadeo-blue text-white"
                  : "bg-white text-tadeo-ink hover:bg-slate-50"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded text-xs font-bold ${
                  isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-tadeo-blue"
                }`}
              >
                {f.properties.ref ?? "Z"}
              </span>
              <span className="flex-1 truncate">
                <strong className="block text-sm leading-tight">{f.properties.name}</strong>
                <span className={`text-xs ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                  {f.properties.category}
                </span>
              </span>
              {count > 0 && (
                <span
                  className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold ${
                    isSelected ? "bg-red-400 text-white" : "bg-red-100 text-red-700"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
