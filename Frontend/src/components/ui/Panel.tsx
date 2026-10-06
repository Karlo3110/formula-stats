import type { JSX, ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

import { Eyebrow } from './Typography';

interface PanelProps {
  title?: string;
  /** Right-aligned header content (badge, count, toggle). */
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

/** Flat instrument panel with an optional monospaced title row. */
export function Panel({
  title,
  aside,
  children,
  className,
  bodyClassName,
}: PanelProps): JSX.Element {
  return (
    <section
      className={cn(
        'flex min-h-0 flex-col overflow-hidden rounded-xl border border-white/[0.08] bg-surface/80',
        className,
      )}
    >
      {title ? (
        <header className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
          <Eyebrow>{title}</Eyebrow>
          {aside}
        </header>
      ) : null}
      <div className={cn('min-h-0 flex-1', bodyClassName)}>{children}</div>
    </section>
  );
}
