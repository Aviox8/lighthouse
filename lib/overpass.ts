import { Asset, ASSET_TYPE_MAP } from './types';

// Public mirrors, used on their own or as a fallback behind a keyed endpoint.
// They are often overloaded (HTTP 502 / timeouts), so they are not the first choice.
const PUBLIC_OVERPASS_APIS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
];

// Optional dedicated Overpass instance (overpass.ch). Set OVERPASS_CH_KEY on the
// server and it is tried first; the key stays server-side and is never logged.
const OVERPASS_CH_BASE = 'https://api.overpass.ch/v1';

interface OverpassEndpoint {
  url: string;
  label: string;
  /** Keyed instance: worth a short retry when it reports itself busy. */
  keyed?: boolean;
}

function getOverpassEndpoints(): OverpassEndpoint[] {
  const endpoints: OverpassEndpoint[] = PUBLIC_OVERPASS_APIS.map((url) => ({
    url,
    label: new URL(url).hostname,
  }));

  const key = process.env.OVERPASS_CH_KEY?.trim();
  if (key) {
    endpoints.unshift({
      url: `${OVERPASS_CH_BASE}/${encodeURIComponent(key)}/interpreter`,
      label: 'overpass.ch',
      keyed: true,
    });
  }

  return endpoints;
}

// Keep well under Vercel's 30s serverless cap, including Nominatim and JSON overhead.
const TIMEOUT_MS = 15000;
const OVERALL_BUDGET_MS = 22000;
const USER_AGENT = 'Lighthouse/1.0 (+https://github.com/Aviox8/lighthouse)';
const MAX_TAG_KEY_LENGTH = 128;
const MAX_TAG_VALUE_LENGTH = 256;

/** Cap tag sizes to keep serverless response payloads small; keys/values stay valid. */
function trimTags(tags: Record<string, string>): Record<string, string> {
  const trimmed: Record<string, string> = {};
  for (const [key, value] of Object.entries(tags)) {
    trimmed[key.slice(0, MAX_TAG_KEY_LENGTH)] = String(value).slice(0, MAX_TAG_VALUE_LENGTH);
  }
  return trimmed;
}
export const MAX_RESULTS = 5000;

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
  remark?: string;
}

export interface OverpassQueryResult {
  assets: Asset[];
  truncated: boolean;
  warning?: string;
}

function escapeOverpassString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function buildTagFilter(osmTags: Record<string, string | string[]>): string {
  const filters: string[] = [];
  
  for (const [key, value] of Object.entries(osmTags)) {
    if (Array.isArray(value)) {
      const regex = value.map(escapeOverpassString).join('|');
      filters.push(`["${escapeOverpassString(key)}"~"${regex}",i]`);
    } else {
      filters.push(
        `["${escapeOverpassString(key)}"="${escapeOverpassString(value)}"]`,
      );
    }
  }
  
  return filters.join('');
}

export function buildOverpassQuery(
  assetType: string,
  bbox: [number, number, number, number],
  operator?: string | null,
  areaId?: number | null
): string {
  const typeConfig = ASSET_TYPE_MAP[assetType];
  if (!typeConfig) {
    throw new Error(`Unknown asset type: ${assetType}`);
  }

  const bboxStr = `${bbox[0]},${bbox[2]},${bbox[1]},${bbox[3]}`;
  
  let operatorFilter = '';
  if (operator) {
    operatorFilter = `["operator"~"${escapeOverpassString(operator)}",i]`;
  }

  let locationFilter = '';
  if (areaId) {
    locationFilter = `(area:${areaId})`;
  } else {
    locationFilter = `(${bboxStr})`;
  }

  const osmTagsArray = Array.isArray(typeConfig.osmTags) ? typeConfig.osmTags : [typeConfig.osmTags];
  
  const unionParts: string[] = [];
  for (const osmTags of osmTagsArray) {
    const tagFilter = buildTagFilter(osmTags);
    unionParts.push(`  node${tagFilter}${operatorFilter}${locationFilter};`);
    unionParts.push(`  way${tagFilter}${operatorFilter}${locationFilter};`);
    unionParts.push(`  relation${tagFilter}${operatorFilter}${locationFilter};`);
  }

  const query = `
[out:json][timeout:12][maxsize:50000000];
(
${unionParts.join('\n')}
);
out center ${MAX_RESULTS};
`.trim();

  return query;
}

