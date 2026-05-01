import {
  FLASK_API_CLEAR,
  FLASK_API_HISTORY,
  FLASK_API_START,
  FLASK_API_STATS,
  FLASK_API_STOP
} from "./constants";
import type { DetectorLogEntry, DetectorStats } from "./types";

async function post(url: string): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) return { success: false, message: `HTTP ${res.status}` };
  return res.json() as Promise<{ success: boolean; message?: string }>;
}

export async function startDetection() {
  return post(FLASK_API_START);
}

export async function stopDetection() {
  return post(FLASK_API_STOP);
}

export async function getStats(): Promise<DetectorStats> {
  const res = await fetch(FLASK_API_STATS);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<DetectorStats>;
}

export async function getHistory(): Promise<DetectorLogEntry[]> {
  const res = await fetch(FLASK_API_HISTORY);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<DetectorLogEntry[]>;
}

export async function clearHistory() {
  return post(FLASK_API_CLEAR);
}
