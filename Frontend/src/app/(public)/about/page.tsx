import type { Metadata } from 'next';
import type { JSX } from 'react';

import { LegalPage } from '@/components/content/LegalPage';

export const metadata: Metadata = {
  title: 'About',
  description:
    'What Formula Stats is, who it is for, and where the data comes from.',
};

export default function AboutPage(): JSX.Element {
  return (
    <LegalPage eyebrow="About" title="About Formula Stats" updated="20 June 2026">
      <section>
        <p>
          Formula Stats is an independent project built for people who want to
          understand Formula 1, not just watch it. We turn raw timing and
          telemetry into something you can read, explore, and learn from — from
          a single corner of a single lap to a whole championship season.
        </p>
      </section>

      <section>
        <h2>What you can do here</h2>
        <ul>
          <li>
            <strong>Replay races in 3D.</strong> Watch real Grand Prix sessions
            reconstructed from official telemetry, follow any driver around the
            circuit, and see the order change in real time.
          </li>
          <li>
            <strong>Follow the championship.</strong> Driver and constructor
            standings, points, and wins for recent seasons.
          </li>
          <li>
            <strong>Learn the sport.</strong> Plain-language guides covering the
            rulebook, aerodynamics, tyres, the power unit, flags, and penalties.
          </li>
        </ul>
      </section>

      <section>
        <h2>Where the data comes from</h2>
        <p>
          Timing, telemetry, and standings are sourced from publicly available
          providers including FastF1 and the Ergast / Jolpica API. We cache and
          re-serve that data so the experience stays fast and reliable.
        </p>
      </section>

      <section>
        <h2>A note on independence</h2>
        <p>
          Formula Stats is a fan-made project. It is not affiliated with,
          endorsed by, or associated with Formula 1, the FIA, Formula One
          Management, or any competing team. All trademarks belong to their
          respective owners.
        </p>
      </section>

      <section>
        <h2>How we keep the lights on</h2>
        <p>
          The site is free to use. We show a small amount of advertising to
          cover hosting and data costs. You can read how we handle data and
          cookies in our{' '}
          <a href="/privacy">Privacy Policy</a>.
        </p>
      </section>
    </LegalPage>
  );
}
