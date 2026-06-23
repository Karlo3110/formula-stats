import Link from 'next/link';
import type { JSX } from 'react';

import { EditorialSection } from '@/components/content/EditorialSection';

export function HomeExplainer(): JSX.Element {
  return (
    <EditorialSection title="What you can do on Formula Stats">
      <p>
        Formula Stats is an independent project built for people who want to{' '}
        <strong>understand</strong> Formula 1, not just watch it. We turn raw
        timing and telemetry into something you can read, explore and learn from
        — from a single corner of a single lap to a whole championship season.
        Everything here is free to use.
      </p>
      <ul>
        <li>
          <strong>
            <Link href="/race">Replay races in 3D.</Link>
          </strong>{' '}
          Watch real Grand Prix sessions reconstructed from official telemetry,
          follow any driver around the circuit, and see the order change in real
          time.
        </li>
        <li>
          <strong>
            <Link href="/standings">Follow the championship.</Link>
          </strong>{' '}
          Live drivers’ and constructors’ standings for the current season, plus
          a <Link href="/history">searchable archive</Link> of past seasons.
        </li>
        <li>
          <strong>
            <Link href="/learn">Learn the sport.</Link>
          </strong>{' '}
          Plain-language courses covering the{' '}
          <Link href="/learn/rulebook">rulebook</Link>,{' '}
          <Link href="/learn/aerodynamics">aerodynamics</Link>,{' '}
          <Link href="/learn/tyres">tyres &amp; strategy</Link>, the{' '}
          <Link href="/learn/power-unit">power unit</Link>,{' '}
          <Link href="/learn/flags">race flags</Link> and{' '}
          <Link href="/learn/penalties">penalties</Link>.
        </li>
      </ul>
      <p>
        The data comes from publicly available providers including FastF1 and the
        Ergast / Jolpica API. Formula Stats is a fan-made project and is not
        affiliated with, endorsed by, or associated with Formula 1, the FIA, or
        any team. Read more <Link href="/about">about the project</Link>.
      </p>
    </EditorialSection>
  );
}
