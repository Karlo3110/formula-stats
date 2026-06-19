import type { HTMLAttributes, JSX } from 'react';

import { cn } from '@/lib/utils/cn';

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...rest }: CardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-surface p-6 shadow-lg shadow-black/20',
        className,
      )}
      {...rest}
    />
  );
}
