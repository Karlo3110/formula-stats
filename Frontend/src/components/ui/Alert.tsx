import type { JSX, ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

type AlertVariant = 'error' | 'success' | 'info';

interface AlertProps {
  variant?: AlertVariant;
  children: ReactNode;
  className?: string;
}

const VARIANT_STYLES: Record<AlertVariant, string> = {
  error: 'border-destructive/40 bg-destructive/10 text-destructive-foreground',
  success: 'border-success/40 bg-success/10 text-foreground',
  info: 'border-border bg-elevated text-foreground',
};

export function Alert({
  variant = 'info',
  children,
  className,
}: AlertProps): JSX.Element {
  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-md border px-4 py-3 text-sm',
        VARIANT_STYLES[variant],
        className,
      )}
    >
      {children}
    </div>
  );
}
