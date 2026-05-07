"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FLASK_API_HEALTH } from "@/lib/constants";

interface HealthChecks {
  database: boolean;
  model_loaded: boolean;
  detector_running: boolean;
}

type HealthStatus = "ok" | "degraded" | "offline";

interface SystemHealthState {
  status: HealthStatus;
  checks: HealthChecks;
  loading: boolean;
}

const OFFLINE_CHECKS: HealthChecks = {
  database: false,
  model_loaded: false,
  detector_running: false,
};

export function useSystemHealth(): SystemHealthState {
  const [checks, setChecks] = useState<HealthChecks>(OFFLINE_CHECKS);
  const [status, setStatus] = useState<HealthStatus>("offline");
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(FLASK_API_HEALTH);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { status: string; checks: HealthChecks };
      setChecks(data.checks);

      const allOk = data.checks.database && data.checks.model_loaded && data.checks.detector_running;
      const allDown = !data.checks.database && !data.checks.model_loaded && !data.checks.detector_running;
      setStatus(allOk ? "ok" : allDown ? "offline" : "degraded");
    } catch {
      setChecks(OFFLINE_CHECKS);
      setStatus("offline");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    poll();
    intervalRef.current = setInterval(poll, 30_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [poll]);

  return { status, checks, loading };
}
