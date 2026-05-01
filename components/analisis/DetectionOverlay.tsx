import type { Detection } from "@/lib/types";

interface DetectionOverlayProps {
  detections: Detection[];
  imageSize: { width: number; height: number };
}

export function DetectionOverlay({ detections, imageSize }: DetectionOverlayProps) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {detections.map((item, index) => {
        const left = ((item.x - item.width / 2) / imageSize.width) * 100;
        const top = ((item.y - item.height / 2) / imageSize.height) * 100;
        const width = (item.width / imageSize.width) * 100;
        const height = (item.height / imageSize.height) * 100;

        return (
          <div
            key={`${item.class}-box-${index}`}
            className="absolute border-2 border-tadeo-yellow"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${width}%`,
              height: `${height}%`
            }}
          >
            <span className="absolute -top-7 left-0 bg-tadeo-yellow px-2 py-1 text-xs font-black text-tadeo-blue">
              {item.class} {Math.round(item.confidence * 100)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
