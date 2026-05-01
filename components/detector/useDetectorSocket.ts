"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { FLASK_URL } from "@/lib/constants";
import type {
  DetectorAlert,
  DetectorLogEntry,
  DetectorStats,
  DetectorStatus
} from "@/lib/types";

const DEFAULT_STATS: DetectorStats = {
  total_detections: 0,
  guns: 0,
  knives: 0,
  average_confidence: 0
};

interface UseDetectorSocketOptions {
  onAlert?: (alert: DetectorAlert) => void;
}

export function useDetectorSocket({ onAlert }: UseDetectorSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<DetectorStatus>("offline");
  const [stats, setStats] = useState<DetectorStats>(DEFAULT_STATS);
  const [log, setLog] = useState<DetectorLogEntry[]>([]);
  const [activeAlert, setActiveAlert] = useState<DetectorAlert | null>(null);

  useEffect(() => {
    const socket = io(FLASK_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("online");
    });

    socket.on("disconnect", () => {
      setStatus("offline");
    });

    socket.on("connect_error", () => {
      setStatus("offline");
    });

    socket.on("status_change", (data: { status: string }) => {
      setStatus(data.status === "online" ? "online" : "offline");
    });

    socket.on("stats_update", (data: DetectorStats) => {
      setStats(data);
    });

    socket.on("new_detection", (entry: DetectorLogEntry) => {
      setLog((prev) => [entry, ...prev].slice(0, 50));
    });

    socket.on("alert", (data: DetectorAlert) => {
      setActiveAlert(data);
      onAlert?.(data);
      // Auto-dismiss after 5s
      setTimeout(() => setActiveAlert(null), 5000);
    });

    socket.on("alert_clear", () => {
      setActiveAlert(null);
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearLog = useCallback(() => {
    setLog([]);
  }, []);

  return { status, stats, log, activeAlert, clearLog };
}
