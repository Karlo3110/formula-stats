'use client';

import dynamic from 'next/dynamic';
import type { JSX } from 'react';

import { Spinner } from '@/components/ui/Spinner';
import { useRaceStore } from '@/stores/use-race-store';

import { DriverList } from './DriverList';
import { DriverTelemetry } from './DriverTelemetry';
import { RaceTopBar } from './RaceTopBar';

const RaceScene = dynamic(
  () => import('./RaceScene').then((mod) => mod.RaceScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    ),
  },
);

const VIGNETTE =
  'radial-gradient(120% 120% at 50% 35%, transparent 45%, rgba(0,0,0,0.6) 100%)';

export function RaceExperience(): JSX.Element {
  const selectedDriverId = useRaceStore((state) => state.selectedDriverId);

  return (
    <div className="relative h-full w-full bg-[#070a0b]">
      <div className="absolute inset-0">
        <RaceScene />
      </div>

      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: VIGNETTE }}
      />

      <RaceTopBar />

      <div className="pointer-events-auto absolute bottom-24 left-4 top-20 w-44 animate-overlay-rise md:bottom-6 md:w-56">
        <DriverList />
      </div>

      {selectedDriverId ? (
        <div
          key={selectedDriverId}
          className="pointer-events-auto absolute inset-x-4 bottom-4 animate-overlay-slide-right md:inset-x-auto md:right-5 md:top-24 md:w-64"
        >
          <DriverTelemetry />
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-x-0 bottom-6 flex justify-center">
          <span className="rounded-full border border-white/10 bg-black/30 px-4 py-1.5 text-[0.65rem] uppercase tracking-[0.25em] text-muted backdrop-blur-md">
            Select a car to follow
          </span>
        </div>
      )}
    </div>
  );
}
