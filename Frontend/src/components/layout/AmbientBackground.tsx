import type { JSX } from 'react';

const TOP_LIGHT =
  'radial-gradient(60% 45% at 50% -10%, color-mix(in oklab, var(--color-primary) 14%, transparent), transparent 70%)';
const GRID_FADE = 'linear-gradient(180deg, #000 0%, transparent 55%)';

/**
 * Restrained backdrop: a faint red pit-lane light from above over a fine
 * measurement grid that fades out down the page.
 */
export function AmbientBackground(): JSX.Element {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-background">
      <div
        className="bg-telemetry-grid absolute inset-0"
        style={{ maskImage: GRID_FADE, WebkitMaskImage: GRID_FADE }}
      />
      <div className="absolute inset-0" style={{ background: TOP_LIGHT }} />
    </div>
  );
}
