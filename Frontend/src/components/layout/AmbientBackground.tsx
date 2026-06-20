import type { JSX } from 'react';

/** Subtle, composed backdrop — soft brand glows and an edge vignette. */
export function AmbientBackground(): JSX.Element {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-background">
      <div
        className="absolute left-1/2 top-[-30%] h-[55rem] w-[80rem] -translate-x-1/2 rounded-full opacity-[0.16] blur-[180px]"
        style={{
          background:
            'radial-gradient(closest-side, var(--color-primary), transparent)',
        }}
      />
      <div
        className="absolute bottom-[-35%] right-[-15%] h-[45rem] w-[45rem] rounded-full opacity-[0.1] blur-[180px]"
        style={{
          background:
            'radial-gradient(closest-side, var(--color-accent), transparent)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(125% 125% at 50% 0%, transparent 55%, rgba(0,0,0,0.55) 100%)',
        }}
      />
    </div>
  );
}
