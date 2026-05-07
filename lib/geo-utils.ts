import zonesGeoJson from "@/lib/data/utadeo-zones.json";
import type { ZoneCollection, ZoneFeature, Coordinate } from "@/lib/zone-types";

const zones = zonesGeoJson as unknown as ZoneCollection;

// Ray-casting algorithm to determine if a point is inside a polygon ring
export function pointInRing(point: Coordinate, ring: Coordinate[]): boolean {
  const [px, py] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

// Find the zone that contains the given coordinate (lon, lat)
export function findZoneByCoordinate(lon: number, lat: number): ZoneFeature | null {
  const point: Coordinate = [lon, lat];
  for (const feature of zones.features) {
    const ring = feature.geometry.coordinates[0];
    if (pointInRing(point, ring)) {
      return feature;
    }
  }
  return null;
}

// Haversine distance in meters between two points
function haversineMeters(lon1: number, lat1: number, lon2: number, lat2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Compute centroid of a polygon ring
function ringCentroid(ring: Coordinate[]): Coordinate {
  let sumLon = 0;
  let sumLat = 0;
  // Exclude last point (duplicate of first in closed rings)
  const n = ring.length > 1 ? ring.length - 1 : ring.length;
  for (let i = 0; i < n; i++) {
    sumLon += ring[i][0];
    sumLat += ring[i][1];
  }
  return [sumLon / n, sumLat / n];
}

// Find the nearest zone by haversine distance to centroids
export function findNearestZone(
  lon: number,
  lat: number
): { zone: ZoneFeature; distanceMeters: number } {
  let best: ZoneFeature = zones.features[0];
  let bestDist = Infinity;

  for (const feature of zones.features) {
    const centroid = feature.properties.center ?? ringCentroid(feature.geometry.coordinates[0]);
    const dist = haversineMeters(lon, lat, centroid[0], centroid[1]);
    if (dist < bestDist) {
      bestDist = dist;
      best = feature;
    }
  }

  return { zone: best, distanceMeters: bestDist };
}

export type ZoneDetectionResult = {
  zone: ZoneFeature;
  method: "exact" | "nearest";
  distanceMeters?: number;
};

// Detect zone: first try exact match, then fallback to nearest
export function detectZone(lon: number, lat: number): ZoneDetectionResult {
  const exact = findZoneByCoordinate(lon, lat);
  if (exact) {
    return { zone: exact, method: "exact" };
  }
  const { zone, distanceMeters } = findNearestZone(lon, lat);
  return { zone, method: "nearest", distanceMeters };
}

// Check if the point is within a reasonable margin of the campus (~500m)
const CAMPUS_CENTER: Coordinate = [-74.0677, 4.6073];
const CAMPUS_RADIUS_METERS = 500;

export function isNearCampus(lon: number, lat: number): boolean {
  const dist = haversineMeters(lon, lat, CAMPUS_CENTER[0], CAMPUS_CENTER[1]);
  return dist <= CAMPUS_RADIUS_METERS;
}

// Export all zones for the manual selector
export function getAllZones(): ZoneFeature[] {
  return zones.features;
}
