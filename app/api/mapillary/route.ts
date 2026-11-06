import { NextRequest, NextResponse } from "next/server";
import {
  mapillaryBbox,
  mapillaryPlaceUrl,
  selectNearestImage,
  type MapillaryLookup,
} from "@/lib/mapillary";

export const runtime = "nodejs";
export const maxDuration = 10;

const MAPILLARY_IMAGES_ENDPOINT = "https://graph.mapillary.com/images";
const FIELDS = [
  "id",
  "captured_at",
  "compass_angle",
  "thumb_256_url",
  "thumb_1024_url",
  "is_pano",
  "geometry",
  "computed_geometry",
].join(",");

const CACHE_TTL_MS = 5 * 60_000;
const ERROR_CACHE_TTL_MS = 45_000;
const MAX_CACHE_ENTRIES = 400;
const UPSTREAM_TIMEOUT_MS = 5_000;

interface CacheEntry {
  expiresAt: number;
  payload: MapillaryLookup;
}

const cache = new Map<string, CacheEntry>();

function readCache(key: string): MapillaryLookup | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.payload;
}

function writeCache(key: string, payload: MapillaryLookup): void {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, {
    expiresAt:
      Date.now() +
      (payload.status === "unavailable" ? ERROR_CACHE_TTL_MS : CACHE_TTL_MS),
    payload,
  });
}

function json(
  payload: MapillaryLookup,
  status = 200,
): NextResponse<MapillaryLookup> {
  return NextResponse.json(payload, {
    status,
    headers: { "Cache-Control": "private, max-age=60" },
  });
}

/**
 * Nearest street-level image for an asset. The Mapillary token stays on the
 * server; without it this endpoint degrades to the public deep link, which is
 * still useful and never breaks the map.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const latParam = request.nextUrl.searchParams.get("lat");
  const lonParam = request.nextUrl.searchParams.get("lon");

  const lat = latParam === null ? Number.NaN : Number(latParam);
  const lon = lonParam === null ? Number.NaN : Number(lonParam);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    return NextResponse.json(
      { error: "Valid lat and lon are required", code: "INVALID_COORDINATES" },
      { status: 400 },
    );
  }

  const fallbackUrl = mapillaryPlaceUrl(lat, lon);
  const token = process.env.MAPILLARY_TOKEN?.trim();

  if (!token) {
    return json({
      configured: false,
      status: "not_configured",
      image: null,
      fallbackUrl,
    });
  }

  const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
  const cached = readCache(cacheKey);
  if (cached) return json(cached);

  const bbox = mapillaryBbox(lat, lon);
  const url = new URL(MAPILLARY_IMAGES_ENDPOINT);
  url.searchParams.set("fields", FIELDS);
  url.searchParams.set("bbox", bbox.map((value) => value.toFixed(6)).join(","));
  url.searchParams.set("limit", "25");

  let payload: MapillaryLookup;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `OAuth ${token}`,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      cache: "no-store",
    });

    if (!response.ok) {
      console.warn(`Mapillary request failed with HTTP ${response.status}`);
      payload = {
        configured: true,
        status: "unavailable",
        image: null,
        fallbackUrl,
      };
    } else {
      const body = (await response.json()) as { data?: unknown };
      const image = selectNearestImage(body.data, lat, lon);
      payload = {
        configured: true,
        status: image ? "ok" : "empty",
        image,
        fallbackUrl,
      };
    }
  } catch (error) {
    console.warn(
      "Mapillary request failed:",
      error instanceof Error ? error.message : "unknown error",
    );
    payload = {
      configured: true,
      status: "unavailable",
      image: null,
      fallbackUrl,
    };
  }

  writeCache(cacheKey, payload);
  return json(payload);
}
