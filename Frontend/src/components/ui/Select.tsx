import type { JSX, ReactNode, SelectHTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  children: ReactNode;
};

function ChevronIcon(): JSX.Element {
  return (
    <svg viewBox="0 0 24 24" className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Native select with a small caption above it; keyboard and screen-reader friendly by default. */
export function Select({ label, className, children, ...rest }: SelectProps): JSX.Element {
  return (
    <label className={cn('flex min-w-0 flex-col gap-1', className)}>
      <span className="font-mono text-[0.6rem] font-medium uppercase tracking-[0.16em] text-muted">{label}</span>
      <span className="relative">
        <select
          className={cn(
            'h-9 w-full appearance-none truncate rounded-md border border-white/10 bg-surface pl-3 pr-8 text-sm font-medium text-foreground transition',
            'hover:border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:pointer-events-none disabled:opacity-50',
          )}
          {...rest}
        >
          {children}
        </select>
        <ChevronIcon />
      </span>
    </label>
  );
}
