import Script from 'next/script';
import type { JSX } from 'react';

import { buildGtagInit } from '@/lib/analytics/gtag-init';
import { clientConfig } from '@/lib/config/client-config';

/**
 * Google Analytics 4 (gtag.js), site-wide. Renders nothing unless a
 * measurement id is configured, so only production reports traffic. Page
 * views on client-side navigation come from GA4's enhanced measurement.
 */
export function GoogleAnalytics(): JSX.Element | null {
  const measurementId = clientConfig.gaMeasurementId;
  if (!measurementId) {
    return null;
  }

  return (
    <>
      <Script id="gtag-init" strategy="afterInteractive">
        {buildGtagInit(measurementId)}
      </Script>
      <Script
        id="gtag-library"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
    </>
  );
}
