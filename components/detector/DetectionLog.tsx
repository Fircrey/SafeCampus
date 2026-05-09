import type { DetectorLogEntry } from "@/lib/types";

interface DetectionLogProps {
  entries: DetectorLogEntry[];
}

function badgeColor(cls: string) {
  const lower = cls.toLowerCase();
  if (lower === "pistol" || lower === "gun" || lower === "arma" || lower === "pistola") {
    return "border-red-500 text-red-700";
  }
  if (lower === "knife" || lower === "cuchillo") {
    return "border-amber-500 text-amber-700";
  }
  return "border-tadeo-blue text-tadeo-blue";
}

export function DetectionLog({ entries }: DetectionLogProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
          Historial de detecciones
        </p>
      </div>
      <div className="h-64 overflow-y-auto p-2">
        {entries.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">Sin detecciones registradas.</p>
        ) : (
          <ul className="space-y-1">
            {entries.map((entry, i) => (
              <li
                key={entry.id ?? `${entry.timestamp}-${i}`}
                className={`flex items-center justify-between rounded border-l-2 bg-slate-50 px-3 py-2 text-xs ${badgeColor(entry.class)}`}
              >
                <span className="font-bold text-tadeo-ink">{entry.class}</span>
                <span className="text-slate-500">{Math.round(entry.confidence * 100)}%</span>
                <span className="text-slate-500">{entry.timestamp}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
