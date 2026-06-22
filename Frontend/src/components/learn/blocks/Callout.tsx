import type { JSX } from 'react';

import { renderInline } from '@/components/learn/inline';
import type { CalloutTone } from '@/lib/learn/types';

interface CalloutProps {
  tone: CalloutTone;
  title: string;
  text: string;
}

interface ToneStyle {
  bar: string;
  label: string;
  glow: string;
  badge: string;
}

const TONE_STYLES: Record<CalloutTone, ToneStyle> = {
  key: {
    bar: 'bg-primary',
    label: 'text-primary',
    glow: 'from-primary/[0.08]',
    badge: 'Key idea',
  },
  info: {
    bar: 'bg-foreground/40',
    label: 'text-foreground/70',
    glow: 'from-foreground/[0.05]',
    badge: 'Good to know',
  },
  warning: {
    bar: 'bg-accent',
    label: 'text-accent',
    glow: 'from-accent/[0.08]',
    badge: 'Watch out',
  },
};

export function Callout({ tone, title, text }: CalloutProps): JSX.Element {
  const style = TONE_STYLES[tone];

  return (
    <aside className="relative overflow-hidden rounded-2xl border border-white/10 bg-surface/40">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${style.glow} to-transparent`}
      />
      <div className={`absolute inset-y-0 left-0 w-1 ${style.bar}`} />
      <div className="relative px-5 py-5 sm:px-7 sm:py-6">
        <p
          className={`text-[0.6rem] font-semibold uppercase tracking-[0.3em] ${style.label}`}
        >
          {style.badge}
        </p>
        <h3 className="mt-2 font-display text-xl uppercase leading-tight tracking-wide text-heading sm:text-2xl">
          {title}
        </h3>
        <p className="mt-2 text-base leading-relaxed text-foreground/75">
          {renderInline(text)}
        </p>
      </div>
    </aside>
  );
}
