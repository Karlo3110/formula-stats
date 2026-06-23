import type { Metadata } from 'next';
import type { JSX, ReactNode } from 'react';
import { Bebas_Neue, Inter } from 'next/font/google';

import { AdSenseScript } from '@/components/ads/AdSenseScript';
import { CookieConsent } from '@/components/ads/CookieConsent';
import { StructuredData } from '@/components/seo/StructuredData';
import { AuthInitializer } from '@/providers/auth-initializer';
import { QueryProvider } from '@/providers/query-provider';
import { clientConfig } from '@/lib/config/client-config';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const bebasNeue = Bebas_Neue({
  variable: '--font-bebas',
  weight: '400',
  subsets: ['latin'],
});

const SITE_NAME = 'Formula Stats';
const SITE_TITLE = 'Formula Stats — F1 telemetry, standings & 3D race replays';
const SITE_DESCRIPTION =
  'Formula 1 telemetry, championship standings, driver stats, and 3D race replays. Learn the sport and follow every Grand Prix.';

export const metadata: Metadata = {
  metadataBase: new URL(clientConfig.siteUrl),
  title: {
    default: SITE_TITLE,
    template: '%s · Formula Stats',
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  referrer: 'origin-when-cross-origin',
  keywords: [
    'Formula 1',
    'F1',
    'F1 telemetry',
    'race replay',
    'F1 standings',
    'driver standings',
    'constructor standings',
    'Grand Prix',
    'motorsport',
    'F1 stats',
  ],
  category: 'sports',
  authors: [{ name: SITE_NAME, url: clientConfig.siteUrl }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: { canonical: '/' },
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: '/',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  // Site-ownership verification for AdSense via the modern meta-tag method.
  // Only emitted once a publisher id is configured.
  ...(clientConfig.adsenseClient
    ? { other: { 'google-adsense-account': clientConfig.adsenseClient } }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>): JSX.Element {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <StructuredData />
        <AdSenseScript />
        <QueryProvider>
          <AuthInitializer>{children}</AuthInitializer>
        </QueryProvider>
        <CookieConsent />
      </body>
    </html>
  );
}
