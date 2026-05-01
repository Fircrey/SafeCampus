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
