"use client";

import Link from "next/link";
import { Camera } from "lucide-react";
import { BentoCard } from "./BentoCard";
import { useDetectorSocket } from "@/components/detector/useDetectorSocket";

export function LiveDetectionsCard({ className = "" }: { className?: string }) {
  const { status, stats, log, activeAlert } = useDetectorSocket();

  const isOnline = status === "online";
  const lastFive = log.slice(0, 5);

  return (
    <BentoCard title="Detecciones en vivo" icon={Camera} className={className}>
      {/* Alert banner */}
      {activeAlert && (
        <div className="mb-4 animate-blink rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white">
          ⚠ Alerta: {activeAlert.label} ({Math.round(activeAlert.confidence * 100)}%)
        </div>
      )}

      {/* Status dot */}
      <div className="mb-4 flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${isOnline ? "bg-emerald-500" : "bg-red-500"}`}
        />
        <span className="text-sm font-medium text-slate-600">
          {isOnline ? "En línea" : "Fuera de línea"}
        </span>
      </div>

      {/* Mini metrics */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-slate-50 px-3 py-2 text-center">
          <p className="text-lg font-black text-tadeo-blue">{stats.total_detections}</p>
          <p className="text-[10px] text-slate-500">Total</p>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2 text-center">
          <p className="text-lg font-black text-tadeo-blue">{stats.guns}</p>
          <p className="text-[10px] text-slate-500">Fuego</p>
        </div>
        <div className="rounded-lg bg-slate-50 px-3 py-2 text-center">
          <p className="text-lg font-black text-tadeo-blue">{stats.knives}</p>
          <p className="text-[10px] text-slate-500">Blancas</p>
        </div>
      </div>

      {/* Last 5 detections */}
      {lastFive.length === 0 ? (
        <p className="py-2 text-center text-xs text-slate-400">Sin detecciones recientes</p>
      ) : (
        <ul className="space-y-1.5">
          {lastFive.map((entry, i) => (
            <li
              key={entry.id ?? i}
              className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-1.5 text-xs"
            >
              <span className="font-medium text-slate-700">{entry.class}</span>
              <span className="text-slate-500">
                {Math.round(entry.confidence * 100)}%
                <span className="ml-2 text-slate-400">
                  {new Date(entry.timestamp).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/detector"
        className="mt-4 inline-block text-xs font-bold text-tadeo-blue hover:underline"
      >
        Ir al detector →
      </Link>
    </BentoCard>
  );
}
