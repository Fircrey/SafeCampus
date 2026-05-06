"use client";

import { useMemo, type KeyboardEvent } from "react";
import type { ZoneFeature, Coordinate } from "@/lib/zone-types";

const VIEWBOX_WIDTH = 1000;
const VIEWBOX_HEIGHT = 720;
const VIEWBOX_PADDING = 54;

function getCoordinates(geometry: ZoneFeature["geometry"]): Coordinate[] {
  return geometry.coordinates.flat();
}

function getFeatureCenter(feature: ZoneFeature): Coordinate | null {
  if (feature.properties.center) return feature.properties.center;
  const coords = getCoordinates(feature.geometry);
  if (coords.length === 0) return null;
  const total = coords.reduce(
    (sum, c) => { sum.lon += c[0]; sum.lat += c[1]; return sum; },
    { lon: 0, lat: 0 }
  );
  return [total.lon / coords.length, total.lat / coords.length];
}

function createProjection(features: ZoneFeature[]) {
  const coords = features.flatMap((f) => getCoordinates(f.geometry));
  if (coords.length === 0) {
    return {
      width: VIEWBOX_WIDTH,
      height: VIEWBOX_HEIGHT,
      project: ([lon, lat]: Coordinate): Coordinate => [lon, lat],
    };
  }

  const lons = coords.map(([lon]) => lon);
  const lats = coords.map(([, lat]) => lat);
  const meanLat = lats.reduce((s, l) => s + l, 0) / lats.length;
  const lonScale = Math.cos((meanLat * Math.PI) / 180);

  const normalized = coords.map(([lon, lat]) => [lon * lonScale, lat]);
  const xs = normalized.map(([x]) => x);
  const ys = normalized.map(([, y]) => y);
  const bounds = {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };

  const spanX = Math.max(bounds.maxX - bounds.minX, 0.0001);
  const spanY = Math.max(bounds.maxY - bounds.minY, 0.0001);
  const scale = Math.min(
    (VIEWBOX_WIDTH - VIEWBOX_PADDING * 2) / spanX,
    (VIEWBOX_HEIGHT - VIEWBOX_PADDING * 2) / spanY
  );
  const drawnW = spanX * scale;
  const drawnH = spanY * scale;
  const offX = (VIEWBOX_WIDTH - drawnW) / 2;
  const offY = (VIEWBOX_HEIGHT - drawnH) / 2;

  return {
    width: VIEWBOX_WIDTH,
    height: VIEWBOX_HEIGHT,
    project: ([lon, lat]: Coordinate): Coordinate => {
      const x = (lon * lonScale - bounds.minX) * scale + offX;
      const y = VIEWBOX_HEIGHT - ((lat - bounds.minY) * scale + offY);
      return [x, y];
    },
  };
}

