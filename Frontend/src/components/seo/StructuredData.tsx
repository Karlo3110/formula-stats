import type { JSX } from 'react';

import { clientConfig } from '@/lib/config/client-config';

const SITE_NAME = 'Formula Stats';
const SITE_DESCRIPTION =
  'Formula 1 telemetry, championship standings, driver stats, and 3D race replays. Learn the sport and follow every Grand Prix.';

/**
 * Site-wide JSON-LD (Organization + WebSite). Gives search engines an explicit,
 * machine-readable description of the publisher — a small SEO/trust signal that
 * also helps AdSense understand the site. The payload is entirely
 * developer-authored, so inlining it is safe (no user input).
 */
export function StructuredData(): JSX.Element {
  const { siteUrl } = clientConfig;

  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: SITE_NAME,
        url: siteUrl,
        description: SITE_DESCRIPTION,
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        name: SITE_NAME,
        url: siteUrl,
        description: SITE_DESCRIPTION,
        inLanguage: 'en',
        publisher: { '@id': `${siteUrl}/#organization` },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
