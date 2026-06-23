import Link from 'next/link';
import type { JSX } from 'react';

import { EditorialSection } from '@/components/content/EditorialSection';

export function StandingsExplainer(): JSX.Element {
  return (
    <EditorialSection title="How the championship standings work">
      <p>
        Formula 1 runs <strong>two championships at once</strong> from the same
        race results. The <strong>Drivers’ Championship</strong> ranks every
        driver by the points they have personally scored; the{' '}
        <strong>Constructors’ Championship</strong> adds together the points of
        both cars from each team. A team can win the constructors’ title even if
        neither of its drivers wins the drivers’ title, and because prize money
        is tied largely to the constructors’ table, every point a second car
        scores matters.
      </p>
      <p>
        Points are awarded to the top ten finishers of each Grand Prix on a
        sliding scale — 25 for a win, then 18, 15, 12, 10, 8, 6, 4, 2 and 1 for
        tenth — with a smaller pool of points available in Sprint races. If two
        drivers or teams finish level, the tie is broken by{' '}
        <strong>countback</strong>: whoever has more wins ranks higher, then
        more second places, and so on. The tables above update through the
        season as each round is scored.
      </p>
      <p>
        New to how the points and the weekend fit together? Our Learning Center
        breaks it down in plain language — start with{' '}
        <Link href="/learn/rulebook/points">the points system</Link> and{' '}
        <Link href="/learn/rulebook">the rulebook course</Link>, or jump to{' '}
        <Link href="/learn">all the F1 courses</Link>. You can also browse{' '}
        <Link href="/history">final standings from past seasons</Link>.
      </p>
    </EditorialSection>
  );
}
