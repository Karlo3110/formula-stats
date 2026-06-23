import Link from 'next/link';
import type { JSX } from 'react';

import { EditorialSection } from '@/components/content/EditorialSection';

export function RaceExplainer(): JSX.Element {
  return (
    <EditorialSection title="About the 3D race replay">
      <p>
        This replay reconstructs a real Formula 1 session in 3D from{' '}
        <strong>official timing and telemetry</strong>. Each car is placed on the
        circuit at its true position, so you can watch the lights go out, the
        pack funnel into the first corner, and the running order change lap by
        lap exactly as it happened on track.
      </p>
      <ul>
        <li>
          <strong>Follow any driver.</strong> Tap a car or pick a name from the
          list to lock onto it and open its live telemetry.
        </li>
        <li>
          <strong>Switch the camera.</strong> Choose a cinematic chase view or
          free-orbit the scene, and go fullscreen for the full effect.
        </li>
        <li>
          <strong>Read the race.</strong> Race-control messages and flags appear
          as they were shown, so you can see when a yellow, Safety Car, or red
          flag changed the picture.
        </li>
      </ul>
      <p>
        Want to understand what you’re watching? Our{' '}
        <Link href="/learn/flags">race flags guide</Link> decodes the marshals’
        signals, <Link href="/learn/tyres">tyres &amp; strategy</Link> explains
        the pit-stop calls, and the full{' '}
        <Link href="/learn">Learning Center</Link> covers the rest. You can also
        check the <Link href="/standings">current championship standings</Link>{' '}
        to see how each result adds up.
      </p>
      <p>
        Timing and telemetry are sourced from publicly available providers
        including FastF1 and the Ergast / Jolpica API. The first load of a
        session can take a moment while the data is fetched and cached.
      </p>
    </EditorialSection>
  );
}
