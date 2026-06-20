import Script from 'next/script';
import type { JSX } from 'react';

import { clientConfig } from '@/lib/config/client-config';

/**
 * Loads the Google AdSense library once, site-wide. Renders nothing until a
 * publisher id is configured, so the site ships ad-free until AdSense approval.
 */
export function AdSenseScript(): JSX.Element | null {
  const client = clientConfig.adsenseClient;
  if (!client) {
    return null;
  }

  return (
    <Script
      id="adsbygoogle-init"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
    />
  );
}
