import type { JSX, ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

interface PanelProps {
  title?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function Panel({
  title,
  children,
  className,
  contentClassName,
}: PanelProps): JSX.Element {
  return (
    <section
      className={cn(
        'rounded-lg border border-border/70 bg-surface/60 backdrop-blur-sm',
        className,
      )}
    >
      {title ? (
        <header className="flex items-center gap-2 border-b border-border/50 px-4 py-2.5">
          <span className="h-3 w-1 rounded-full bg-primary" />
          <h2 className="text-xs font-semibold uppercase tracking-widest text-primary">
            {title}
          </h2>
        </header>
      ) : null}
      <div className={cn('p-4', contentClassName)}>{children}</div>
    </section>
  );
}
