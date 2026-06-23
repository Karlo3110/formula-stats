import Link from 'next/link';
import type { JSX } from 'react';

import { EditorialSection } from '@/components/content/EditorialSection';

export function HistoryExplainer(): JSX.Element {
  return (
    <EditorialSection title="About the season archive">
      <p>
        This archive holds the <strong>final</strong> drivers’ and
        constructors’ standings from past Formula 1 seasons. Pick a year above
        to see how that championship finished — who took the drivers’ title, how
        the constructors’ order settled, and how many points separated the
        contenders once the last race was run. Because completed seasons never
        change, these tables are a permanent record rather than a live feed.
      </p>
      <p>
        Standings are the clearest way to read a season’s story at a glance: a
        runaway champion shows up as a huge points gap, while a title fight that
        went to the wire shows up as two drivers within a handful of points. Pair
        that with the race-by-race detail to understand <em>why</em> a season
        played out the way it did.
      </p>
      <p>
        Following the current campaign instead? See the{' '}
        <Link href="/standings">live championship standings</Link>. If you want
        to understand how points are won and how a title is decided, the{' '}
        <Link href="/learn/rulebook/points">points system guide</Link> and the
        rest of our <Link href="/learn">F1 Learning Center</Link> explain it from
        the ground up.
      </p>
    </EditorialSection>
  );
}
