"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { FLASK_URL } from "@/lib/constants";
import { useAuth } from "@/components/auth/AuthContext";
import type {
  DetectionBox,
  DetectionResult,
  DetectorAlert,
  DetectorLogEntry,
  DetectorStats,
  DetectorStatus
} from "@/lib/types";

const DEFAULT_STATS: DetectorStats = {
  total_detections: 0,
  guns: 0,
  knives: 0,
  explosives: 0,
  average_confidence: 0
};

interface UseDetectorSocketOptions {
  onAlert?: (alert: DetectorAlert) => void;
}

export function useDetectorSocket({ onAlert }: UseDetectorSocketOptions = {}) {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const alertTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onAlertRef = useRef(onAlert);
  const wasEverOnlineRef = useRef(false);

  // Browser streaming refs
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingAckRef = useRef(false);
  const frameIdRef = useRef(0);
  const streamingRef = useRef(false);

  const [status, setStatus] = useState<DetectorStatus>("connecting");
  const [stats, setStats] = useState<DetectorStats>(DEFAULT_STATS);
  const [log, setLog] = useState<DetectorLogEntry[]>([]);
  const [activeAlert, setActiveAlert] = useState<DetectorAlert | null>(null);
  const [detectionBoxes, setDetectionBoxes] = useState<DetectionBox[]>([]);
  const [inferenceMs, setInferenceMs] = useState(0);

  // Keep onAlertRef in sync without re-running the main effect
  useEffect(() => {
    onAlertRef.current = onAlert;
  }, [onAlert]);

  useEffect(() => {
    const socket = io(FLASK_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      query: { token: token || "" },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      wasEverOnlineRef.current = true;
      setStatus("online");
      // Re-emit browser_start on reconnect if was streaming
      if (streamingRef.current) {
        socket.emit("browser_start");
      }
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

    socket.on("alert", (data: DetectorAlert) => {
      setActiveAlert(data);
      onAlertRef.current?.(data);
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
      alertTimerRef.current = setTimeout(() => setActiveAlert(null), 8000);
    });

    socket.on("new_detection", (entry: DetectorLogEntry) => {
      const withId: DetectorLogEntry = { ...entry, id: crypto.randomUUID() };
      setLog((prev) => [withId, ...prev].slice(0, 50));
      if (alertTimerRef.current) {
        clearTimeout(alertTimerRef.current);
        alertTimerRef.current = setTimeout(() => setActiveAlert(null), 8000);
      }
    });

    socket.on("alert_clear", () => {
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
      alertTimerRef.current = null;
      setActiveAlert(null);
    });

    socket.on("detection_result", (data: DetectionResult) => {
      setDetectionBoxes(data.detections);
      setInferenceMs(data.inference_ms);
      pendingAckRef.current = false;
    });

    return () => {
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
      socket.disconnect();
    };
  }, [token]);

  const startBrowserStream = useCallback((video: HTMLVideoElement, fps = 8) => {
    const socket = socketRef.current;
    if (!socket?.connected) return;

    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    streamingRef.current = true;
    pendingAckRef.current = false;
    frameIdRef.current = 0;

    socket.emit("browser_start");

    const interval = 1000 / fps;
    intervalRef.current = setInterval(() => {
      if (pendingAckRef.current) return;
      if (video.readyState < video.HAVE_CURRENT_DATA) return;

      ctx.drawImage(video, 0, 0, 640, 480);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      const frameId = ++frameIdRef.current;

      pendingAckRef.current = true;
      socket.emit("browser_frame", { frame: dataUrl, frame_id: frameId });
    }, interval);
  }, []);

  const stopBrowserStream = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    streamingRef.current = false;
    pendingAckRef.current = false;
    setDetectionBoxes([]);
    setInferenceMs(0);

    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit("browser_stop");
    }
  }, []);

  const clearLog = useCallback(() => {
    setLog([]);
  }, []);

  const dismissAlert = useCallback(() => {
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    setActiveAlert(null);
  }, []);

  return {
    status, stats, log, activeAlert, clearLog, dismissAlert,
    detectionBoxes, inferenceMs, startBrowserStream, stopBrowserStream,
  };
}
