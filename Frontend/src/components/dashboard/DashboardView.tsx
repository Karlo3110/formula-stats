'use client';

import type { JSX } from 'react';

import { Card } from '@/components/ui/Card';
import { Heading, Text } from '@/components/ui/Typography';
import { useAuthStore } from '@/stores/use-auth-store';

export function DashboardView(): JSX.Element {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Heading level={1} display>
          Dashboard
        </Heading>
        <Text variant="muted">
          Welcome back{user ? `, ${user.displayName}` : ''}.
        </Text>
      </div>

      <Card>
        <Heading level={4}>Formula 1 data</Heading>
        <Text variant="muted" className="mt-2">
          Session, lap, and telemetry stats from FastF1 will appear here.
        </Text>
      </Card>
    </div>
  );
}
