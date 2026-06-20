import type { Metadata } from 'next';
import type { JSX } from 'react';

import { LegalPage } from '@/components/content/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How Formula Stats handles your data, cookies, and third-party advertising.',
};

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
        </ul>
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
        <h2>Your rights</h2>
        <p>
          You may request access to, correction of, or deletion of your account
          data at any time by contacting us. Deleting your account removes your
          personal data from our systems.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about this policy can be sent to{' '}
          <a href="mailto:privacy@formula-stats.com">privacy@formula-stats.com</a>.
        </p>
      </section>
    </LegalPage>
  );
}
