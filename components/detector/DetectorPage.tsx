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
    <main className="min-h-screen bg-cctv-bg text-cctv-text">
      {/* Header */}
      <div className="border-b border-cctv-border px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cctv-muted">
              YOLOv8 · Tiempo real
            </p>
            <h1 className="text-2xl font-black">Detector en Vivo</h1>
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

      <div className="space-y-5 p-6">
        {/* Connection error */}
        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Alert banner */}
        {activeAlert && (
          <AlertBanner alert={activeAlert} onDismiss={dismissAlert} />
        )}

        {/* Video feed — solo si activo Y Flask responde */}
        <VideoFeed active={active && status === "online"} status={status} />

        {/* Stats */}
        <StatsGrid stats={stats} />

        {/* Log */}
        <DetectionLog entries={log} />

        {/* Disclaimer */}
        <p className="text-center text-xs text-cctv-muted">
          El sistema requiere validación humana. Armas detectadas: pistola, cuchillo.
          IA alerta, personas deciden.
        </p>
      </div>
    </main>
  );
}