export function buildMultiTypeQuery(
  bbox: [number, number, number, number],
  operator: string,
  areaId?: number | null
): string {
  const bboxStr = `${bbox[0]},${bbox[2]},${bbox[1]},${bbox[3]}`;
  
  let locationFilter = '';
  if (areaId) {
    locationFilter = `(area:${areaId})`;
  } else {
    locationFilter = `(${bboxStr})`;
  }
  
  const query = `
[out:json][timeout:12][maxsize:50000000];
(
  node["operator"~"${escapeOverpassString(operator)}",i]${locationFilter};
  way["operator"~"${escapeOverpassString(operator)}",i]${locationFilter};
  relation["operator"~"${escapeOverpassString(operator)}",i]${locationFilter};
);
out center ${MAX_RESULTS};
`.trim();

  return query;
}

async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * The keyed free plan runs one query at a time, so a second search started
 * while the first is still running gets a 429 with Retry-After. Wait briefly
 * and retry once instead of dropping to the loaded public mirrors.
 */
async function fetchWithBusyRetry(
  endpoint: OverpassEndpoint,
  options: RequestInit,
  timeout: number,
  startedAt: number,
): Promise<Response> {
  const response = await fetchWithTimeout(endpoint.url, options, timeout);

  if (!endpoint.keyed || response.status !== 429) {
    return response;
  }

  const retryAfterSeconds = Number(response.headers?.get('retry-after')) || 1;
  const waitMs = Math.min(Math.max(retryAfterSeconds, 0.2) * 1000, 2000);
  const remainingMs = OVERALL_BUDGET_MS - (Date.now() - startedAt);

  if (remainingMs - waitMs < 3000) {
    return response;
  }

  await sleep(waitMs);

  return fetchWithTimeout(
    endpoint.url,
    options,
    Math.min(timeout, OVERALL_BUDGET_MS - (Date.now() - startedAt)),
  );
}

function getResultWarning(remark: string): string {
  const normalized = remark.toLowerCase();

  if (normalized.includes('timed out') || normalized.includes('timeout')) {
    return 'The Overpass query timed out; results may be incomplete.';
  }

  if (
    normalized.includes('out of memory') ||
    normalized.includes('maxsize') ||
    normalized.includes('runtime error')
  ) {
    return 'The Overpass query exceeded server limits; results may be incomplete.';
  }

  return 'Overpass returned a partial-response warning; results may be incomplete.';
}

