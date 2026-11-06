/**
 * Mapillary helpers shared by the imagery route and the map popup.
 *
 * Everything here is pure so it can run in tests and in the browser. The
 * access token is deliberately not handled in this module: only
 * app/api/mapillary/route.ts reads it, server-side.
 */

/** Radius of the Mapillary bbox query around an asset, in metres. */
export const MAPILLARY_SEARCH_RADIUS_M = 500;

/** Maximum distance for an image to count as "near" an asset. */
export const MAPILLARY_MAX_DISTANCE_M = 500;

export interface MapillaryImage {
  id: string;
  /** ISO 8601 capture time, or null when Mapillary did not return one. */
  capturedAt: string | null;
  compassAngle: number | null;
  /** 1024px thumbnail URL (signed, short-lived). */
  thumbUrl: string | null;
  /** 256px thumbnail URL (signed, short-lived). */
  previewUrl: string | null;
  isPano: boolean;
  lat: number;
  lon: number;
  /** Distance from the queried asset, in metres. */
  distanceMeters: number;
}

export type MapillaryStatus =
  | "ok"
  | "not_configured"
  | "empty"
  | "unavailable";

export interface MapillaryLookup {
  configured: boolean;
  status: MapillaryStatus;
  image: MapillaryImage | null;
  fallbackUrl: string;
}

/** Mapillary app deep link for a specific image. */
export function mapillaryImageUrl(imageId: string): string {
  return `https://www.mapillary.com/app/?pKey=${encodeURIComponent(imageId)}`;
}

/** Mapillary app deep link centred on a coordinate. */
export function mapillaryPlaceUrl(lat: number, lon: number): string {
  return `https://www.mapillary.com/app/?lat=${lat}&lng=${lon}&z=17`;
}

/**
 * Small bbox around a point, in Mapillary's `west,south,east,north` order.
 * Roughly 1 km across at the equator, comfortably under the API's 0.01
 * square-degree limit even near the poles.
 */
export function mapillaryBbox(
  lat: number,
  lon: number,
  radiusMeters: number = MAPILLARY_SEARCH_RADIUS_M,
): [number, number, number, number] {
  const latDelta = radiusMeters / 111_320;
  const cosLat = Math.cos((lat * Math.PI) / 180);
  const lonDelta =
    cosLat > 0.01 ? radiusMeters / (111_320 * cosLat) : radiusMeters / 1_113.2;

  return [
    Math.max(-180, lon - lonDelta),
    Math.max(-90, lat - latDelta),
    Math.min(180, lon + lonDelta),
    Math.min(90, lat + latDelta),
  ];
}

/** Great-circle distance between two WGS84 points, in metres. */
export function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const earthRadius = 6_371_000;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface MapillaryGeometry {
  type?: string;
  coordinates?: [number, number];
}

interface MapillaryApiImage {
  id?: string | number;
  captured_at?: number | string;
  compass_angle?: number;
  thumb_1024_url?: string;
  thumb_256_url?: string;
  is_pano?: boolean;
  geometry?: MapillaryGeometry;
  computed_geometry?: MapillaryGeometry;
}

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** Normalise one image from the Mapillary `data` array, or null if unusable. */
function normaliseImage(
  raw: MapillaryApiImage,
  lat: number,
  lon: number,
): MapillaryImage | null {
  const id = raw.id == null ? null : String(raw.id);
  const coordinates =
    raw.geometry?.coordinates ?? raw.computed_geometry?.coordinates;
  const thumbUrl = stringOrNull(raw.thumb_1024_url);
  const previewUrl = stringOrNull(raw.thumb_256_url);
  if (
    !id ||
    (!thumbUrl && !previewUrl) ||
    !Array.isArray(coordinates) ||
    coordinates.length !== 2
  ) {
    return null;
  }

  const [imageLon, imageLat] = coordinates;
  if (
    typeof imageLon !== "number" ||
    typeof imageLat !== "number" ||
    !Number.isFinite(imageLon) ||
    !Number.isFinite(imageLat)
  ) {
    return null;
  }

  let capturedAt: string | null = null;
  if (
    typeof raw.captured_at === "number" ||
    typeof raw.captured_at === "string"
  ) {
    const date = new Date(raw.captured_at);
    if (!Number.isNaN(date.getTime())) capturedAt = date.toISOString();
  }

  return {
    id,
    capturedAt,
    compassAngle: numberOrNull(raw.compass_angle),
    thumbUrl,
    previewUrl,
    isPano: raw.is_pano === true,
    lat: imageLat,
    lon: imageLon,
    distanceMeters: haversineMeters(lat, lon, imageLat, imageLon),
  };
}

/** Turn a Mapillary `/images` response into the nearest usable image. */
export function selectNearestImage(
  data: unknown,
  lat: number,
  lon: number,
  maxDistanceMeters: number = MAPILLARY_MAX_DISTANCE_M,
): MapillaryImage | null {
  if (!Array.isArray(data)) return null;

  let nearest: MapillaryImage | null = null;
  for (const entry of data) {
    if (!entry || typeof entry !== "object") continue;
    const image = normaliseImage(entry as MapillaryApiImage, lat, lon);
    if (!image || image.distanceMeters > maxDistanceMeters) continue;
    if (!nearest || image.distanceMeters < nearest.distanceMeters) {
      nearest = image;
    }
  }
  return nearest;
}
