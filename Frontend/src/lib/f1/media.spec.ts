import { describe, expect, it } from 'vitest';

import { flagUrl, initialsOf, largeHeadshotUrl, safeImageUrl } from './media';

const HEADSHOT =
  'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png.transform/1col/image.png';

describe('safeImageUrl', () => {
  it('accepts HTTPS images on the official F1 media host', () => {
    expect(safeImageUrl(HEADSHOT)).toBe(HEADSHOT);
  });

  it.each([
    ['plain http', 'http://media.formula1.com/a.png'],
    ['an unknown host', 'https://evil.example.com/a.png'],
    ['a look-alike host', 'https://media.formula1.com.evil.example/a.png'],
    ['a javascript URL', 'javascript:alert(1)'],
    ['garbage', 'not a url'],
  ])('rejects %s', (_label, url) => {
    expect(safeImageUrl(url)).toBeNull();
  });

  it('treats a missing URL as no image', () => {
    expect([safeImageUrl(null), safeImageUrl(undefined), safeImageUrl('')]).toEqual([null, null, null]);
  });
});

describe('largeHeadshotUrl', () => {
  it('requests the large column render of an official headshot', () => {
    expect(largeHeadshotUrl(HEADSHOT)).toContain('.png.transform/4col/image.png');
  });

  it('leaves URLs without a size transform unchanged', () => {
    expect(largeHeadshotUrl('https://media.formula1.com/x.png')).toBe('https://media.formula1.com/x.png');
  });
});

describe('flagUrl', () => {
  it('builds a lower-case SVG flag URL', () => {
    expect(flagUrl('GB')).toBe('https://flagcdn.com/gb.svg');
  });
});

describe('initialsOf', () => {
  it('takes the first letters of the first two names', () => {
    expect([initialsOf('Lando Norris'), initialsOf('Andrea Kimi Antonelli'), initialsOf('Zhou')]).toEqual([
      'LN',
      'AK',
      'Z',
    ]);
  });
});
