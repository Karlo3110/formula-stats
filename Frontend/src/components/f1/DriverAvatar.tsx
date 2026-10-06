'use client';

import Image from 'next/image';
import { useState, type CSSProperties, type JSX } from 'react';

import { initialsOf, safeImageUrl } from '@/lib/f1/media';
import { cn } from '@/lib/utils/cn';

type AvatarSize = 'sm' | 'md' | 'lg';

interface DriverAvatarProps {
  name: string;
  headshotUrl: string | null | undefined;
  teamColor?: string | null;
  size?: AvatarSize;
  className?: string;
}

const SIZE_STYLES: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-[0.6rem]',
  md: 'h-11 w-11 text-xs',
  lg: 'h-16 w-16 text-sm',
};

const SIZE_PIXELS: Record<AvatarSize, number> = { sm: 32, md: 44, lg: 64 };

const NEUTRAL_TINT = 'rgba(255,255,255,0.06)';

function tintStyle(teamColor: string | null | undefined): CSSProperties {
  // Team colours are API data, so they are applied inline rather than as tokens.
  return {
    background: teamColor ? `radial-gradient(circle at 50% 120%, ${teamColor}, transparent 75%)` : NEUTRAL_TINT,
    boxShadow: `inset 0 0 0 1px ${teamColor ? `${teamColor}66` : 'rgba(255,255,255,0.1)'}`,
  };
}

/** Round driver headshot on a team-colour tint; initials if no photo loads. */
export function DriverAvatar({ name, headshotUrl, teamColor, size = 'md', className }: DriverAvatarProps): JSX.Element {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const src = safeImageUrl(headshotUrl);
  const showPhoto = src !== null && src !== failedUrl;

  return (
    <span
      className={cn('relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold text-foreground/80', SIZE_STYLES[size], className)}
      style={tintStyle(teamColor)}
    >
      {showPhoto ? (
        <Image
          src={src}
          alt={name}
          width={SIZE_PIXELS[size]}
          height={SIZE_PIXELS[size]}
          className="h-full w-full object-cover object-top"
          onError={() => setFailedUrl(src)}
        />
      ) : (
        <span aria-label={name}>{initialsOf(name)}</span>
      )}
    </span>
  );
}
