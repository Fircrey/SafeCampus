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
          className="flex items-center gap-2 rounded-lg bg-tadeo-blue px-4 py-2 text-sm font-bold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Iniciar
        </button>
      ) : (
        <button
          onClick={onStop}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
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
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-tadeo-ink hover:bg-slate-50"
      >
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        {muted ? "Sin audio" : "Con audio"}
      </button>

      <button
        onClick={onClear}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-tadeo-ink"
      >
        <Trash2 className="h-4 w-4" />
        Limpiar
      </button>
    </div>
  );
}