function ringToPath(ring: Coordinate[], project: (c: Coordinate) => Coordinate) {
  return ring
    .map((c, i) => {
      const [x, y] = project(c);
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ") + " Z";
}

function geometryToPath(geometry: ZoneFeature["geometry"], project: (c: Coordinate) => Coordinate) {
  return geometry.coordinates.map((ring) => ringToPath(ring, project)).join(" ");
}

function getProjectedBounds(feature: ZoneFeature, project: (c: Coordinate) => Coordinate) {
  const points = getCoordinates(feature.geometry).map(project);
  if (points.length === 0) return { width: 0, height: 0 };
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  return { width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) };
}

function getLabelSize(feature: ZoneFeature, project: (c: Coordinate) => Coordinate) {
  const label = feature.properties.ref ?? feature.properties.name;
  const bounds = getProjectedBounds(feature, project);
  if (Math.max(bounds.width, bounds.height) < 10) return 12;
  const wSize = bounds.width / Math.max(label.length * 0.62, 1);
  const hSize = bounds.height * 0.42;
  return Math.max(8, Math.min(16, wSize, hSize));
}

function isPointLike(feature: ZoneFeature, project: (c: Coordinate) => Coordinate) {
  const bounds = getProjectedBounds(feature, project);
  return Math.max(bounds.width, bounds.height) < 10;
}

interface MapSVGProps {
  features: ZoneFeature[];
  selectedZoneId: string | null;
  reportCounts: Map<string, number>;
  onSelectZone: (zoneId: string) => void;
}

export function MapSVG({ features, selectedZoneId, reportCounts, onSelectZone }: MapSVGProps) {
  const projection = useMemo(() => createProjection(features), [features]);

  function handleKeyDown(e: KeyboardEvent<SVGElement>, zoneId: string) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelectZone(zoneId);
    }
  }

  return (
    <svg
      className="w-full h-full"
      role="img"
      aria-label="Mapa vectorial de modulos del campus Utadeo"
      viewBox={`0 0 ${projection.width} ${projection.height}`}
    >
      {/* Zone polygons */}
      <g>
        {features.map((feature) => {
          const zoneId = feature.properties.id;
          const isSelected = selectedZoneId === zoneId;
          const hasReports = (reportCounts.get(zoneId) ?? 0) > 0;
          const center = getFeatureCenter(feature);
          const pointLike = isPointLike(feature, projection.project);

          const fill = isSelected
            ? "#003366"
            : hasReports
            ? "#f59e0b"
            : "#e2e8f0";
          const stroke = isSelected ? "#fbbf24" : "#94a3b8";
          const opacity = isSelected ? 0.9 : 0.7;

          if (pointLike && center) {
            const [x, y] = projection.project(center);
            return (
              <circle
                key={zoneId}
                aria-label={feature.properties.name}
                cx={x}
                cy={y}
                r={15}
                fill={fill}
                stroke={stroke}
                strokeWidth={isSelected ? 3 : 1.5}
                opacity={opacity}
                className="cursor-pointer transition-all duration-200 hover:opacity-100"
                role="button"
                tabIndex={0}
                onClick={() => onSelectZone(zoneId)}
                onKeyDown={(e) => handleKeyDown(e, zoneId)}
              >
                <title>{feature.properties.name}</title>
              </circle>
            );
          }

          return (
            <path
              key={zoneId}
              aria-label={feature.properties.name}
              d={geometryToPath(feature.geometry, projection.project)}
              fill={fill}
              stroke={stroke}
              strokeWidth={isSelected ? 3 : 1.5}
              opacity={opacity}
              className="cursor-pointer transition-all duration-200 hover:opacity-100"
              role="button"
              tabIndex={0}
              onClick={() => onSelectZone(zoneId)}
              onKeyDown={(e) => handleKeyDown(e, zoneId)}
            >
              <title>{feature.properties.name}</title>
            </path>
          );
        })}
      </g>

      {/* Zone labels */}
      <g>
        {features.map((feature) => {
          const center = getFeatureCenter(feature);
          if (!center) return null;
          const [x, y] = projection.project(center);
          const labelSize = getLabelSize(feature, projection.project);
          const isSelected = selectedZoneId === feature.properties.id;

          return (
            <text
              key={`${feature.properties.id}-label`}
              x={x}
              y={y}
              dy="0.35em"
              textAnchor="middle"
              fontSize={labelSize}
              fontWeight="bold"
              fill={isSelected ? "#ffffff" : "#1e293b"}
              stroke={isSelected ? "#003366" : "#ffffff"}
              strokeWidth={Math.max(2.3, labelSize * 0.24)}
              paintOrder="stroke"
              pointerEvents="none"
            >
              {feature.properties.ref ?? feature.properties.name}
            </text>
          );
        })}
      </g>

      {/* Report count badges */}
      <g>
        {features.map((feature) => {
          const count = reportCounts.get(feature.properties.id) ?? 0;
          const center = getFeatureCenter(feature);
          if (count === 0 || !center) return null;
          const [x, y] = projection.project(center);
          const r = Math.min(12, 6 + count);

          return (
            <g key={`${feature.properties.id}-pin`}>
              <circle
                cx={x + 16}
                cy={y - 18}
                r={r}
                fill="#ef4444"
                stroke="#ffffff"
                strokeWidth={2}
              />
              <text
                x={x + 16}
                y={y - 18}
                dy="0.35em"
                textAnchor="middle"
                fontSize={9}
                fontWeight="bold"
                fill="#ffffff"
                pointerEvents="none"
              >
                {count}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
