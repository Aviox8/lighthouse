import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildMultiTypeQuery,
  buildOverpassQuery,
  executeQuery,
  MAX_RESULTS,
} from '@/lib/overpass';

function mockResponse(
  data: unknown,
  status = 200,
  headers: Record<string, string> = {},
): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (name: string) => headers[name.toLowerCase()] ?? null,
    },
    json: async () => data,
  } as unknown as Response;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('buildOverpassQuery', () => {
  const bbox: [number, number, number, number] = [51.4, 51.6, -0.2, 0.1];

  it('caps results and includes the feature limit', () => {
    const query = buildOverpassQuery('airport', bbox);
    expect(query).toContain(`out center ${MAX_RESULTS};`);
  });

  it('escapes quotes and backslashes in operator filters', () => {
    const query = buildOverpassQuery('airport', bbox, 'Acme "Air"\\Ops');
    expect(query).toContain('Acme \\"Air\\"\\\\Ops');
  });

  it('supports area-based queries', () => {
    const query = buildOverpassQuery('airport', bbox, null, 3600000000);
    expect(query).toContain('(area:3600000000)');
  });
});

describe('buildMultiTypeQuery', () => {
  it('limits and escapes operator queries', () => {
    const query = buildMultiTypeQuery(
      [0, 1, 2, 3],
      'Acme "Air"',
      3600000000,
    );
    expect(query).toContain('Acme \\"Air\\"');
    expect(query).toContain(`out center ${MAX_RESULTS};`);
  });
});

describe('executeQuery', () => {
  it('normalizes nodes and way centers', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        mockResponse({
          elements: [
            {
              type: 'node',
              id: 1,
              lat: 51.5,
              lon: -0.1,
              tags: { name: 'Node Airport', aeroway: 'aerodrome' },
            },
            {
              type: 'way',
              id: 2,
              center: { lat: 52.5, lon: -1.1 },
              tags: { operator: 'Acme' },
            },
            {
              type: 'node',
              id: 3,
              tags: { name: 'Missing coordinates' },
            },
          ],
        }),
      ),
    );

    const result = await executeQuery('query');

    expect(result.assets).toHaveLength(2);
    expect(result.assets[0]).toMatchObject({
      id: 'node/1',
      name: 'Node Airport',
      type: 'airport',
    });
    expect(result.assets[1]).toMatchObject({
      id: 'way/2',
      name: 'Acme',
      operator: 'Acme',
    });
    expect(result.truncated).toBe(false);
  });

  it('reports a remark as a truncated partial response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        mockResponse({
          elements: [
            {
              type: 'node',
              id: 1,
              lat: 1,
              lon: 2,
              tags: {},
            },
          ],
          remark: 'runtime error: query timed out',
        }),
      ),
    );

    const result = await executeQuery('query');
    expect(result.truncated).toBe(true);
    expect(result.warning).toContain('timed out');
  });

  it('retries the keyed endpoint when it reports itself busy', async () => {
    vi.stubEnv('OVERPASS_CH_KEY', 'test-key');
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        mockResponse({ error: 'concurrency_limit' }, 429, { 'retry-after': '0.2' }),
      )
      .mockResolvedValueOnce(mockResponse({ elements: [] }));
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const result = await executeQuery('query');

    expect(result.assets).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toContain('/v1/test-key/interpreter');
    expect(fetchMock.mock.calls[1][0]).toBe(fetchMock.mock.calls[0][0]);
  });

  it('falls back to the next endpoint after a non-OK response', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(mockResponse({}, 429))
      .mockResolvedValueOnce(mockResponse({ elements: [] }));
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const result = await executeQuery('query');

    expect(result.assets).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
