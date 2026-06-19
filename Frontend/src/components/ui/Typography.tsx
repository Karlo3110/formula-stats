import type { JSX, ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

type HeadingLevel = 1 | 2 | 3 | 4;

interface HeadingProps {
  level: HeadingLevel;
  children: ReactNode;
  display?: boolean;
  className?: string;
}

const HEADING_STYLES: Record<HeadingLevel, string> = {
  1: 'text-4xl font-bold text-heading tracking-tight',
  2: 'text-3xl font-semibold text-heading tracking-tight',
  3: 'text-2xl font-semibold text-heading',
  4: 'text-xl font-medium text-heading',
};

export function Heading({
  level,
  children,
  display = false,
  className,
}: HeadingProps): JSX.Element {
  const Tag = `h${level}` as const;
  return (
    <Tag
      className={cn(
        HEADING_STYLES[level],
        display && 'font-display uppercase tracking-wider',
        className,
      )}
    >
      {children}
    </Tag>
  );
}

type TextVariant = 'body' | 'muted' | 'small' | 'label';

interface TextProps {
  variant?: TextVariant;
  children: ReactNode;
  className?: string;
}

const TEXT_STYLES: Record<TextVariant, string> = {
  body: 'text-base text-foreground leading-relaxed',
  muted: 'text-sm text-muted',
  small: 'text-xs text-muted',
  label: 'text-sm font-medium text-foreground',
};

export function Text({
  variant = 'body',
  children,
  className,
}: TextProps): JSX.Element {
  return <p className={cn(TEXT_STYLES[variant], className)}>{children}</p>;
}
