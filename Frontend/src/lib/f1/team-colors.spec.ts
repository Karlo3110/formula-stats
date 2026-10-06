import { describe, expect, it } from 'vitest';

import { resolveTeamColor } from './team-colors';

describe('resolveTeamColor', () => {
  it('prefers the official colour from the API', () => {
    expect(resolveTeamColor('#ff8000', 'McLaren')).toBe('#ff8000');
  });

  it('falls back to the name-based colour for missing or malformed values', () => {
    expect([resolveTeamColor(null, 'Ferrari'), resolveTeamColor('red', 'Ferrari')]).toEqual(['#e8002d', '#e8002d']);
  });
});
