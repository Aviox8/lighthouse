import { GeoResult } from './types';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'Lighthouse/1.0 (+https://github.com/Aviox8/lighthouse)';
const NOMINATIM_API = '/api/nominatim'; // Client-side proxy
const TIMEOUT_MS = 7000;

// Optional keyed geocoding instance (overpass.ch, Nominatim compatible).
const OVERPASS_CH_BASE = 'https://api.overpass.ch/v1';

function getKeyedNominatimBase(): string | null {
  const key = process.env.OVERPASS_CH_KEY?.trim();
  return key ? `${OVERPASS_CH_BASE}/${encodeURIComponent(key)}/nominatim` : null;
}

// Detect if running on server or client
const isServer = typeof window === 'undefined';

// Server-side rate limiter for Nominatim (1 request per second).
// Queue callers so concurrent requests cannot bypass the interval.
let lastNominatimRequest = 0;
let nominatimQueue: Promise<void> = Promise.resolve();
const NOMINATIM_MIN_INTERVAL = 1000;

async function waitForRateLimit(): Promise<void> {
  if (!isServer) return;

  const run = nominatimQueue.then(async () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastNominatimRequest;

    if (timeSinceLastRequest < NOMINATIM_MIN_INTERVAL) {
      const waitTime = NOMINATIM_MIN_INTERVAL - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    lastNominatimRequest = Date.now();
  });

  nominatimQueue = run.catch(() => undefined);
  await run;
}

interface NominatimResponse {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state_district?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
  boundingbox: [string, string, string, string];
  importance: number;
  place_rank?: number;
  type: string;
  class: string;
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number,
  externalSignal?: AbortSignal,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  const abortFromExternal = () => controller.abort();

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener('abort', abortFromExternal, { once: true });
    }
  }

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeoutId);
    externalSignal?.removeEventListener('abort', abortFromExternal);
  }
}

async function readNominatimJson(response: Response): Promise<NominatimResponse[]> {
  const data = await response.json();
  return Array.isArray(data) ? (data as NominatimResponse[]) : [];
}

/**
 * Search Nominatim. On the server the keyed overpass.ch instance is preferred
 * (it allows 300 requests/min, so no 1 req/s throttle), with the public
 * Nominatim kept as a fallback. In the browser this goes through the proxy.
 */
async function nominatimSearch(
  params: URLSearchParams,
  signal?: AbortSignal,
): Promise<NominatimResponse[]> {
  if (!isServer) {
    const proxyParams = new URLSearchParams(params);
    proxyParams.set('endpoint', 'search');
    const response = await fetchWithTimeout(
      `${NOMINATIM_API}?${proxyParams}`,
      { headers: { 'Accept': 'application/json' } },
      TIMEOUT_MS,
      signal,
    );
    if (!response.ok) {
      throw new Error(`Nominatim request failed: ${response.status}`);
    }
    return readNominatimJson(response);
  }

  const keyedBase = getKeyedNominatimBase();
  if (keyedBase) {
    try {
      const response = await fetchWithTimeout(
        `${keyedBase}/search?${params}`,
        { headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' } },
        TIMEOUT_MS,
        signal,
      );
      if (response.ok) {
        const data = await readNominatimJson(response);
        // The search route needs bounding boxes and OSM ids.
        if (data.length > 0 && data.every((item) => item.boundingbox && item.lat && item.lon)) {
          return data;
        }
        console.warn('overpass.ch geocoding returned no usable results; falling back to public Nominatim');
      } else {
        console.warn(`overpass.ch geocoding failed (${response.status}); falling back to public Nominatim`);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') throw error;
      console.warn('overpass.ch geocoding failed; falling back to public Nominatim');
    }
  }

  // Public Nominatim allows 1 request per second; serialize to respect it.
  await waitForRateLimit();
  const response = await fetchWithTimeout(
    `${NOMINATIM_BASE}/search?${params}`,
    { headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' } },
    TIMEOUT_MS,
    signal,
  );

  if (!response.ok) {
    throw new Error(`Nominatim request failed: ${response.status}`);
  }

  return readNominatimJson(response);
}

export async function geocode(query: string, countryCode?: string): Promise<GeoResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    addressdetails: '1',
    limit: '5'
  });

  if (countryCode) {
    params.set('countrycodes', countryCode);
  }

  const data = await nominatimSearch(params);

  return data.map((item) => ({
    displayName: item.display_name,
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    boundingBox: [
      parseFloat(item.boundingbox[0]),
      parseFloat(item.boundingbox[1]),
      parseFloat(item.boundingbox[2]),
      parseFloat(item.boundingbox[3])
    ] as [number, number, number, number],
    type: item.type,
    importance: item.importance,
    placeRank: item.place_rank,
    osmType: item.osm_type,
    osmId: item.osm_id,
    addressComponents: {
      country: item.address?.country,
      state: item.address?.state,
      city: item.address?.city || item.address?.town || item.address?.village
    }
  }));
}

