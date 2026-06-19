import type { ButtonHTMLAttributes, JSX } from 'react';

import { cn } from '@/lib/utils/cn';

import { Spinner } from './Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const VARIANT_STYLES: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:opacity-90',
  secondary: 'bg-surface text-foreground border border-border hover:bg-elevated',
  ghost: 'text-foreground hover:bg-surface',
  destructive: 'bg-destructive text-destructive-foreground hover:opacity-90',
};

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-12 px-6 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  type = 'button',
  disabled,
  children,
  ...rest
}: ButtonProps): JSX.Element {
  return (
    <button
      type={type}
      disabled={disabled ?? isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none',
        VARIANT_STYLES[variant],
        SIZE_STYLES[size],
        className,
      )}
      {...rest}
    >
      {isLoading ? <Spinner size="sm" /> : null}
      {children}
    </button>
  );
}
