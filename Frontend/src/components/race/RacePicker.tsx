'use client';

import { useCallback, useMemo, useRef, useState, type JSX } from 'react';

import { SeasonTabs } from '@/components/f1/SeasonTabs';
import { useDismiss } from '@/hooks/use-dismiss';
import { usePrefetchSchedule } from '@/hooks/use-f1';
import { getArchiveSeasons } from '@/lib/f1/seasons';

import { RacePickerRounds } from './RacePickerRounds';

interface RacePickerProps {
  season: number | null;
  round: number | null;
}

function ChevronIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** "Change race" popover: pick any finished Grand Prix from the archive. */
export function RacePicker({ season, round }: RacePickerProps): JSX.Element {
  const seasons = useMemo(() => getArchiveSeasons(), []);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [browsingSeason, setBrowsingSeason] = useState<number>(season ?? seasons[0] ?? 0);
  const prefetchSchedule = usePrefetchSchedule();
  const close = useCallback((): void => setIsOpen(false), []);
  useDismiss(containerRef, isOpen, close);

  function toggle(): void {
    if (!isOpen && season !== null) {
      setBrowsingSeason(season);
    }
    setIsOpen((open) => !open);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="inline-flex h-9 items-center gap-2 rounded-md border border-white/10 bg-surface px-3 text-sm font-medium text-foreground transition hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        Change race
        <ChevronIcon />
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-label="Choose a race"
          className="glass-panel animate-overlay-rise absolute right-0 top-full z-40 mt-2 w-[min(26rem,calc(100vw-2rem))] rounded-xl p-3"
        >
          <SeasonTabs seasons={seasons} active={browsingSeason} onSelect={setBrowsingSeason} onPreview={prefetchSchedule} />
          <RacePickerRounds
            season={browsingSeason}
            activeSeason={season}
            activeRound={round}
            onNavigate={close}
          />
        </div>
      ) : null}
    </div>
  );
}
