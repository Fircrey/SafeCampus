import { AlertTriangle, X } from "lucide-react";
import type { DetectorAlert } from "@/lib/types";

interface AlertBannerProps {
  alert: DetectorAlert;
  onDismiss: () => void;
}

export function AlertBanner({ alert, onDismiss }: AlertBannerProps) {
  return (
    <div className="alert-pulse flex items-center justify-between gap-4 rounded-lg border border-cctv-red bg-cctv-red/10 px-4 py-3">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-cctv-red" />
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-cctv-red">
            ALERTA — {alert.type === "gun" ? "ARMA DE FUEGO" : "ARMA BLANCA"}
          </p>
          <p className="text-xs text-cctv-text/70">
            {alert.label} · {Math.round(alert.confidence * 100)}% confianza · {alert.timestamp}
          </p>
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 text-cctv-muted hover:text-cctv-text"
        aria-label="Cerrar alerta"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
