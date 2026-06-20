'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type JSX } from 'react';

import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils/cn';
import { useAuthStore } from '@/stores/use-auth-store';

import { UserMenu } from './UserMenu';

const NAV_LINKS: ReadonlyArray<{ href: string; label: string }> = [
  { href: '/', label: 'Dashboard' },
  { href: '/race', label: 'Live Race' },
  { href: '/drivers', label: 'Drivers' },
  { href: '/history', label: 'History' },
  { href: '/learn', label: 'Learn' },
];

function isActive(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

function MenuIcon({ open }: { open: boolean }): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      {open ? (
        <path d="M6 6l12 12M18 6L6 18" />
      ) : (
        <path d="M4 7h16M4 12h16M4 17h16" />
      )}
    </svg>
  );
}

export function Navbar(): JSX.Element {
  const pathname = usePathname();
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-[100rem] items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-5 w-1.5 rounded-full bg-primary" />
          <span className="font-display text-2xl uppercase tracking-wider text-heading">
            Formula <span className="text-primary">Stats</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative rounded-full px-4 py-2 text-sm font-medium transition',
                  active
                    ? 'text-foreground'
                    : 'text-muted hover:text-foreground',
                )}
              >
                {active ? (
                  <span className="absolute inset-0 rounded-full bg-primary/15 ring-1 ring-primary/30" />
                ) : null}
                <span className="relative">{link.label}</span>
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
            <Link href="/login" className="hidden sm:block">
              <Button size="sm">Sign in</Button>
            </Link>
          )}

          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
            className="glass-pill flex h-9 w-9 items-center justify-center rounded-full text-foreground transition hover:text-primary md:hidden"
          >
            <MenuIcon open={isMenuOpen} />
          </button>
        </div>
      </nav>

      {isMenuOpen ? (
        <div className="border-t border-white/5 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-[100rem] flex-col px-4 py-3 sm:px-6">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'rounded-lg px-3 py-3 text-base font-medium transition',
                    active
                      ? 'bg-primary/15 text-foreground ring-1 ring-primary/30'
                      : 'text-muted hover:bg-white/5 hover:text-foreground',
                  )}
                >
                  {link.label}
                </Link>
              );
            })}

            {status === 'unauthenticated' ? (
              <Link href="/login" className="mt-2 sm:hidden">
                <Button size="lg" className="w-full">
                  Sign in
                </Button>
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}
