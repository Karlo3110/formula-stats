import type { Metadata } from 'next';
import type { JSX } from 'react';

import { LegalPage } from '@/components/content/LegalPage';
import { buildPageMetadata } from '@/lib/seo/page-metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Contact',
  description:
    'How to get in touch with the Formula Stats team — general questions, data corrections, and privacy requests.',
  path: '/contact',
});

export default function ContactPage(): JSX.Element {
  return (
    <LegalPage eyebrow="Contact" title="Contact Us" updated="20 June 2026">
      <section>
        <p>
          We’d genuinely like to hear from you. Whether you’ve spotted a bug,
          have a question about the data, want to suggest a feature, or need to
          make a privacy request, the best way to reach us is by email and we’ll
          get back to you as soon as we can.
        </p>
      </section>

      <section>
        <h2>General questions &amp; feedback</h2>
        <p>
          For anything about the site — features, bugs, partnerships, or
          feedback — email{' '}
          <a href="mailto:info@starcode.tech">info@starcode.tech</a>. We
          typically reply within a few business days.
        </p>
      </section>

      <section>
        <h2>Data accuracy &amp; corrections</h2>
        <p>
          Timing, telemetry, and standings come from publicly available
          providers including FastF1 and the Ergast / Jolpica API. If something
          looks wrong, let us know which session or driver is affected and we’ll
          investigate and re-check the source.
        </p>
      </section>

      <section>
        <h2>Privacy &amp; account requests</h2>
        <p>
          For data access, correction, or deletion requests, email{' '}
          <a href="mailto:info@starcode.tech">info@starcode.tech</a>. See our{' '}
          <a href="/privacy">Privacy Policy</a> for how we handle your data.
        </p>
      </section>

      <section>
        <h2>A note on independence</h2>
        <p>
          Formula Stats is an independent, fan-made project. It is not
          affiliated with, endorsed by, or associated with Formula 1, the FIA,
          Formula One Management, or any competing team, so we can’t help with
          official tickets, merchandise, or driver enquiries.
        </p>
      </section>
    </LegalPage>
  );
}
