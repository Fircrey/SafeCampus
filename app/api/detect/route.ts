import { NextResponse } from "next/server";

export const runtime = "nodejs";

function demoDetections() {
  return [
    {
      class: "Knife",
      confidence: 0.82,
      x: 420,
      y: 210,
      width: 128,
      height: 92
    },
    {
      class: "Handgun",
      confidence: 0.67,
      x: 210,
      y: 320,
      width: 110,
      height: 78
    }
  ];
}

export async function POST(request: Request) {
  const { image } = (await request.json()) as { image?: string };

  if (!image) {
    return NextResponse.json({ error: "Falta la imagen." }, { status: 400 });
  }

  const apiKey = process.env.ROBOFLOW_API_KEY;
  const modelId = process.env.ROBOFLOW_MODEL_ID || "weapon-detection-using-yolov8/1";

  if (!apiKey) {
    return NextResponse.json({
      mode: "demo",
      modelId,
      detections: demoDetections(),
      note: "Configura ROBOFLOW_API_KEY para inferencia real."
    });
  }

  const base64 = image.replace(/^data:image\/\w+;base64,/, "");
  const response = await fetch(
    `https://detect.roboflow.com/${modelId}?api_key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: base64
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    return NextResponse.json(
      { error: "Roboflow no respondió correctamente.", detail },
      { status: 502 }
    );
  }

  const data = await response.json();
  const detections = (data.predictions || []).map((prediction: any) => ({
    class: prediction.class,
    confidence: prediction.confidence,
    x: prediction.x,
    y: prediction.y,
    width: prediction.width,
    height: prediction.height
  }));

  return NextResponse.json({
    mode: "roboflow",
    modelId,
    detections
  });
}
