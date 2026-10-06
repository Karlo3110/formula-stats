import type { JSX } from 'react';

const TOP_LIGHT =
  'radial-gradient(60% 45% at 50% -10%, color-mix(in oklab, var(--color-primary) 14%, transparent), transparent 70%)';

/** Restrained backdrop: a faint primary-tinted light from above. */
export function AmbientBackground(): JSX.Element {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-background">
      <div className="absolute inset-0" style={{ background: TOP_LIGHT }} />
    </div>
  );
}
