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
