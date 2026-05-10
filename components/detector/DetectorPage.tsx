"use client";

import { useCallback, useEffect, useState } from "react";
import { clearHistory, startDetection, stopDetection } from "@/lib/flask-client";
import { useAlertSound } from "@/hooks/useAlertSound";
import { AlertBanner } from "./AlertBanner";
import { DetectionLog } from "./DetectionLog";
import { DetectorControls } from "./DetectorControls";
import { StatsGrid } from "./StatsGrid";
import { useDetectorSocket } from "./useDetectorSocket";
import { VideoFeed } from "./VideoFeed";

export function DetectorPage() {
  const { play, toggleMute, isMuted } = useAlertSound();
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { status, stats, log, activeAlert, clearLog, dismissAlert } = useDetectorSocket({
    onAlert: () => play()
  });

  useEffect(() => {
    if (activeAlert) {
      document.title = `⚠️ ALERTA — ${activeAlert.label} | SafeCampus AI`;
    } else {
      document.title = "SafeCampus AI";
    }
    return () => {
      document.title = "SafeCampus AI";
    };
  }, [activeAlert]);

  const handleStart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await startDetection();
      if (result.success) {
        setActive(true);
      } else {
        setError(result.message ?? "Error al iniciar el detector");
      }
    } catch {
      setError("No se puede conectar con Flask. ¿Está ejecutándose en localhost:5000?");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStop = useCallback(async () => {
    setLoading(true);
    try {
      await stopDetection();
      setActive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClear = useCallback(async () => {
    clearLog();
    try {
      await clearHistory();
    } catch {
      // ignore if Flask offline
    }
  }, [clearLog]);

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/mascot-detector.png"
              alt="Cabito Seguridad"
              width={44}
              height={44}
              className="shrink-0 drop-shadow-md"
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-tadeo-blue">
                Universidad Jorge Tadeo Lozano
              </p>
              <h1 className="text-xl font-black text-tadeo-ink">Detector en Vivo</h1>
            </div>
          </div>
          <DetectorControls
            active={active}
            muted={isMuted}
            loading={loading}
            onStart={handleStart}
            onStop={handleStop}
            onToggleMute={toggleMute}
            onClear={handleClear}
          />
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-5 px-6 py-6">
        {/* Connection error */}
        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Alert banner */}
        {activeAlert && (
          <AlertBanner alert={activeAlert} onDismiss={dismissAlert} />
        )}

        {/* Connection status indicator */}
        {status === "connecting" && (
          <p className="animate-pulse text-center text-xs text-amber-600">
            Conectando con el servidor de detección...
          </p>
        )}
        {status === "offline" && !active && !error && (
          <p className="text-center text-xs text-slate-500">
            Servidor fuera de línea. Asegúrate de que Flask está ejecutándose en localhost:5000.
          </p>
        )}

        {/* Video feed — activo si el usuario inicio la deteccion */}
        <VideoFeed active={active} status={status} />

        {/* Stats */}
        <StatsGrid stats={stats} />

        {/* Log */}
        <DetectionLog entries={log} />

        {/* Disclaimer */}
        <p className="text-center text-xs text-slate-400">
          El sistema requiere validación humana. Amenazas detectadas: armas de fuego (rifles, pistolas, escopetas, subfusiles) y cuchillos.
          IA alerta, personas deciden.
        </p>
      </div>
    </main>
  );
}
