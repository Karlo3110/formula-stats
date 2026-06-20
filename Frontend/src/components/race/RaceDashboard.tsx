'use client';

import dynamic from 'next/dynamic';
import type { JSX } from 'react';

import { Spinner } from '@/components/ui/Spinner';
import { Heading, Text } from '@/components/ui/Typography';

import { DriverList } from './DriverList';
import { DriverTelemetry } from './DriverTelemetry';

const RaceScene = dynamic(
  () => import('./RaceScene').then((mod) => mod.RaceScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <Text variant="muted">Rendering track…</Text>
      </div>
    ),
  },
);

export function RaceDashboard(): JSX.Element {
  return (
    <div className="mx-auto flex max-w-[110rem] flex-col gap-4">
      <div className="flex items-end justify-between">
        <div>
          <Heading level={1} display>
            Live Race
          </Heading>
          <Text variant="muted">Tap a car to follow it around the circuit.</Text>
        </div>
        <span className="rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-xs uppercase tracking-wider text-warning">
          Demo replay
        </span>
      </div>

      <div className="grid gap-4 lg:h-[calc(100vh-11rem)] lg:grid-cols-[18rem_minmax(0,1fr)_18rem]">
        <div className="order-2 lg:order-1">
          <DriverList />
        </div>

        <div className="relative order-1 min-h-[55vh] overflow-hidden rounded-lg border border-border/70 bg-[#070a0b] lg:order-2 lg:min-h-0">
          <RaceScene />
        </div>

        <div className="order-3">
          <DriverTelemetry />
        </div>
      </div>
    </div>
  );
}
