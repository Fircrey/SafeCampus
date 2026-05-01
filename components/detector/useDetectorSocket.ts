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
  const alertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onAlertRef = useRef(onAlert);
  const wasEverOnlineRef = useRef(false);

  const [status, setStatus] = useState<DetectorStatus>("connecting");
  const [stats, setStats] = useState<DetectorStats>(DEFAULT_STATS);
  const [log, setLog] = useState<DetectorLogEntry[]>([]);
  const [activeAlert, setActiveAlert] = useState<DetectorAlert | null>(null);

  // Keep onAlertRef in sync without re-running the main effect
  useEffect(() => {
    onAlertRef.current = onAlert;
  }, [onAlert]);

  useEffect(() => {
    const socket = io(FLASK_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      wasEverOnlineRef.current = true;
      setStatus("online");
    });

    socket.on("disconnect", () => {
      setStatus("offline");
    });

    socket.on("connect_error", () => {
      setStatus(wasEverOnlineRef.current ? "offline" : "connecting");
    });

    socket.on("status_change", (data: { status: string }) => {
      setStatus(data.status === "online" ? "online" : "offline");
    });

    socket.on("stats_update", (data: DetectorStats) => {
      setStats(data);
    });

    socket.on("new_detection", (entry: DetectorLogEntry) => {
      const withId: DetectorLogEntry = { ...entry, id: crypto.randomUUID() };
      setLog((prev) => [withId, ...prev].slice(0, 50));
    });

    socket.on("alert", (data: DetectorAlert) => {
      setActiveAlert(data);
      onAlertRef.current?.(data);
      // Clear any existing auto-dismiss timer before setting a new one
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
      alertTimerRef.current = setTimeout(() => setActiveAlert(null), 5000);
    });

    socket.on("alert_clear", () => {
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
      setActiveAlert(null);
    });

    return () => {
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
      socket.disconnect();
    };
  }, []);

  const clearLog = useCallback(() => {
    setLog([]);
  }, []);

  const dismissAlert = useCallback(() => {
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    setActiveAlert(null);
  }, []);

  return { status, stats, log, activeAlert, clearLog, dismissAlert };
}
