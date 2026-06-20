import type { JSX, ReactNode } from 'react';

import { AmbientBackground } from '@/components/layout/AmbientBackground';
import { Navbar } from '@/components/layout/Navbar';

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col">
      <AmbientBackground />
      <Navbar />
      <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