export async function executeQuery(query: string): Promise<OverpassQueryResult> {
  let lastError: Error | null = null;
  const startedAt = Date.now();
  const endpoints = getOverpassEndpoints();

  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    const { label } = endpoint;
    const remainingMs = OVERALL_BUDGET_MS - (Date.now() - startedAt);
    if (remainingMs <= 1500) {
      break;
    }
    const attemptTimeout = Math.min(TIMEOUT_MS, remainingMs);

    try {
      const response = await fetchWithBusyRetry(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': USER_AGENT
        },
        body: `data=${encodeURIComponent(query)}`
      }, attemptTimeout, startedAt);

      if (!response.ok) {
        if (response.status === 429) {
          lastError = new Error(`Rate limited by ${label}`);
          if (i < endpoints.length - 1) {
            console.warn(`Rate limited by ${label}, trying next endpoint...`);
            continue;
          }
        } else {
          lastError = new Error(`API request failed with status ${response.status}`);
          if (response.status === 401 || response.status === 403) {
            console.warn(`${label} rejected the API key (${response.status}); check OVERPASS_CH_KEY`);
          }
          if (i < endpoints.length - 1) {
            console.warn(`${label} failed (${response.status}), trying next endpoint...`);
            continue;
          }
        }
        throw lastError;
      }

      const data: OverpassResponse = await response.json();

      if (!Array.isArray(data.elements)) {
        throw new Error('Overpass returned an invalid response');
      }

      if (data.elements.length === 0 && data.remark) {
        throw new Error(`Overpass returned no elements: ${data.remark}`);
      }
      
      if (i > 0) {
        console.log(`Successfully fetched data from fallback endpoint ${label}`);
      }

      const assets = data.elements
        .filter(el => {
          const lat = el.lat ?? el.center?.lat;
          const lon = el.lon ?? el.center?.lon;
          return lat !== undefined && lon !== undefined;
        })
        .map(el => {
          const lat = el.lat ?? el.center!.lat;
          const lon = el.lon ?? el.center!.lon;
          const tags = trimTags(el.tags || {});
          
          return {
            id: `${el.type}/${el.id}`,
            name: extractName(tags),
            type: extractType(tags),
            operator: tags.operator || null,
            lat,
            lon,
            tags
          };
        });

      return {
        assets,
        truncated: assets.length >= MAX_RESULTS || Boolean(data.remark),
        warning: data.remark ? getResultWarning(data.remark) : undefined,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (i < endpoints.length - 1) {
        console.warn(`${label} failed: ${lastError.message}, trying next endpoint...`);
        continue;
      }
      
      throw lastError;
    }
  }

  throw lastError || new Error('All Overpass API endpoints failed');
}

function extractName(tags: Record<string, string>): string {
  return tags.name || 
         tags['name:en'] || 
         tags.ref || 
         tags.description ||
         tags.operator ||
         'Unnamed';
}

function extractType(tags: Record<string, string>): string {
  if (tags['tower:type']) return `tower:${tags['tower:type']}`;
  if (tags.building === 'data_centre') return 'data_center';
  if (tags.power === 'plant') return 'power_plant';
  if (tags.power === 'substation') return 'substation';
  if (tags.power === 'generator') {
    if (tags['generator:source']) return tags['generator:source'];
    return 'generator';
  }
  if (tags.aeroway === 'aerodrome') return 'airport';
  if (tags.aeroway === 'helipad') return 'helipad';
  if (tags.man_made === 'tower') return 'tower';
  if (tags.man_made === 'communications_tower') return 'cell_tower';
  if (tags.man_made === 'surveillance' && tags['surveillance:type'] === 'camera') return 'surveillance_camera';
  if (tags.man_made === 'surveillance') return 'surveillance';
  if (tags.man_made === 'antenna') return 'antenna';
  if (tags.man_made === 'mast') return 'mast';
  if (tags.man_made === 'pipeline') return 'pipeline';
  if (tags.landuse === 'port') return 'port';
  if (tags.harbour) return 'harbour';
  if (tags.building === 'warehouse') return 'warehouse';
  if (tags.landuse === 'railway') return 'railyard';
  if (tags.landuse === 'military') return 'military';
  if (tags.landuse === 'industrial') return 'industrial';
  if (tags.amenity === 'prison') return 'prison';
  if (tags.amenity === 'hospital') return 'hospital';
  if (tags.amenity === 'embassy') return 'embassy';
  if (tags.waterway === 'dam') return 'dam';
  if (tags.building === 'industrial') return 'factory';
  if (tags.building) return 'building';
  
  return 'infrastructure';
}

export function calculateStats(assets: Asset[]): { 
  total: number; 
  operators: Record<string, number>; 
  types: Record<string, number> 
} {
  const operators: Record<string, number> = {};
  const types: Record<string, number> = {};

  for (const asset of assets) {
    const op = asset.operator || 'Unknown';
    operators[op] = (operators[op] || 0) + 1;
    
    types[asset.type] = (types[asset.type] || 0) + 1;
  }

  return {
    total: assets.length,
    operators,
    types
  };
}
