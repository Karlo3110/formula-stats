import Link from 'next/link';
import type { JSX } from 'react';

const PRODUCT_LINKS: ReadonlyArray<{ href: string; label: string }> = [
  { href: '/', label: 'Dashboard' },
  { href: '/race', label: 'Live Race' },
  { href: '/standings', label: 'Standings' },
  { href: '/history', label: 'History' },
  { href: '/learn', label: 'Learn' },
];

const COMPANY_LINKS: ReadonlyArray<{ href: string; label: string }> = [
  { href: '/about', label: 'About' },
  { href: '/privacy', label: 'Privacy Policy' },
];

export function Footer(): JSX.Element {
  const currentYear = new Date().getUTCFullYear();

  return (
    <footer className="mt-24 border-t border-white/5 bg-background/40">
      <div className="mx-auto max-w-[100rem] px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-5 w-1.5 rounded-full bg-primary" />
              <span className="font-display text-2xl uppercase tracking-wider text-heading">
                Formula <span className="text-primary">Stats</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-foreground/55">
              Telemetry, standings, and 3D race replays for Formula 1 fans.
              Built for people who want to understand the sport, not just watch
              it.
            </p>
          </div>

          <nav aria-label="Product">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-muted">
              Explore
            </p>
            <ul className="mt-4 space-y-2">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/65 transition hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-muted">
              Company
            </p>
            <ul className="mt-4 space-y-2">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/65 transition hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/5 pt-6 text-xs text-foreground/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} Formula Stats. All rights reserved.</p>
          <p>
            Unofficial. Not associated with Formula 1, the FIA, or any team.
            Data via FastF1 and Ergast.
          </p>
        </div>
      </div>
    </footer>
  );
}
