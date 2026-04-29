export type ChatMessage = {
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
