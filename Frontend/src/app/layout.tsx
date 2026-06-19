import type { Metadata } from 'next';
import type { JSX, ReactNode } from 'react';
import { Bebas_Neue, Inter } from 'next/font/google';

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
  title: 'Formula Stats',
  description: 'Formula 1 statistics, powered by FastF1.',
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
        <QueryProvider>
          <AuthInitializer>{children}</AuthInitializer>
        </QueryProvider>
      </body>
    </html>
  );
}
