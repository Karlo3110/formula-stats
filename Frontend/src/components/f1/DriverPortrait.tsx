'use client';

import Image from 'next/image';
import { useState, type JSX } from 'react';

import { largeHeadshotUrl, safeImageUrl } from '@/lib/f1/media';

interface DriverPortraitProps {
  name: string;
  headshotUrl: string | null | undefined;
  teamColor: string | null | undefined;
}

const PORTRAIT_SIZE = 440;

/**
 * Large cut-out driver photo over a team-colour glow, for hero sections.
 * Renders nothing if there is no photo, so the layout simply closes up.
 */
export function DriverPortrait({ name, headshotUrl, teamColor }: DriverPortraitProps): JSX.Element | null {
  const [hasFailed, setHasFailed] = useState(false);
  const src = safeImageUrl(headshotUrl);
  if (!src || hasFailed) {
    return null;
  }
  const glow = teamColor ?? 'var(--color-primary)';

  return (
    <div className="relative aspect-square w-full max-w-[22rem]">
      <div
        aria-hidden
        className="absolute inset-[12%] rounded-full opacity-50 blur-3xl"
        style={{ background: glow }}
      />
      <Image
        src={largeHeadshotUrl(src)}
        alt={name}
        width={PORTRAIT_SIZE}
        height={PORTRAIT_SIZE}
        priority
        className="relative h-full w-full object-contain object-bottom"
        onError={() => setHasFailed(true)}
      />
    </div>
  );
}
