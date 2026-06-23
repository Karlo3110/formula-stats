import type { MetadataRoute } from 'next';

import { clientConfig } from '@/lib/config/client-config';
import { LEARN_TOPICS } from '@/lib/learn/catalog';

/**
 * Generates /sitemap.xml from the known public routes plus every Learning
 * Center topic and chapter, so search engines (and the AdSense reviewer) can
 * discover the full breadth of original content in one pass.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const { siteUrl } = clientConfig;
  const lastModified = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified, changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/race`, lastModified, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${siteUrl}/standings`, lastModified, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/history`, lastModified, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteUrl}/learn`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/about`, lastModified, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${siteUrl}/contact`, lastModified, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${siteUrl}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteUrl}/terms`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const learnRoutes: MetadataRoute.Sitemap = LEARN_TOPICS.flatMap((topic) => [
    {
      url: `${siteUrl}/learn/${topic.slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    ...topic.chapters.map((chapter) => ({
      url: `${siteUrl}/learn/${topic.slug}/${chapter.slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]);

  return [...staticRoutes, ...learnRoutes];
}
