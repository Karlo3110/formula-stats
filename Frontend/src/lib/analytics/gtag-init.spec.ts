import { describe, expect, it } from 'vitest';

import { analyticsConsentFor } from './consent';
import { buildGtagInit } from './gtag-init';

describe('buildGtagInit', () => {
  it('defaults analytics consent from the stored banner choice before configuring', () => {
    const script = buildGtagInit('G-ABC123');

    expect(script.indexOf("'consent', 'default'")).toBeLessThan(script.indexOf("'config', \"G-ABC123\""));
  });

  it('embeds the measurement id as a quoted string literal', () => {
    expect(buildGtagInit('G-ABC123')).toContain('window.gtag(\'config\', "G-ABC123");');
  });
});

describe('analyticsConsentFor', () => {
  it('grants analytics only after the visitor accepts', () => {
    expect([analyticsConsentFor('accepted'), analyticsConsentFor('declined'), analyticsConsentFor(null)]).toEqual([
      'granted',
      'denied',
      'denied',
    ]);
  });
});
