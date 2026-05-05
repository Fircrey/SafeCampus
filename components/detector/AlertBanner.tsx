import { X } from "lucide-react";
import type { DetectorAlert } from "@/lib/types";

interface AlertBannerProps {
  alert: DetectorAlert;
  onDismiss: () => void;
}

export function AlertBanner({ alert, onDismiss }: AlertBannerProps) {
  return (
    <div className="alert-pulse flex items-center justify-between gap-4 rounded-lg border border-cctv-red bg-cctv-red/10 px-4 py-3">
      <div className="flex items-center gap-3">
        <img
          src="/mascot-alertas.png"
          alt="Cabito Alerta"
          width={40}
          height={40}
          className="shrink-0 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
        />
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
