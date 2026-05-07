"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { BentoCard } from "./BentoCard";
import { useZoneReports } from "@/hooks/useZoneReports";

export function ZoneActivityCard({ className = "" }: { className?: string }) {
  const { zoneCounts, loading } = useZoneReports();

  const sorted = Array.from(zoneCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maxCount = sorted.length > 0 ? sorted[0].count : 1;

  return (
    <BentoCard title="Actividad por zona" icon={MapPin} className={className}>
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-tadeo-blue" />
        </div>
      ) : sorted.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-400">Sin datos de zonas</p>
      ) : (
        <>
          <ul className="space-y-3">
            {sorted.map((zone) => {
              const pct = (zone.count / maxCount) * 100;
              return (
                <li key={zone.zone_id}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600 truncate max-w-[70%]">
                      {zone.zone_name}
                    </span>
                    <span className="font-bold text-slate-500">{zone.count}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-tadeo-blue transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>

          <Link
            href="/mapa"
            className="mt-4 inline-block text-xs font-bold text-tadeo-blue hover:underline"
          >
            Ver mapa completo →
          </Link>
        </>
      )}
    </BentoCard>
  );
}
