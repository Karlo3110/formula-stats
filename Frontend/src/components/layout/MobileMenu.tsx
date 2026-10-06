'use client';

import Link from 'next/link';
import { useEffect, type JSX } from 'react';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';

export interface NavLink {
  href: string;
  label: string;
}

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  links: ReadonlyArray<NavLink>;
  pathname: string;
  isAuthenticated: boolean;
}

function isActive(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function MobileMenu({
  open,
  onClose,
  links,
  pathname,
  isAuthenticated,
}: MobileMenuProps): JSX.Element | null {
  // Lock background scroll while the menu is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    function handleKey(event: KeyboardEvent): void {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="fixed inset-0 z-50 md:hidden"
    >
      <div
        aria-hidden
        className="animate-menu-fade absolute inset-0 bg-background/95 backdrop-blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(90% 60% at 100% 0%, color-mix(in oklab, var(--color-primary) 16%, transparent), transparent 60%)',
        }}
      />

      <div className="relative flex h-[100dvh] flex-col">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <span aria-hidden className="h-5 w-1 -skew-x-12 bg-primary" />
            <span className="font-display text-2xl uppercase tracking-wider text-heading">
              Formula <span className="text-primary">Stats</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="glass-pill flex h-9 w-9 items-center justify-center rounded-full text-foreground transition hover:text-primary"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-1 flex-col justify-center gap-1 px-5 sm:px-6">
          {links.map((link, index) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                style={{ animationDelay: `${index * 45}ms` }}
                className="animate-menu-item group flex items-baseline gap-4 border-b border-white/5 py-4"
              >
                <span
                  className={cn(
                    'font-display text-base tabular-nums transition-colors',
                    active ? 'text-primary' : 'text-muted',
                  )}
                >
                  {pad(index + 1)}
                </span>
                <span
                  className={cn(
                    'font-display text-4xl uppercase leading-none tracking-tight transition-colors',
                    active
                      ? 'text-primary'
                      : 'text-heading group-hover:text-primary',
                  )}
                >
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {!isAuthenticated ? (
          <div className="px-5 pb-10 pt-4 sm:px-6">
            <Link href="/login" onClick={onClose}>
              <Button size="lg" className="w-full">
                Sign in
              </Button>
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
