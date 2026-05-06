export type Coordinate = [number, number];

export type ZoneFeature = {
  type: "Feature";
  id: string;
  properties: {
    id: string;
    osmType: string;
    osmId: number;
    name: string;
    ref: string | null;
    category: string;
    center: Coordinate | null;
    [key: string]: unknown;
  };
  geometry: {
    type: "Polygon";
    coordinates: Coordinate[][];
  };
};

export type ZoneCollection = {
  type: "FeatureCollection";
  features: ZoneFeature[];
};

export type ZoneReportPayload = {
  zone_id: string;
  zone_name: string;
  report_type: string;
  priority: "alta" | "media" | "baja";
  title: string;
  description: string;
};

export type ZoneCount = {
  zone_id: string;
  zone_name: string;
  count: number;
};
