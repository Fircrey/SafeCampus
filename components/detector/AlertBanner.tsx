import { X } from "lucide-react";
import type { DetectorAlert } from "@/lib/types";

interface AlertBannerProps {
  alert: DetectorAlert;
  onDismiss: () => void;
}

export function AlertBanner({ alert, onDismiss }: AlertBannerProps) {
  return (
    <div className="alert-pulse flex items-center justify-between gap-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3">
      <div className="flex items-center gap-3">
        <img
          src="/mascot-alertas.png"
          alt="Cabito Alerta"
          width={40}
          height={40}
          className="shrink-0 drop-shadow-md"
        />
        <div>
          <p className="text-sm font-black uppercase tracking-widest text-red-700">
            ALERTA — {alert.type === "gun" ? "ARMA DE FUEGO" : "ARMA BLANCA"}
          </p>
          <p className="text-xs text-red-600/70">
            {alert.label} · {Math.round(alert.confidence * 100)}% confianza · {alert.timestamp}
          </p>
        </div>
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 text-red-400 hover:text-red-700"
        aria-label="Cerrar alerta"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
