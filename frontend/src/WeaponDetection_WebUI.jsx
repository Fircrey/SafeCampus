import React, { useState, useRef, useEffect } from "react";

export default function WeaponDetectionWebUI() {
  const [restUrl, setRestUrl] = useState("http://127.0.0.1:8000/api/detect");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [detections, setDetections] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Iniciar cámara
  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
  };

  // Capturar frame actual
  const captureFrame = async () => {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg");
    setPreview(dataUrl);

    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], "frame.jpg", { type: "image/jpeg" });
    setImage(file);
  };

  // Enviar imagen al backend
  const detectWeapons = async () => {
    if (!image) return alert("Captura una imagen o activa la cámara.");
    const formData = new FormData();
    formData.append("file", image);

    const res = await fetch(restUrl, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setDetections(data.detections);
    drawDetections(data.detections);
  };

  // Dibujar resultados
  const drawDetections = (detections) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.src = preview;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      ctx.lineWidth = 3;
      ctx.font = "20px Arial";
      detections.forEach((det) => {
        const [x, y, w, h] = det.box;
        ctx.strokeStyle = det.label === "knife" ? "red" : "lime";
        ctx.strokeRect(x, y, w, h);
        ctx.fillStyle = "white";
        ctx.fillText(`${det.label} (${(det.confidence * 100).toFixed(1)}%)`, x, y > 20 ? y - 5 : y + 20);
      });
    };
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-4">🎯 Detector de Armas - YOLOv8</h1>
      <div className="flex flex-col items-center gap-4">
        <video ref={videoRef} autoPlay className="border-4 border-green-500 rounded-lg w-[640px] h-[480px]" />
        <canvas ref={canvasRef} className="border-4 border-blue-500 rounded-lg w-[640px] h-[480px]" />
        <div className="flex gap-2">
          <button onClick={startCamera} className="bg-green-600 px-4 py-2 rounded hover:bg-green-700">Activar Cámara</button>
          <button onClick={captureFrame} className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">Capturar</button>
          <button onClick={detectWeapons} className="bg-red-600 px-4 py-2 rounded hover:bg-red-700">Detectar</button>
        </div>
      </div>
      <div className="mt-6">
        <h2 className="text-xl font-semibold">📋 Detecciones:</h2>
        {detections.length === 0 ? (
          <p>Sin detecciones aún.</p>
        ) : (
          <ul>
            {detections.map((d, i) => (
              <li key={i}>
                {d.label} — {(d.confidence * 100).toFixed(2)}%
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
