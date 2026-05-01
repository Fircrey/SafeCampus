"use client";

import { Loader2, Play, Square, Trash2, Volume2, VolumeX } from "lucide-react";

interface DetectorControlsProps {
  active: boolean;
  muted: boolean;
  loading: boolean;
  onStart: () => void;
  onStop: () => void;
  onToggleMute: () => void;
  onClear: () => void;
}

export function DetectorControls({
  active,
  muted,
  loading,
  onStart,
  onStop,
  onToggleMute,
  onClear
}: DetectorControlsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {!active ? (
        <button
          onClick={onStart}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-cctv-green px-4 py-2 text-sm font-bold text-white hover:bg-cctv-greenDim disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Iniciar
        </button>
      ) : (
        <button
          onClick={onStop}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-cctv-red px-4 py-2 text-sm font-bold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Square className="h-4 w-4" />
          )}
          Detener
        </button>
      )}

      <button
        onClick={onToggleMute}
        className="flex items-center gap-2 rounded-lg border border-cctv-border px-4 py-2 text-sm font-semibold text-cctv-text hover:bg-cctv-card"
      >
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        {muted ? "Sin audio" : "Con audio"}
      </button>

      <button
        onClick={onClear}
        className="flex items-center gap-2 rounded-lg border border-cctv-border px-4 py-2 text-sm font-semibold text-cctv-muted hover:bg-cctv-card hover:text-cctv-text"
      >
        <Trash2 className="h-4 w-4" />
        Limpiar
      </button>
    </div>
  );
}
