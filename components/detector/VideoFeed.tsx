"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FLASK_VIDEO_FEED } from "@/lib/constants";
import { useAuth } from "@/components/auth/AuthContext";
import type { DetectionBox, DetectorStatus } from "@/lib/types";

interface VideoFeedProps {
  active: boolean;
  status: DetectorStatus;
  mode: "browser" | "mjpeg";
  detectionBoxes?: DetectionBox[];
  inferenceMs?: number;
  onVideoReady?: (video: HTMLVideoElement) => void;
  onCameraError?: (message: string) => void;
}

export function VideoFeed({
  active,
  status,
  mode,
  detectionBoxes = [],
  inferenceMs = 0,
  onVideoReady,
  onCameraError,
}: VideoFeedProps) {
  const [imgError, setImgError] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const { token } = useAuth();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (active) {
      setImgError(false);
      setCameraError(null);
    }
  }, [active]);

  // Open getUserMedia when in browser mode
  useEffect(() => {
    if (mode !== "browser" || !active) {
      // Cleanup any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      return;
    }

    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { width: 640, height: 480 } })
      .then((mediaStream) => {
        if (cancelled) {
          mediaStream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = mediaStream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = mediaStream;
          video.play().then(() => {
            if (!cancelled) onVideoReady?.(video);
          });
        }
      })
      .catch((err: DOMException) => {
        if (cancelled) return;
        if (err.name === "NotAllowedError") {
          const msg = "Permiso de camara denegado. Permite el acceso en la configuracion del navegador.";
          setCameraError(msg);
          onCameraError?.(msg);
        } else if (err.name === "NotFoundError") {
          const msg = "No se encontro ninguna camara conectada.";
          setCameraError(msg);
          onCameraError?.(msg);
        } else {
          const msg = `Error al acceder a la camara: ${err.message}`;
          setCameraError(msg);
          onCameraError?.(msg);
        }
      });

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [mode, active, onVideoReady, onCameraError]);

  // Draw bounding boxes on canvas overlay
  const drawBoxes = useCallback(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Match canvas size to video display
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const det of detectionBoxes) {
      const [x1, y1, x2, y2] = det.box;
      const w = x2 - x1;
      const h = y2 - y1;

      // Color by type
      let color: string;
      if (det.is_gun) {
        color = "#ef4444"; // red
      } else if (det.is_explosive) {
        color = "#b91c1c"; // dark red
      } else if (det.is_weapon) {
        color = "#f59e0b"; // amber (knives)
      } else {
        color = "#22c55e"; // green
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x1, y1, w, h);

      // Label background
      const label = `${det.label} ${Math.round(det.confidence * 100)}%`;
      ctx.font = "bold 14px sans-serif";
      const textMetrics = ctx.measureText(label);
      const textH = 18;

      ctx.fillStyle = color;
      ctx.fillRect(x1, y1 - textH, textMetrics.width + 8, textH);

      ctx.fillStyle = "#fff";
      ctx.fillText(label, x1 + 4, y1 - 4);
    }
  }, [detectionBoxes]);

  useEffect(() => {
    if (mode === "browser") {
      drawBoxes();
    }
  }, [mode, drawBoxes]);

  const videoUrl = token ? `${FLASK_VIDEO_FEED}?token=${token}` : FLASK_VIDEO_FEED;

  const showBrowserMode = mode === "browser" && active;
  const showMjpegMode = mode === "mjpeg" && active;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-900 shadow-sm">
      {showBrowserMode ? (
        cameraError ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center px-4">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-400/60">
                <div className="h-8 w-8 rounded-full bg-red-500 opacity-40" />
              </div>
              <p className="text-sm font-semibold text-red-400">Error de camara</p>
              <p className="mt-1 text-xs text-slate-400">{cameraError}</p>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
            <canvas
              ref={canvasRef}
              className="pointer-events-none absolute inset-0 h-full w-full"
            />
          </>
        )
      ) : showMjpegMode ? (
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
            <p className="text-sm font-semibold text-slate-400">Camara detenida</p>
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

        {/* Top-right: REC indicator + inference time */}
        {active && !imgError && !cameraError && (
          <div className="absolute right-3 top-3 flex items-center gap-3">
            {mode === "browser" && inferenceMs > 0 && (
              <span className="rounded bg-black/60 px-2 py-0.5 text-xs font-mono text-emerald-400">
                {inferenceMs}ms
              </span>
            )}
            <div className="flex items-center gap-1.5">
              <span className="rec-blink h-2 w-2 rounded-full bg-red-500" />
              <span className="text-xs font-black tracking-widest text-red-500">REC</span>
            </div>
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

        {/* Bottom-right: mode indicator */}
        <div className="absolute bottom-3 right-3">
          <span className="rounded bg-black/60 px-2 py-0.5 text-xs font-semibold text-slate-300">
            {mode === "browser" ? "BROWSER" : "MJPEG"}
          </span>
        </div>
      </div>
    </div>
  );
}
