import type { Metadata } from 'next';

const SITE_NAME = 'Formula Stats';

interface PageMetadataInput {
  /** Short page title; the root layout template appends "· Formula Stats". */
  title: string;
  description: string;
  /** Root-relative path, e.g. "/standings". Resolved against `metadataBase`. */
  path: string;
}

/**
 * Builds consistent per-page SEO metadata: a self-referencing canonical URL
 * plus matching Open Graph and Twitter tags. Keeping this in one place stops
 * canonical/OG drift across the dozen-odd public routes.
 */
export function buildPageMetadata({
  title,
  description,
  path,
}: PageMetadataInput): Metadata {
  const socialTitle = `${title} · ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: socialTitle,
      description,
      url: path,
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
    },
  };
}