export async function getPlaceSuggestions(
  query: string,
  limit: number = 5,
  signal?: AbortSignal,
): Promise<Array<{ name: string; displayName: string }>> {
  if (!query || query.trim().length < 3) {
    return [];
  }

  const params = new URLSearchParams({
    q: query.trim(),
    format: 'json',
    addressdetails: '1',
    limit: limit.toString()
  });

  try {
    const data = await nominatimSearch(params, signal);

    return data.map((item) => {
      // Extract the most meaningful place name components
      const addressParts = [];
      
      // Primary location (most specific)
      if (item.address?.city) {
        addressParts.push(item.address.city);
      } else if (item.address?.town) {
        addressParts.push(item.address.town);
      } else if (item.address?.village) {
        addressParts.push(item.address.village);
      } else if (item.address?.county) {
        addressParts.push(item.address.county);
      } else if (item.address?.state_district) {
        addressParts.push(item.address.state_district);
      }
      
      // Secondary location (region)
      if (item.address?.state && item.address.state !== addressParts[0]) {
        addressParts.push(item.address.state);
      }
      
      // Country (only if we have at least one other part)
      if (item.address?.country && addressParts.length > 0) {
        addressParts.push(item.address.country);
      }
      
      // Build the short name, with validation
      let shortName = addressParts.join(', ');
      
      // If the extracted name is too short or empty, use a cleaned version of display_name
      if (!shortName || shortName.length < 3) {
        // Take first 3 parts of display_name (usually city, state, country)
        const displayParts = item.display_name.split(',').map(p => p.trim()).filter(p => p.length > 0);
        shortName = displayParts.slice(0, 3).join(', ');
      }
      
      return {
        name: shortName,
        displayName: item.display_name
      };
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return [];
    }
    console.warn('Place suggestion fetch failed:', error);
    return [];
  }
}

// Place types that make a usable search scope. Kept broad so cities, regions,
// islands and country-level results all qualify.
const AREA_TYPES = new Set([
  'country', 'state', 'state_district', 'region', 'province', 'county',
  'district', 'municipality', 'city', 'town', 'village', 'hamlet',
  'borough', 'suburb', 'locality', 'place', 'island', 'islet',
  'archipelago', 'administrative',
]);

export async function resolveLocation(
  query: string,
  preferredCountry?: string
): Promise<GeoResult | null> {
  const results = await geocode(query, preferredCountry);
  
  if (results.length === 0) {
    return null;
  }

  // Rank the way Nominatim does: lower place_rank (country before town) wins,
  // then higher importance, then the order the geocoder returned. Without this,
  // "malta" resolved to the village of Malta, New York instead of the country.
  const ranked = [...results].sort((a, b) => {
    const rankA = a.placeRank ?? 30;
    const rankB = b.placeRank ?? 30;
    if (rankA !== rankB) return rankA - rankB;
    return b.importance - a.importance;
  });

  return ranked.find((result) => AREA_TYPES.has(result.type)) ?? ranked[0];
}

export function calculateBoundingBox(
  lat: number,
  lon: number,
  radiusKm: number
): [number, number, number, number] {
  const latDelta = radiusKm / 111.0;
  const lonDelta = radiusKm / (111.0 * Math.cos(lat * Math.PI / 180));

  return [
    lat - latDelta,
    lat + latDelta,
    lon - lonDelta,
    lon + lonDelta
  ];
}

/**
 * Convert OSM ID to Overpass area ID
 * For relations: area_id = osm_id + 3600000000
 * For ways: area_id = osm_id + 2400000000
 * For administrative boundaries, we primarily use relations
 */
export function osmIdToAreaId(osmType: string, osmId: number): number | null {
  if (osmType === 'relation') {
    return osmId + 3600000000;
  } else if (osmType === 'way') {
    return osmId + 2400000000;
  }
  // Nodes cannot be converted to areas
  return null;
}
