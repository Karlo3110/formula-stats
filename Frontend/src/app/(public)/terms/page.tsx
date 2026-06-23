import type { Metadata } from 'next';
import type { JSX } from 'react';

import { LegalPage } from '@/components/content/LegalPage';
import { buildPageMetadata } from '@/lib/seo/page-metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Terms of Service',
  description:
    'The terms that govern your use of Formula Stats, including acceptable use, data accuracy, advertising, and liability.',
  path: '/terms',
});

export default function TermsPage(): JSX.Element {
  return (
    <LegalPage eyebrow="Legal" title="Terms of Service" updated="20 June 2026">
      <section>
        <p>
          These Terms of Service (“Terms”) govern your access to and use of
          Formula Stats (the “Service”). By using the Service you agree to these
          Terms. If you do not agree, please do not use the Service.
        </p>
      </section>

      <section>
        <h2>Use of the service</h2>
        <p>
          We grant you a personal, non-exclusive, non-transferable, revocable
          licence to use the Service for your own non-commercial enjoyment of
          Formula 1 statistics and content. You agree not to:
        </p>
        <ul>
          <li>scrape, harvest, or bulk-download data except as expressly permitted;</li>
          <li>disrupt, overload, or attempt to gain unauthorised access to the Service;</li>
          <li>misuse the Service in any way that breaks the law or infringes others’ rights;</li>
          <li>
            remove, obscure, or interfere with any advertising or attribution
            shown on the site.
          </li>
        </ul>
      </section>

      <section>
        <h2>Accounts</h2>
        <p>
          Some features require an account. You are responsible for keeping your
          credentials secure and for activity that happens under your account.
          Tell us promptly if you suspect unauthorised use. You may delete your
          account at any time.
        </p>
      </section>

      <section>
        <h2>Data, intellectual property &amp; trademarks</h2>
        <p>
          Timing, telemetry, and standings are sourced from publicly available
          providers including FastF1 and the Ergast / Jolpica API, and remain
          the property of their respective owners. “Formula 1”, “F1”, related
          marks, team names, and logos are trademarks of their respective
          owners. Formula Stats is an independent project and is not affiliated
          with, endorsed by, or associated with Formula 1, the FIA, or any team.
          The site’s own design, text, and software are owned by Formula Stats.
        </p>
      </section>

      <section>
        <h2>Advertising</h2>
        <p>
          The Service is free to use and supported by advertising, including
          Google AdSense. Ads and any third-party links are provided by those
          third parties; we are not responsible for their content. See our{' '}
          <a href="/privacy">Privacy Policy</a> for how advertising cookies are
          used and how you can control them.
        </p>
      </section>

      <section>
        <h2>Disclaimer</h2>
        <p>
          The Service and all data are provided “as is” and “as available”,
          without warranties of any kind. Statistics and replays are for
          informational and entertainment purposes and may contain errors or
          delays; they are not official and should not be relied upon for
          betting, commercial, or other consequential decisions.
        </p>
      </section>

      <section>
        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, Formula Stats will not be
          liable for any indirect, incidental, or consequential damages, or for
          any loss arising from your use of, or inability to use, the Service.
        </p>
      </section>

      <section>
        <h2>Changes to these terms</h2>
        <p>
          We may update these Terms from time to time. When we do, we will
          revise the “last updated” date above. Continued use of the Service
          after changes take effect means you accept the revised Terms.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about these Terms? Reach us through our{' '}
          <a href="/contact">contact page</a>.
        </p>
      </section>
    </LegalPage>
  );
}
