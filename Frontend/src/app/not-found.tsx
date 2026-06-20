import Link from 'next/link';
import type { JSX } from 'react';

import { AmbientBackground } from '@/components/layout/AmbientBackground';
import { Button } from '@/components/ui/Button';

export default function NotFound(): JSX.Element {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <AmbientBackground />

      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.45em] text-primary">
        Off the track
      </p>
      <h1 className="mt-4 font-display text-[8rem] uppercase leading-none tracking-tight text-heading sm:text-[12rem]">
        404
      </h1>
      <p className="mt-2 max-w-md text-lg text-foreground/65">
        This page took a wrong turn into the gravel. Let’s get you back on the
        racing line.
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="w-full sm:w-auto">
          <Button size="lg" className="w-full sm:w-auto">
            Back to dashboard
          </Button>
        </Link>
        <Link href="/standings" className="w-full sm:w-auto">
          <Button size="lg" variant="secondary" className="w-full sm:w-auto">
            View standings
          </Button>
        </Link>
      </div>
    </div>
  );
}
