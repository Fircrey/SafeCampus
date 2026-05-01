"use client";

import { Camera } from "lucide-react";
import { useState } from "react";
import type { Detection } from "@/lib/types";
import { DetectionOverlay } from "./DetectionOverlay";
import { DetectionResults } from "./DetectionResults";
import { ImageUploader } from "./ImageUploader";

export function AnalisisPage() {
  const [image, setImage] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [detectMode, setDetectMode] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 1, height: 1 });

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setDetections([]);
      setDetectMode("");
    };
    reader.readAsDataURL(file);
  }

  async function runDetection() {
    if (!image) return;
    setLoading(true);
    try {
      const res = await fetch("/api/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image })
      });
      const data = await res.json();
      setDetections(data.detections ?? []);
      setDetectMode(data.mode ?? "");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      <div className="border-b border-slate-200 bg-white px-6 py-5">
        <p className="text-xs font-bold uppercase tracking-widest text-tadeo-blue">
          Demo Roboflow
        </p>
        <h1 className="text-2xl font-black text-tadeo-ink">Análisis de Imagen</h1>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
          {/* Left: image area */}
          <div className="space-y-4">
            <ImageUploader onFile={handleFile} />

            <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden border border-slate-200 bg-slate-100">
              {image ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt="Imagen para detección"
                    className="max-h-[520px] w-full object-contain"
                    onLoad={(e) =>
                      setImageSize({
                        width: e.currentTarget.naturalWidth,
                        height: e.currentTarget.naturalHeight
                      })
                    }
                  />
                  <DetectionOverlay detections={detections} imageSize={imageSize} />
                </>
              ) : (
                <div className="px-6 text-center">
                  <Camera className="mx-auto mb-3 h-12 w-12 text-tadeo-blue" />
                  <p className="font-bold text-tadeo-ink">
                    Sube una imagen para probar el detector.
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Sin API key de Roboflow se muestra una respuesta simulada para el flujo de demo.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right: results */}
          <DetectionResults
            detections={detections}
            detectMode={detectMode}
            loading={loading}
            canAnalyze={!!image}
            onAnalyze={runDetection}
          />
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Validación humana requerida · IA alerta, personas deciden
        </p>
      </div>
    </main>
  );
}
