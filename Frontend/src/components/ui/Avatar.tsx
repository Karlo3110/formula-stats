import type { JSX } from 'react';

import { cn } from '@/lib/utils/cn';

interface AvatarProps {
  name: string;
  className?: string;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join('') || '?';
}

export function Avatar({ name, className }: AvatarProps): JSX.Element {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary ring-1 ring-primary/30',
        className,
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
