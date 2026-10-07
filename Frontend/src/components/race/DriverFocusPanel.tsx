'use client';

import type { JSX } from 'react';

import { CountryFlag } from '@/components/f1/CountryFlag';
import { DriverAvatar } from '@/components/f1/DriverAvatar';
import { Panel } from '@/components/ui/Panel';
import { Eyebrow } from '@/components/ui/Typography';
import { cn } from '@/lib/utils/cn';
import type { DriverDirectory } from '@/hooks/use-season-drivers';
import { useStandings } from '@/hooks/use-standings';
import { nationalityIso2 } from '@/lib/f1/countries';
import { useRaceStore } from '@/stores/use-race-store';
import { focusGapLabel, lapTimeLabel, statusLabel } from '@/lib/race/standing-labels';
import { CarStatus, type DriverStanding } from '@/lib/race/types';
import type { DriverProfile, SessionKind } from '@/lib/validation/f1-schemas';

import { SpeedGauge } from './SpeedGauge';

interface FocusStatProps {
  label: string;
  value: string;
  tone?: 'default' | 'warning';
}

function FocusStat({ label, value, tone = 'default' }: FocusStatProps): JSX.Element {
  return (
    <div className="min-w-0">
      <Eyebrow>{label}</Eyebrow>
      <p
        className={cn(
          'mt-1 truncate font-mono text-sm tabular-nums',
          tone === 'warning' ? 'text-warning' : 'text-heading',
        )}
      >
        {value}
      </p>
    </div>
  );
}

function FocusEmpty(): JSX.Element {
  return (
    <div className="flex h-full flex-col justify-center gap-1.5 px-4 py-4">
      <p className="text-sm font-medium text-foreground">No driver selected</p>
      <p className="text-sm text-muted">
        Pick a car on track or a name in the running order to follow it.
      </p>
    </div>
  );
}

interface FocusBodyProps {
  standing: DriverStanding;
  profile: DriverProfile | undefined;
  kind: SessionKind;
}

function FocusBody({ standing, profile, kind }: FocusBodyProps): JSX.Element {
  const { driver } = standing;
  const name = profile?.fullName ?? driver.code;
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-start gap-3">
        <DriverAvatar name={name} headshotUrl={profile?.headshotUrl} teamColor={driver.color} size="lg" />
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-display text-3xl uppercase leading-none text-heading">
            {driver.code}
            {profile?.number ? <span className="font-mono text-sm text-muted">#{profile.number}</span> : null}
          </p>
          <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-muted">
            <CountryFlag iso2={nationalityIso2(profile?.countryCode)} label={profile?.countryCode ?? ''} />
            <span className="truncate">{profile ? name : driver.team}</span>
          </p>
        </div>
        <p className="ml-auto font-display text-3xl leading-none text-accent">P{standing.position}</p>
      </div>
      <SpeedGauge speedKmh={standing.speedKmh} />
      <div className="grid grid-cols-3 gap-3 border-t border-white/[0.06] pt-3">
        <FocusStat label={kind === 'race' ? 'Gap to leader' : 'Gap to fastest'} value={focusGapLabel(standing, kind)} />
        <FocusStat label="Lap" value={String(standing.lap)} />
        <FocusStat
          label="Status"
          value={statusLabel(standing.status)}
          tone={standing.status === CarStatus.Running ? 'default' : 'warning'}
        />
        <FocusStat label="Last lap" value={lapTimeLabel(standing.lastLapSeconds)} />
        <FocusStat label="Best lap" value={lapTimeLabel(standing.bestLapSeconds)} />
      </div>
    </div>
  );
}

interface DriverFocusPanelProps {
  isReady: boolean;
  drivers: DriverDirectory;
  kind: SessionKind;
}

/** Telemetry for the followed driver: position, speed, gap, laps and status. */
export function DriverFocusPanel({ isReady, drivers, kind }: DriverFocusPanelProps): JSX.Element {
  const standings = useStandings();
  const selectedDriverId = useRaceStore((state) => state.selectedDriverId);
  const clearSelection = useRaceStore((state) => state.clearSelection);
  const standing = isReady ? standings.find((s) => s.driver.id === selectedDriverId) : undefined;

  const aside = standing ? (
    <button
      type="button"
      onClick={clearSelection}
      className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted transition hover:text-foreground"
    >
      Clear
    </button>
  ) : null;

  return (
    <Panel title="Driver" aside={aside}>
      {standing ? <FocusBody standing={standing} profile={drivers.get(standing.driver.code)} kind={kind} /> : <FocusEmpty />}
    </Panel>
  );
}
