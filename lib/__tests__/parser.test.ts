import { describe, expect, it } from 'vitest';
import { buildLocationQuery, parseQuery, validateQuery } from '@/lib/parser';

describe('parseQuery type matching', () => {
  it('prioritizes specific tower types over the generic fallback', () => {
    expect(parseQuery('clock towers in london').type).toBe('clock_tower');
    expect(parseQuery('bell towers in rome').type).toBe('bell_tower');
    expect(parseQuery('control towers at heathrow').type).toBe('atc_tower');
  });

  it('keeps the generic tower fallback for plain tower queries', () => {
    expect(parseQuery('towers in dubai').type).toBe('telecom');
    expect(parseQuery('masts in delhi').type).toBe('mast');
  });
});

describe('parseQuery operator aliases', () => {
  it('matches operator aliases as whole words', () => {
    expect(parseQuery('vodafone towers in delhi').operator).toBe('vodafone');
    expect(parseQuery('airports in vienna').operator).toBeNull();
    expect(parseQuery('airports in victoria').operator).toBeNull();
  });

  it('keeps the location when removing aliases', () => {
    const parsed = parseQuery('vodafone towers near mumbai');
    expect(parsed.operator).toBe('vodafone');
    expect(buildLocationQuery(parsed)).toBe('mumbai');
  });
});

describe('buildLocationQuery', () => {
  it('combines a region with a structured country', () => {
    const parsed = parseQuery('type:airport region:bavaria country:germany');
    expect(buildLocationQuery(parsed)).toBe('bavaria, germany');
  });

  it('returns a standalone structured country', () => {
    const parsed = parseQuery('type:airport country:india');
    expect(buildLocationQuery(parsed)).toBe('india');
  });
});

describe('validateQuery', () => {
  it('requires a type or operator and a location', () => {
    expect(validateQuery(parseQuery('towers in dubai')).valid).toBe(true);
    expect(validateQuery(parseQuery('towers')).valid).toBe(false);
    expect(validateQuery(parseQuery('in dubai')).valid).toBe(false);
  });
});

describe('structured queries with free-text scope', () => {
  it('reads the geographic scope out of the token remainder', () => {
    const parsed = parseQuery('type:substation in New York radius:80');
    expect(parsed.type).toBe('substation');
    expect(parsed.region).toBe('New York');
    expect(parsed.radius).toBe(80);
    expect(validateQuery(parsed).valid).toBe(true);
  });

  it('supports natural "in" phrases without structured radius', () => {
    const parsed = parseQuery('type:hospital in mumbai');
    expect(parsed.type).toBe('hospital');
    expect(parsed.region).toBe('mumbai');
    expect(validateQuery(parsed).valid).toBe(true);
  });

  it('honours near phrases and "within" radius in mixed queries', () => {
    const parsed = parseQuery('type:port near Rotterdam within 30');
    expect(parsed.near).toBe('Rotterdam');
    expect(parsed.radius).toBe(30);
    expect(validateQuery(parsed).valid).toBe(true);
  });

  it('keeps structured tokens when the remainder is empty', () => {
    const parsed = parseQuery('type:airport region:california country:usa radius:150');
    expect(parsed.region).toBe('california');
    expect(parsed.country).toBe('usa');
    expect(parsed.radius).toBe(150);
    expect(validateQuery(parsed).valid).toBe(true);
  });

  it('does not over-capture "radius" into the region', () => {
    const parsed = parseQuery('towers in london radius:40');
    expect(parsed.region).toBe('london');
    expect(parsed.radius).toBe(40);
  });
});
