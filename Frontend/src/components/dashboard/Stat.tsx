import type { JSX, ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

interface StatProps {
  label: string;
  value: ReactNode;
  className?: string;
  valueClassName?: string;
}

export function Stat({
  label,
  value,
  className,
  valueClassName,
}: StatProps): JSX.Element {
  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <span className="text-[0.65rem] uppercase tracking-wider text-muted">
        {label}
      </span>
      <span className={cn('text-base font-semibold text-foreground', valueClassName)}>
        {value}
      </span>
    </div>
  );
}
