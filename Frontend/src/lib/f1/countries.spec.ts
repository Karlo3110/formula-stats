import { describe, expect, it } from 'vitest';

import { eventCountryIso2, nationalityIso2 } from './countries';

describe('eventCountryIso2', () => {
  it.each([
    ['United Kingdom', 'gb'],
    ['united states', 'us'],
    ['Abu Dhabi', 'ae'],
    ['  Saudi Arabia ', 'sa'],
  ])('maps "%s" to %s', (country, iso2) => {
    expect(eventCountryIso2(country)).toBe(iso2);
  });

  it('returns null for an unknown country', () => {
    expect(eventCountryIso2('Atlantis')).toBeNull();
  });
});

describe('nationalityIso2', () => {
  it.each([
    ['GBR', 'gb'],
    ['NED', 'nl'],
    ['MON', 'mc'],
    ['GER', 'de'],
    ['nzl', 'nz'],
  ])('maps live-timing code %s to %s', (code, iso2) => {
    expect(nationalityIso2(code)).toBe(iso2);
  });

  it('returns null for missing or unknown codes', () => {
    expect([nationalityIso2(null), nationalityIso2('XYZ')]).toEqual([null, null]);
  });
});
