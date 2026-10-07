import Link from 'next/link';
import type { JSX } from 'react';

import { EditorialSection } from '@/components/content/EditorialSection';

export function HistoryExplainer(): JSX.Element {
  return (
    <EditorialSection title="About the race archive">
      <p>
        The archive holds every Formula 1 Grand Prix since 2021, season by
        season. Pick a year to see its full calendar, then open any finished
        round for the <strong>race classification</strong>: the winner, the
        podium, every finisher’s status and the points they scored — plus the
        circuit layout traced from the fastest lap of the session.
      </p>
      <p>
        Each result links straight into the{' '}
        <Link href="/race">race center</Link>, where you can replay the whole
        weekend in 3D from official telemetry and follow any driver lap by
        lap. On sprint weekends the Sprint has its own
        classification and replay.
      </p>
      <p>
        Below the calendar you’ll find the championship standings for the
        season — final tables for completed years, and the standings so far for
        the current one. Want to know how points are won and how a title is
        decided? The <Link href="/learn/rulebook/points">points system guide</Link>{' '}
        and the rest of our <Link href="/learn">F1 Learning Center</Link> explain
        it from the ground up.
      </p>
    </EditorialSection>
  );
}
