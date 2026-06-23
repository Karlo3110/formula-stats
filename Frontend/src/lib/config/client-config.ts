import { z } from 'zod';

const DEFAULT_SITE_URL = 'https://staging.formula-stats.com';

// Treat empty / whitespace-only values (e.g. a bare `KEY=` line in .env) as
// unset, so optional vars fall back to their default instead of failing
// validation and crashing the whole app.
const emptyToUndefined = (value: unknown): unknown =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

const ClientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  // Canonical, fully-qualified site origin (no trailing slash). Drives SEO
  // metadata, canonical URLs, the sitemap, robots.txt, and Open Graph tags.
  // Set per environment (e.g. https://formula-stats.com in production).
  NEXT_PUBLIC_SITE_URL: z.preprocess(
    emptyToUndefined,
    z.string().url().default(DEFAULT_SITE_URL),
  ),
  // Optional: Google AdSense publisher id, e.g. "ca-pub-1234567890123456".
  // The AdSense script, ad slots, ads.txt, and site-ownership verification all
  // light up only when this is set, so the site runs ad-free until approved.
  NEXT_PUBLIC_ADSENSE_CLIENT: z.preprocess(
    emptyToUndefined,
    z.string().min(1).optional(),
  ),
});

// Reference each var by its full name so Next.js can statically inline it.
const parsed = ClientEnvSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_ADSENSE_CLIENT: process.env.NEXT_PUBLIC_ADSENSE_CLIENT,
});

if (!parsed.success) {
  throw new Error(`Invalid client env: ${parsed.error.message}`);
}

const adsenseClient = parsed.data.NEXT_PUBLIC_ADSENSE_CLIENT ?? null;

export const clientConfig = {
  apiUrl: parsed.data.NEXT_PUBLIC_API_URL,
  // Strip any trailing slash so URL composition stays predictable.
  siteUrl: parsed.data.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, ''),
  adsenseClient,
  // The bare publisher id ("pub-…", no "ca-" prefix) required by ads.txt.
  adsensePublisherId: adsenseClient ? adsenseClient.replace(/^ca-/, '') : null,
} as const;
