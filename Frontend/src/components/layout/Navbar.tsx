'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type JSX } from 'react';

import { ButtonLink } from '@/components/ui/ButtonLink';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils/cn';
import { useAuthStore } from '@/stores/use-auth-store';

import { MobileMenu, type NavLink } from './MobileMenu';
import { UserMenu } from './UserMenu';

const NAV_LINKS: ReadonlyArray<NavLink> = [
  { href: '/', label: 'Dashboard' },
  { href: '/race', label: 'Race Center' },
  { href: '/standings', label: 'Standings' },
  { href: '/history', label: 'History' },
  { href: '/learn', label: 'Learn' },
];

function isActive(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export function Navbar(): JSX.Element {
  const pathname = usePathname();
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  // The menu is open only on the route it was opened from, so any navigation
  // (link, back/forward) closes it without a sync effect.
  const [menuOpenedAt, setMenuOpenedAt] = useState<string | null>(null);
  const isMenuOpen = menuOpenedAt === pathname;

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-background/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-[100rem] items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span aria-hidden className="h-5 w-1 -skew-x-12 bg-primary" />
          <span className="font-display text-2xl uppercase tracking-wider text-heading">
            Formula <span className="text-primary">Stats</span>
          </span>
        </Link>

        <div className="hidden h-full items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex h-full items-center text-sm transition-colors',
                  active ? 'text-heading' : 'text-muted hover:text-foreground',
                )}
              >
                {link.label}
                {active ? (
                  <span aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-primary" />
                ) : null}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {status === 'loading' ? (
            <Spinner size="sm" />
          ) : status === 'authenticated' && user ? (
            <UserMenu user={user} />
          ) : (
            <ButtonLink href="/login" size="sm" variant="inverse" className="hidden sm:inline-flex">
              Sign in
            </ButtonLink>
          )}

          <button
            type="button"
            onClick={() => setMenuOpenedAt(pathname)}
            aria-label="Open menu"
            aria-expanded={isMenuOpen}
            className="glass-pill flex h-9 w-9 items-center justify-center rounded-full text-foreground transition hover:text-primary md:hidden"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </nav>

      <MobileMenu
        open={isMenuOpen}
        onClose={() => setMenuOpenedAt(null)}
        links={NAV_LINKS}
        pathname={pathname}
        isAuthenticated={status === 'authenticated'}
      />
    </header>
  );
}
