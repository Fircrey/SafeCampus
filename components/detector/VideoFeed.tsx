"use client";

import { useState } from "react";
import { FLASK_VIDEO_FEED } from "@/lib/constants";
import type { DetectorStatus } from "@/lib/types";

interface VideoFeedProps {
  active: boolean;
  status: DetectorStatus;
}

export function VideoFeed({ active, status }: VideoFeedProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-cctv-card">
      {active ? (
        imgError ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 border-cctv-red/60">
                <div className="h-8 w-8 rounded-full bg-cctv-red opacity-40" />
              </div>
              <p className="text-sm font-semibold text-cctv-red">Error de stream</p>
              <p className="mt-1 text-xs text-cctv-muted/60">
                No se pudo cargar el feed de video
              </p>
            </div>
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={FLASK_VIDEO_FEED}
            alt="Feed de deteccion en vivo"
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
            onLoad={() => setImgError(false)}
          />
        )
      ) : (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 border-cctv-border">
              <div className="h-8 w-8 rounded-full bg-cctv-muted opacity-40" />
            </div>
            <p className="text-sm font-semibold text-cctv-muted">Camara detenida</p>
            <p className="mt-1 text-xs text-cctv-muted/60">
              Pulsa Iniciar para activar el detector
            </p>
          </div>
        </div>
      )}

      {/* Overlays */}
      <div className="pointer-events-none absolute inset-0">
        {/* Top-left: CAM label */}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="bg-cctv-card/80 px-2 py-0.5 text-xs font-black tracking-widest text-cctv-green">
            CAM-01
          </span>
        </div>

        {/* Top-right: REC indicator */}
        {active && !imgError && (
          <div className="absolute right-3 top-3 flex items-center gap-1.5">
            <span className="rec-blink h-2 w-2 rounded-full bg-cctv-red" />
            <span className="text-xs font-black tracking-widest text-cctv-red">REC</span>
          </div>
        )}

        {/* Bottom-left: status */}
        <div className="absolute bottom-3 left-3">
          <span
            className={`px-2 py-0.5 text-xs font-semibold ${
              status === "online"
                ? "bg-cctv-green/20 text-cctv-green"
                : "bg-cctv-muted/20 text-cctv-muted"
            }`}
          >
            {status === "online" ? "EN LINEA" : "FUERA DE LINEA"}
          </span>
        </div>
      </div>
    </div>
  );
}
