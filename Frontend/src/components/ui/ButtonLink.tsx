import Link from 'next/link';
import type { ComponentProps, JSX } from 'react';

import { cn } from '@/lib/utils/cn';

import { buttonStyles, type ButtonSize, type ButtonVariant } from './Button';

interface ButtonLinkProps extends ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/** A navigation link styled as a button (no nested <button> inside <a>). */
export function ButtonLink({
  variant = 'primary',
  size = 'md',
  className,
  ...rest
}: ButtonLinkProps): JSX.Element {
  return <Link className={cn(buttonStyles(variant, size), className)} {...rest} />;
}
