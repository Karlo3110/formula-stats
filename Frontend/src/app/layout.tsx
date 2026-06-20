import type { Metadata } from 'next';
import type { JSX, ReactNode } from 'react';
import { Bebas_Neue, Inter } from 'next/font/google';

import { AdSenseScript } from '@/components/ads/AdSenseScript';
import { AuthInitializer } from '@/providers/auth-initializer';
import { QueryProvider } from '@/providers/query-provider';
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

export const metadata: Metadata = {
  title: {
    default: 'Formula Stats — F1 telemetry, standings & 3D race replays',
    template: '%s · Formula Stats',
  },
  description:
    'Formula 1 telemetry, championship standings, driver stats, and 3D race replays. Learn the sport and follow every Grand Prix.',
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
        <AdSenseScript />
        <QueryProvider>
          <AuthInitializer>{children}</AuthInitializer>
        </QueryProvider>
      </body>
    </html>
  );
}
