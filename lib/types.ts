export type UserRole = "user" | "admin" | "superadmin";

export type User = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string | null;
};

export type ReportStatus = "open" | "reviewing" | "resolved" | "false_positive";

export type Report = {
  id: number;
  user_id: number | null;
  is_anonymous: boolean;
  type_description: string;
  location: string;
  immediate_risk: string;
  contact_preference: string;
  photo_filename: string | null;
  status: ReportStatus;
  notes: string | null;
  created_at: string | null;
  resolved_at: string | null;
  resolved_by: number | null;
  zone_id: string | null;
  zone_name: string | null;
  priority: string | null;
};

export type ChatMessage = {
  id?: string;
  role: "assistant" | "user";
  content: string;
};

export type Detection = {
  class: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

// --- Detector en vivo (Flask/YOLO) ---

export type DetectorStatus = "online" | "offline" | "connecting";

export type DetectorAlert = {
  type: "gun" | "knife";
  label: string;
  confidence: number;
  timestamp: string;
};

export type DetectorLogEntry = {
  id?: string;
  class: string;
  confidence: number;
  timestamp: string;
};

export type DetectorStats = {
  total_detections: number;
  guns: number;
  knives: number;
  average_confidence: number;
};
