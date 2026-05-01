import type { DetectorLogEntry } from "@/lib/types";

interface DetectionLogProps {
  entries: DetectorLogEntry[];
}

function badgeColor(cls: string) {
  const lower = cls.toLowerCase();
  if (lower === "pistol" || lower === "gun" || lower === "arma" || lower === "pistola") {
    return "border-cctv-red text-cctv-red";
  }
  if (lower === "knife" || lower === "cuchillo") {
    return "border-cctv-orange text-cctv-orange";
  }
  return "border-cctv-blue text-cctv-blue";
}

export function DetectionLog({ entries }: DetectionLogProps) {
  return (
    <div className="rounded-lg border border-cctv-border bg-cctv-card">
      <div className="border-b border-cctv-border px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-widest text-cctv-muted">
          Historial de detecciones
        </p>
      </div>
      <div className="h-64 overflow-y-auto p-2">
        {entries.length === 0 ? (
          <p className="py-8 text-center text-sm text-cctv-muted">Sin detecciones registradas.</p>
        ) : (
          <ul className="space-y-1">
            {entries.map((entry, i) => (
              <li
                key={`${entry.timestamp}-${i}`}
                className={`flex items-center justify-between rounded border-l-2 bg-cctv-bg/60 px-3 py-2 text-xs ${badgeColor(entry.class)}`}
              >
                <span className="font-bold text-cctv-text">{entry.class}</span>
                <span className="text-cctv-muted">{Math.round(entry.confidence * 100)}%</span>
                <span className="text-cctv-muted">{entry.timestamp}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
