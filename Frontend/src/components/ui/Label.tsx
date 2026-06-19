import type { JSX, LabelHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
}

export function Label({ className, children, ...rest }: LabelProps): JSX.Element {
  return (
    <label
      className={cn('text-sm font-medium text-foreground', className)}
      {...rest}
    >
      {children}
    </label>
  );
}
