import Link from 'next/link';
import type { JSX, ReactNode } from 'react';

import { Heading } from '@/components/ui/Typography';

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-12">
      <Link href="/" className="flex items-center gap-2">
        <Heading level={1} display className="text-primary">
          Formula Stats
        </Heading>
      </Link>
      {children}
    </main>
  );
}
