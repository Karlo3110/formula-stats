import type { Metadata } from 'next';
import type { JSX } from 'react';

import { LegalPage } from '@/components/content/LegalPage';
import { buildPageMetadata } from '@/lib/seo/page-metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Privacy Policy',
  description:
    'How Formula Stats handles your data, cookies, and third-party advertising.',
  path: '/privacy',
});

export default function PrivacyPage(): JSX.Element {
  return (
    <LegalPage eyebrow="Legal" title="Privacy Policy" updated="20 June 2026">
      <section>
        <p>
          This Privacy Policy explains what information Formula Stats
          (“we”, “us”) collects when you use this website, how we use it, and
          the choices you have. By using the site you agree to the practices
          described here.
        </p>
      </section>

      <section>
        <h2>Information we collect</h2>
        <p>
          We aim to collect as little personal data as possible. Depending on
          how you use the site, this may include:
        </p>
        <ul>
          <li>
            <strong>Account data:</strong> if you register, we store your email
            address and a securely hashed password. We never store your password
            in plain text.
          </li>
          <li>
            <strong>Usage data:</strong> standard server and analytics
            information such as pages visited, approximate region, browser type,
            and timestamps.
          </li>
          <li>
            <strong>Cookies and local storage:</strong> small files used to keep
            you signed in and to remember preferences.
          </li>
        </ul>
      </section>

      <section>
        <h2>How we use information</h2>
        <ul>
          <li>To provide and maintain the service, including authentication.</li>
          <li>To understand how the site is used so we can improve it.</li>
          <li>To send essential account emails such as verification and password resets.</li>
          <li>To display advertising that helps keep the site free.</li>
        </ul>
      </section>

      <section>
        <h2>Advertising and third-party cookies</h2>
        <p>
          We use Google AdSense to display advertisements. Third-party vendors,
          including Google, use cookies to serve ads based on a user’s prior
          visits to this and other websites.
        </p>
        <ul>
          <li>
            Google’s use of advertising cookies enables it and its partners to
            serve ads based on your visits to this site and/or other sites on
            the internet.
          </li>
          <li>
            You may opt out of personalised advertising by visiting{' '}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Ads Settings
            </a>
            .
          </li>
          <li>
            You can also opt out of third-party vendor cookies at{' '}
            <a
              href="https://www.aboutads.info/choices/"
              target="_blank"
              rel="noopener noreferrer"
            >
              aboutads.info
            </a>
            .
          </li>
          <li>
            More detail on how Google uses data when you use our site is
            available in{' '}
            <a
              href="https://policies.google.com/technologies/partner-sites"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google’s partner-sites policy
            </a>
            .
          </li>
        </ul>
        <p>
          When you first visit, we show a cookie notice so you can accept or
          decline non-essential cookies. Visitors in the European Economic Area,
          the UK, and Switzerland are additionally shown a consent message, as
          required by law, before personalised ads are served; where consent is
          declined, only non-personalised ads are shown.
        </p>
      </section>

      <section>
        <h2>Formula 1 data</h2>
        <p>
          Timing, telemetry, and standings shown on this site are sourced from
          publicly available providers including FastF1 and the Ergast / Jolpica
          API. Formula Stats is an independent project and is not affiliated
          with, endorsed by, or associated with Formula 1, the FIA, or any
          competing team.
        </p>
      </section>

      <section>
        <h2>Children’s privacy</h2>
        <p>
          Formula Stats is intended for a general audience and is not directed
          to children under the age of 13 (or the minimum age required in your
          country). We do not knowingly collect personal data from children. If
          you believe a child has provided us with personal data, contact us and
          we will delete it.
        </p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>
          You may request access to, correction of, or deletion of your account
          data at any time by contacting us. Deleting your account removes your
          personal data from our systems.
        </p>
      </section>

      <section>
        <h2>Changes to this policy</h2>
        <p>
          We may update this policy from time to time. When we do, we will
          revise the “last updated” date above. Significant changes will be
          highlighted on the site.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about this policy can be sent to{' '}
          <a href="mailto:info@starcode.tech">info@starcode.tech</a> or through
          our <a href="/contact">contact page</a>.
        </p>
      </section>
    </LegalPage>
  );
}
