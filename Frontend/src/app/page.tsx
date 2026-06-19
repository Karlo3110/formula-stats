import Link from 'next/link';
import type { JSX } from 'react';

import { Button } from '@/components/ui/Button';
import { Heading, Text } from '@/components/ui/Typography';

export default function HomePage(): JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center">
      <div className="flex flex-col items-center gap-4">
        <Heading level={1} display className="text-5xl text-primary">
          Formula Stats
        </Heading>
        <Text variant="muted" className="max-w-md">
          Deep Formula 1 statistics — sessions, laps, and telemetry powered by
          FastF1.
        </Text>
      </div>
      <div className="flex gap-4">
        <Link href="/login">
          <Button size="lg">Sign in</Button>
        </Link>
        <Link href="/register">
          <Button size="lg" variant="secondary">
            Create account
          </Button>
        </Link>
      </div>
    </main>
  );
}
