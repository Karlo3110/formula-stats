'use client';

import Link from 'next/link';
import type { JSX } from 'react';

import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useAuthStore } from '@/stores/use-auth-store';

import { UserMenu } from './UserMenu';

const NAV_LINKS: ReadonlyArray<{ href: string; label: string }> = [
  { href: '/', label: 'Dashboard' },
];

export function Navbar(): JSX.Element {
  const status = useAuthStore((state) => state.status);
  const user = useAuthStore((state) => state.user);

  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-[100rem] items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="h-5 w-1.5 rounded-full bg-primary" />
          <span className="font-display text-2xl uppercase tracking-wider text-heading">
            Formula <span className="text-primary">Stats</span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted transition hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {status === 'loading' ? (
            <Spinner size="sm" />
          ) : status === 'authenticated' && user ? (
            <UserMenu user={user} />
          ) : (
            <Link href="/login">
              <Button size="sm">Sign in</Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
