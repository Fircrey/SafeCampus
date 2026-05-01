"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "./MetricCard";
import type { DetectorStats } from "@/lib/types";

export function DashboardStats() {
  const [stats, setStats] = useState<DetectorStats | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        const res = await fetch("/flask/api/stats");
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as DetectorStats;
        setStats(data);
      } catch {
        // Flask offline — mantener null para mostrar valores demo
      }
    }

    void fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <MetricCard
        label="Detecciones"
        value={stats ? String(stats.total_detections) : "—"}
      />
      <MetricCard
        label="Armas de fuego"
        value={stats ? String(stats.guns) : "—"}
      />
      <MetricCard
        label="Armas blancas"
        value={stats ? String(stats.knives) : "—"}
      />
      <MetricCard label="Modelo" value="YOLOv8" />
    </>
  );
}
