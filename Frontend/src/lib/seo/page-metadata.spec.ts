import { describe, expect, it } from 'vitest';

import { buildPageMetadata } from './page-metadata';

describe('buildPageMetadata', () => {
  const metadata = buildPageMetadata({ title: 'Standings', description: 'Season standings.', path: '/standings' });

  it('keeps the social card on pages that set their own Open Graph tags', () => {
    expect([metadata.openGraph?.images, metadata.twitter?.images]).toEqual([
      [expect.objectContaining({ url: '/opengraph-image', width: 1200, height: 630 })],
      ['/opengraph-image'],
    ]);
  });

  it('points the canonical URL at the page itself', () => {
    expect(metadata.alternates?.canonical).toBe('/standings');
  });
});
