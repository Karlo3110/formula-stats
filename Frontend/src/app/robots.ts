import type { MetadataRoute } from 'next';

import { clientConfig } from '@/lib/config/client-config';

/**
 * Serves /robots.txt. Public content is fully crawlable (so Googlebot and the
 * AdSense crawler can review the site), while authenticated/account routes are
 * kept out of the index. The sitemap location is advertised for discovery.
 */
export default function robots(): MetadataRoute.Robots {
  const { siteUrl } = clientConfig;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/verify-email',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
