import type { JSX } from 'react';

/** Site-wide blurred-glow backdrop, behind all content. */
export function AmbientBackground(): JSX.Element {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background"
    >
      <div
        className="absolute -left-40 -top-48 h-[40rem] w-[40rem] rounded-full opacity-25 blur-[140px]"
        style={{ background: 'var(--color-primary)' }}
      />
      <div
        className="absolute -bottom-56 -right-44 h-[38rem] w-[38rem] rounded-full opacity-[0.18] blur-[150px]"
        style={{ background: 'var(--color-accent)' }}
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />
    </div>
  );
}
