import { NextRequest, NextResponse } from 'next/server';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const OVERPASS_CH_BASE = 'https://api.overpass.ch/v1';
const USER_AGENT = 'Lighthouse/1.0 (+https://github.com/Aviox8/lighthouse)';

/** Keyed overpass.ch geocoding, used first when OVERPASS_CH_KEY is set. */
function getKeyedNominatimBase(): string | null {
  const key = process.env.OVERPASS_CH_KEY?.trim();
  return key ? `${OVERPASS_CH_BASE}/${encodeURIComponent(key)}/nominatim` : null;
}
const ALLOWED_ENDPOINTS = new Set(['search']);
const TIMEOUT_MS = 10000;

// Serialize requests so concurrent callers cannot exceed Nominatim's 1 req/s policy.
let lastRequest = 0;
let rateLimitQueue: Promise<void> = Promise.resolve();
const MIN_INTERVAL = 1000;

async function waitForRateLimit(): Promise<void> {
  const run = rateLimitQueue.then(async () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequest;

    if (timeSinceLastRequest < MIN_INTERVAL) {
      const waitTime = MIN_INTERVAL - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    lastRequest = Date.now();
  });

  rateLimitQueue = run.catch(() => undefined);
  await run;
}

function buildSafeParams(searchParams: URLSearchParams): URLSearchParams | null {
  const query = (searchParams.get('q') || '').trim();
  if (!query || query.length > 500) {
    return null;
  }

  const params = new URLSearchParams({
    q: query,
    format: 'json',
    addressdetails: searchParams.get('addressdetails') === '1' ? '1' : '0',
    limit: '5',
  });

  const requestedLimit = Number.parseInt(searchParams.get('limit') || '5', 10);
  if (Number.isFinite(requestedLimit)) {
    params.set('limit', String(Math.min(Math.max(requestedLimit, 1), 10)));
  }

  const countryCodes = searchParams.get('countrycodes');
  if (countryCodes && /^[a-z]{2}(,[a-z]{2})*$/i.test(countryCodes)) {
    params.set('countrycodes', countryCodes.toLowerCase());
  }

  return params;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const endpoint = searchParams.get('endpoint') || 'search';

    if (!ALLOWED_ENDPOINTS.has(endpoint)) {
      return NextResponse.json(
        { error: 'Unsupported Nominatim endpoint' },
        { status: 400 }
      );
    }

    const safeParams = buildSafeParams(searchParams);
    if (!safeParams) {
      return NextResponse.json(
        { error: 'Invalid Nominatim query parameters' },
        { status: 400 }
      );
    }

    const headers = {
      'User-Agent': USER_AGENT,
      'Accept': 'application/json',
    };

    const keyedBase = getKeyedNominatimBase();
    if (keyedBase) {
      try {
        // No 1 req/s throttle here: the keyed plan allows 300 requests/min.
        const keyedResponse = await fetch(`${keyedBase}/${endpoint}?${safeParams.toString()}`, {
          headers,
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });

        if (keyedResponse.ok) {
          const data = await keyedResponse.json();
          return NextResponse.json(data, {
            headers: {
              'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
          });
        }

        console.warn(`overpass.ch geocoding failed (${keyedResponse.status}); falling back to public Nominatim`);
      } catch (error) {
        const timedOut = error instanceof Error && (
          error.name === 'AbortError' ||
          error.name === 'TimeoutError' ||
          error.message.includes('timed out')
        );
        console.warn(`overpass.ch geocoding failed (${timedOut ? 'timeout' : 'network error'}); falling back to public Nominatim`);
      }
    }

    await waitForRateLimit();

    const nominatimUrl = `${NOMINATIM_BASE}/${endpoint}?${safeParams.toString()}`;

    const response = await fetch(nominatimUrl, {
      headers,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Nominatim request failed' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    const isTimeout = error instanceof Error && (
      error.name === 'AbortError' ||
      error.name === 'TimeoutError' ||
      error.message.includes('timed out')
    );

    if (isTimeout) {
      return NextResponse.json(
        { error: 'Nominatim request timed out' },
        { status: 504 }
      );
    }

    console.error('Nominatim proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
