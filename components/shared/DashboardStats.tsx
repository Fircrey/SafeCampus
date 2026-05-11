"use client";

import { useEffect, useState } from "react";
import { MetricCard } from "./MetricCard";
import { getStats } from "@/lib/flask-client";
import type { DetectorStats } from "@/lib/types";

export function DashboardStats() {
  const [stats, setStats] = useState<DetectorStats | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      try {
        const data = await getStats();
        if (!cancelled) setStats(data);
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
      <MetricCard
        label="Explosivos"
        value={stats ? String(stats.explosives) : "—"}
      />
    </>
  );
}
