"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { FLASK_URL } from "@/lib/constants";
import { useAuth } from "@/components/auth/AuthContext";
import { fetchReportsByZone } from "@/lib/flask-client";
import type { ZoneCount } from "@/lib/zone-types";

export function useZoneReports() {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [zoneCounts, setZoneCounts] = useState<Map<string, ZoneCount>>(new Map());
  const [loading, setLoading] = useState(true);

  const loadCounts = useCallback(async () => {
    try {
      const zones = await fetchReportsByZone();
      const map = new Map<string, ZoneCount>();
      for (const z of zones) {
        map.set(z.zone_id, z);
      }
      setZoneCounts(map);
    } catch {
      // Silently fail - counts will be empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  useEffect(() => {
    if (!token) return;

    const socket = io(FLASK_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      query: { token },
    });
    socketRef.current = socket;

    socket.on("new_zone_report", (data: { zone_id: string; zone_name: string; priority: string; status: string }) => {
      setZoneCounts((prev) => {
        const next = new Map(prev);
        const existing = next.get(data.zone_id);
        if (existing) {
          next.set(data.zone_id, { ...existing, count: existing.count + 1 });
        } else {
          next.set(data.zone_id, { zone_id: data.zone_id, zone_name: data.zone_name, count: 1 });
        }
        return next;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const refresh = useCallback(() => {
    setLoading(true);
    loadCounts();
  }, [loadCounts]);

  return { zoneCounts, loading, refresh };
}
