import Link from 'next/link';
import type { JSX } from 'react';

import { EditorialSection } from '@/components/content/EditorialSection';

export function RaceExplainer(): JSX.Element {
  return (
    <EditorialSection title="About the 3D race replay">
      <p>
        This replay reconstructs a whole Formula 1 session in 3D from{' '}
        <strong>official timing and telemetry</strong> — every practice,
        qualifying, sprint and race lap. Each car is placed on the circuit at
        its true position, so you can watch the lights go out, the pit stops,
        the overtakes and the chequered flag exactly as they happened.
      </p>
      <ul>
        <li>
          <strong>Pick any session.</strong> Choose a season and Grand Prix
          since 2021, then any session of that weekend: practice, qualifying,
          the Sprint or the race.
        </li>
        <li>
          <strong>Control the replay.</strong> Pause, scrub the timeline, or
          watch at up to 32 times speed. Flag periods are marked on the
          timeline so you can jump straight to the action.
        </li>
        <li>
          <strong>Follow any driver.</strong> Tap a car, a dot on the track map
          or a name in the timing tower to follow it with the TV, chase or
          helicopter camera, with its speed, gap, lap times and pit stops.
        </li>
        <li>
          <strong>Read the race.</strong> Race-control messages appear in the
          log as they were issued, so you can see when a yellow, Safety Car or
          red flag changed the picture.
        </li>
      </ul>
      <p>
        Want to understand what you’re watching? Our{' '}
        <Link href="/learn/flags">race flags guide</Link> decodes the marshals’
        signals, <Link href="/learn/tyres">tyres &amp; strategy</Link> explains
        the pit-stop calls, and the full{' '}
        <Link href="/learn">Learning Center</Link> covers the rest. For the full
        finishing order of any race, open it in the{' '}
        <Link href="/history">race archive</Link>.
      </p>
      <p>
        Timing and telemetry are sourced from publicly available providers
        including FastF1 and the Ergast / Jolpica API. The first load of a
        session can take a moment while the data is fetched and cached.
      </p>
    </EditorialSection>
  );
}
