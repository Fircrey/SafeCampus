import {
  FLASK_API_CLEAR,
  FLASK_API_HISTORY,
  FLASK_API_START,
  FLASK_API_STATS,
  FLASK_API_STOP,
  FLASK_API_AUTH_LOGIN,
  FLASK_API_AUTH_REGISTER,
  FLASK_API_AUTH_ME,
  FLASK_API_REPORTS,
  FLASK_API_ADMIN_USERS
} from "./constants";
import type { DetectorLogEntry, DetectorStats, User, Report } from "./types";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function authHeaders(): HeadersInit {
  const token = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function authPost(url: string, body?: unknown): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) return { success: false, message: `HTTP ${res.status}` };
  return res.json() as Promise<{ success: boolean; message?: string }>;
}

// --- Detector ---

export async function startDetection() {
  return authPost(FLASK_API_START);
}

export async function stopDetection() {
  return authPost(FLASK_API_STOP);
}

export async function getStats(): Promise<DetectorStats> {
  const res = await fetch(FLASK_API_STATS, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<DetectorStats>;
}

export async function getHistory(): Promise<DetectorLogEntry[]> {
  const res = await fetch(FLASK_API_HISTORY, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<DetectorLogEntry[]>;
}

export async function clearHistory() {
  return authPost(FLASK_API_CLEAR);
}

// --- Auth ---

export async function loginUser(email: string, password: string): Promise<{ token: string; user: User }> {
  const res = await fetch(FLASK_API_AUTH_LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<{ token: string; user: User }>;
}

export async function registerUser(email: string, name: string, password: string): Promise<{ token: string; user: User }> {
  const res = await fetch(FLASK_API_AUTH_REGISTER, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<{ token: string; user: User }>;
}

export async function fetchMe(): Promise<User> {
  const res = await fetch(FLASK_API_AUTH_ME, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json() as { user: User };
  return data.user;
}

// --- Reports ---

export async function createReport(report: {
  type_description: string;
  location: string;
  immediate_risk: string;
  contact_preference: string;
  is_anonymous?: boolean;
}): Promise<Report> {
  const res = await fetch(FLASK_API_REPORTS, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(report),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json() as { report: Report };
  return data.report;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove "data:image/...;base64," prefix
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function createReportWithPhoto(
  report: {
    type_description: string;
    location: string;
    immediate_risk: string;
    contact_preference: string;
    is_anonymous?: boolean;
  },
  photo?: File | null
): Promise<Report> {
  if (!photo) return createReport(report);

  const photoBase64 = await fileToBase64(photo);

  const res = await fetch("/api/reports/upload", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      ...report,
      photo_base64: photoBase64,
      photo_name: photo.name,
    }),
  });
  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    console.error("[createReportWithPhoto] Error:", res.status, errorBody);
    throw new Error(`HTTP ${res.status}: ${errorBody}`);
  }
  const data = await res.json() as { report: Report };
  return data.report;
}

export function getReportPhotoUrl(reportId: number): string {
  const token = getToken();
  return `${FLASK_API_REPORTS}/${reportId}/photo${token ? `?token=${token}` : ""}`;
}

export async function fetchReports(): Promise<Report[]> {
  const res = await fetch(FLASK_API_REPORTS, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json() as { reports: Report[] };
  return data.reports;
}

export async function updateReport(id: number, update: { status?: string; notes?: string }): Promise<Report> {
  const res = await fetch(`${FLASK_API_REPORTS}/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(update),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json() as { report: Report };
  return data.report;
}

// --- Admin ---

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(FLASK_API_ADMIN_USERS, { headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json() as { users: User[] };
  return data.users;
}

export async function updateUser(id: number, update: { role?: string; is_active?: boolean }): Promise<User> {
  const res = await fetch(`${FLASK_API_ADMIN_USERS}/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(update),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json() as { user: User };
  return data.user;
}
