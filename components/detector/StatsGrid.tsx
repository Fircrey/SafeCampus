import type { DetectorStats } from "@/lib/types";

interface StatsGridProps {
  stats: DetectorStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  const items = [
    { label: "Total detecciones", value: stats.total_detections },
    { label: "Armas de fuego", value: stats.guns },
    { label: "Armas blancas", value: stats.knives },
    {
      label: "Confianza media",
      value: `${Math.round(stats.average_confidence * 100)}%`
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
            {item.label}
          </p>
          <p className="mt-2 text-2xl font-black text-tadeo-blue">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
