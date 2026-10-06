import { FLAG_HOST, IMAGE_HOSTS } from './media-hosts';

/** API-provided image URL if it is HTTPS on an allowed host, else null. */
export function safeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && IMAGE_HOSTS.includes(parsed.hostname) ? parsed.toString() : null;
  } catch {
    return null;
  }
}

const SMALL_HEADSHOT = 'transform/1col/';
const LARGE_HEADSHOT = 'transform/4col/';

/** Official F1 headshots come in column sizes; request the large render for hero use. */
export function largeHeadshotUrl(url: string): string {
  return url.replace(SMALL_HEADSHOT, LARGE_HEADSHOT);
}

/** SVG flag for an ISO 3166-1 alpha-2 code. */
export function flagUrl(iso2: string): string {
  return `https://${FLAG_HOST}/${iso2.toLowerCase()}.svg`;
}

/** Initials for an avatar fallback: "Lando Norris" → "LN". */
export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');
}
