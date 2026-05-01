import { Loader2, ShieldCheck } from "lucide-react";
import type { Detection } from "@/lib/types";

interface RiskLevel {
  label: string;
  text: string;
}

function getRiskLevel(detections: Detection[]): RiskLevel {
  const max = Math.max(0, ...detections.map((d) => d.confidence));
  if (max > 0.8) return { label: "R3", text: "Verificación humana inmediata" };
  if (max > 0.55) return { label: "R2", text: "Revisar con operador" };
  return { label: "R1", text: "Monitoreo preventivo" };
}

interface DetectionResultsProps {
  detections: Detection[];
  detectMode: string;
  loading: boolean;
  canAnalyze: boolean;
  onAnalyze: () => void;
}

export function DetectionResults({
  detections,
  detectMode,
  loading,
  canAnalyze,
  onAnalyze
}: DetectionResultsProps) {
  const risk = getRiskLevel(detections);

  return (
    <aside className="space-y-3">
      <button
        className="focus-ring flex w-full items-center justify-center gap-2 bg-tadeo-yellow px-4 py-3 font-black text-tadeo-blue disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!canAnalyze || loading}
        onClick={onAnalyze}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <ShieldCheck className="h-5 w-5" />
        )}
        Analizar
      </button>

      <div className="border border-slate-200 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
          Nivel contextual
        </p>
        <p className="mt-2 text-3xl font-black text-tadeo-blue">{risk.label}</p>
        <p className="text-sm text-slate-600">{risk.text}</p>
      </div>

      <div className="border border-slate-200 p-4">
        <p className="mb-3 text-sm font-black text-tadeo-ink">
          Detecciones {detectMode ? `(${detectMode})` : ""}
        </p>
        <div className="space-y-2">
          {detections.length ? (
            detections.map((item, index) => (
              <div
                key={`${item.class}-${index}`}
                className="flex items-center justify-between border-l-4 border-tadeo-yellow bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="font-bold">{item.class}</span>
                <span>{Math.round(item.confidence * 100)}%</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Aún no hay resultados.</p>
          )}
        </div>
      </div>
    </aside>
  );
}
