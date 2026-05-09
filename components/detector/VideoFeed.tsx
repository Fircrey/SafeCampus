"use client";

import { useEffect, useState } from "react";
import { FLASK_VIDEO_FEED } from "@/lib/constants";
import { useAuth } from "@/components/auth/AuthContext";
import type { DetectorStatus } from "@/lib/types";

interface VideoFeedProps {
  active: boolean;
  status: DetectorStatus;
}

export function VideoFeed({ active, status }: VideoFeedProps) {
  const [imgError, setImgError] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (active) setImgError(false);
  }, [active]);
  const videoUrl = token ? `${FLASK_VIDEO_FEED}?token=${token}` : FLASK_VIDEO_FEED;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-900 shadow-sm">
      {active ? (
        imgError ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-400/60">
                <div className="h-8 w-8 rounded-full bg-red-500 opacity-40" />
              </div>
              <p className="text-sm font-semibold text-red-400">Error de stream</p>
              <p className="mt-1 text-xs text-slate-400">
                No se pudo cargar el feed de video
              </p>
            </div>
          </div>
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={videoUrl}
            alt="Feed de deteccion en vivo"
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
            onLoad={() => setImgError(false)}
          />
        )
      ) : (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 border-slate-600">
              <div className="h-8 w-8 rounded-full bg-slate-500 opacity-40" />
            </div>
            <p className="text-sm font-semibold text-slate-400">Cámara detenida</p>
            <p className="mt-1 text-xs text-slate-500">
              Pulsa Iniciar para activar el detector
            </p>
          </div>
        </div>
      )}

      {/* Overlays */}
      <div className="pointer-events-none absolute inset-0">
        {/* Top-left: CAM label */}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="rounded bg-black/60 px-2 py-0.5 text-xs font-black tracking-widest text-white">
            CAM-01
          </span>
        </div>

        {/* Top-right: REC indicator */}
        {active && !imgError && (
          <div className="absolute right-3 top-3 flex items-center gap-1.5">
            <span className="rec-blink h-2 w-2 rounded-full bg-red-500" />
            <span className="text-xs font-black tracking-widest text-red-500">REC</span>
          </div>
        )}

        {/* Bottom-left: status */}
        <div className="absolute bottom-3 left-3">
          <span
            className={`rounded px-2 py-0.5 text-xs font-semibold ${
              status === "online"
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-slate-500/20 text-slate-400"
            }`}
          >
            {status === "online" ? "EN LINEA" : "FUERA DE LINEA"}
          </span>
        </div>
      </div>
    </div>
  );
}
