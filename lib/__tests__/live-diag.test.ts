import { describe, it } from 'vitest';
import { buildOverpassQuery, executeQuery } from '@/lib/overpass';
import { resolveLocation, calculateBoundingBox, osmIdToAreaId } from '@/lib/geo';

// NOTE: temporary diagnostic — hits the live Overpass API. Not committed.
describe('live search pipeline diagnostics', () => {
  it('times a Malta airport region search', { timeout: 60000 }, async () => {
    const t0 = Date.now();
    const loc = await resolveLocation('malta');
    const tGeo = Date.now() - t0;
    console.log('geocode ms', tGeo, 'areaId', loc?.osmType, loc?.osmId, 'bbox', loc?.boundingBox);

    const areaId = loc?.osmType ? osmIdToAreaId(loc.osmType, loc.osmId ?? 0) : null;
    const query = buildOverpassQuery('airport', loc!.boundingBox, null, areaId);
    console.log('query', query);

    const t1 = Date.now();
    const res = await executeQuery(query);
    console.log('overpass ms', Date.now() - t1, 'assets', res.assets.length, 'truncated', res.truncated, 'warning', res.warning);
  });

  it('times a near-radius telecom tower search (dubai 5km)', { timeout: 60000 }, async () => {
    const t0 = Date.now();
    const loc = await resolveLocation('dubai');
    console.log('geocode ms', Date.now() - t0, 'bbox', loc?.boundingBox);

    const bbox = calculateBoundingBox(loc!.lat, loc!.lon, 5);
    const query = buildOverpassQuery('telecom', bbox, null, null);
    console.log('query', query);

    const t1 = Date.now();
    const res = await executeQuery(query);
    console.log('overpass ms', Date.now() - t1, 'assets', res.assets.length, 'truncated', res.truncated, 'warning', res.warning);
  });

  it('times a broad region telecom tower search (texas)', { timeout: 60000 }, async () => {
    const loc = await resolveLocation('texas');
    const areaId = loc?.osmType ? osmIdToAreaId(loc.osmType, loc.osmId ?? 0) : null;
    const query = buildOverpassQuery('telecom', loc!.boundingBox, null, areaId);
    console.log('query', query);

    const t1 = Date.now();
    const res = await executeQuery(query);
    console.log('overpass ms', Date.now() - t1, 'assets', res.assets.length, 'truncated', res.truncated, 'warning', res.warning);
  });
});
