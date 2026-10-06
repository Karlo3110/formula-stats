import Image from 'next/image';
import type { JSX } from 'react';

import { flagUrl } from '@/lib/f1/media';
import { cn } from '@/lib/utils/cn';

type FlagSize = 'sm' | 'md' | 'lg';

interface CountryFlagProps {
  /** ISO 3166-1 alpha-2; nothing is rendered when null. */
  iso2: string | null;
  label: string;
  size?: FlagSize;
  className?: string;
}

const SIZE_STYLES: Record<FlagSize, string> = {
  sm: 'h-3 w-[1.125rem]',
  md: 'h-4 w-6',
  lg: 'h-6 w-9',
};

const SIZE_PIXELS: Record<FlagSize, { width: number; height: number }> = {
  sm: { width: 18, height: 12 },
  md: { width: 24, height: 16 },
  lg: { width: 36, height: 24 },
};

/** Small rectangular national flag (SVG, so it is never resized server-side). */
export function CountryFlag({ iso2, label, size = 'sm', className }: CountryFlagProps): JSX.Element | null {
  if (!iso2) {
    return null;
  }
  return (
    <Image
      src={flagUrl(iso2)}
      alt={`${label} flag`}
      title={label}
      {...SIZE_PIXELS[size]}
      className={cn('inline-block shrink-0 rounded-[2px] object-cover ring-1 ring-white/10', SIZE_STYLES[size], className)}
    />
  );
}
